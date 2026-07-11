from app.services.db import supabase
from app.services.vector_store import get_chunk_by_section, query_relevant_chunk, get_next_unused_section, get_all_sections, get_or_create_collection
from app.services.llm import generate_question, evaluate_answer, decide_next_move, generate_session_feedback
import json

MIN_QUESTIONS_BEFORE_WRAPUP = 8
MIN_SECTION_COVERAGE_RATIO = 0.75  # must cover at least 75% of available sections


def _section_for_chunk(user_id: str, chunk_text: str) -> str:
    """Looks up which section a given chunk text belongs to."""
    collection, _ = get_or_create_collection(user_id)
    all_chunks = collection.get()
    for doc, meta in zip(all_chunks["documents"], all_chunks["metadatas"]):
        if doc == chunk_text:
            return meta["section"]
    return "unknown"


def start_interview(user_id: str) -> dict:
    profile_result = supabase.table("cv_profiles").select("*").eq("user_id", user_id).single().execute()
    if not profile_result.data:
        raise ValueError("No CV profile found for this user. Upload a CV first.")

    profile = profile_result.data
    job_description = profile.get("job_description")

    summary_chunk = get_chunk_by_section(user_id, "professional summary")
    if not summary_chunk:
        summary_chunk = get_chunk_by_section(user_id, "summary")
    if not summary_chunk:
        query_result = query_relevant_chunk(user_id, "professional summary background overview", n_results=1)
        # Guard against an empty Chroma result. This happens if the CV row exists
        # in Supabase but its embedded chunks are missing from the vector store —
        # e.g. after a container restart wiped a non-persistent Chroma volume,
        # or if chunk storage silently failed during upload. Without this check,
        # an empty result crashes with an unhandled IndexError (raw 500 to the
        # frontend) instead of a clear, catchable message.
        documents = query_result.get("documents") or []
        if not documents or not documents[0]:
            raise ValueError(
                "Your CV data couldn't be found in the question bank. "
                "Please re-upload your CV and try again."
            )
        summary_chunk = documents[0][0]

    section = _section_for_chunk(user_id, summary_chunk)
    question = generate_question(summary_chunk, job_description)

    session_result = supabase.table("sessions").insert({
        "user_id": user_id,
        "cv_profile_id": profile["id"],
        "job_description": job_description,
        "status": "in_progress"
    }).execute()
    session = session_result.data[0]

    supabase.table("messages").insert({
        "session_id": session["id"],
        "turn_number": 1,
        "question": question,
        "retrieved_chunk": summary_chunk,
        "section": section
    }).execute()

    return {
        "session_id": session["id"],
        "turn_number": 1,
        "question": question,
        "status": "in_progress"
    }


from app.agent.graph import interview_graph
from app.services.vector_store import get_all_sections
from app.services.llm import generate_session_feedback


def submit_answer(session_id: str, user_id: str, answer: str) -> dict:
    session_result = supabase.table("sessions").select("*").eq("id", session_id).eq("user_id", user_id).single().execute()
    if not session_result.data:
        raise ValueError("Session not found.")
    session = session_result.data

    if session["status"] == "completed":
        raise ValueError("This interview session has already ended.")

    messages_result = supabase.table("messages").select("*").eq("session_id", session_id).order("turn_number", desc=True).limit(1).execute()
    if not messages_result.data:
        raise ValueError("No question found for this session.")
    last_message = messages_result.data[0]

    all_messages = supabase.table("messages").select("*").eq("session_id", session_id).order("turn_number").execute().data
    history = [
        {"question": m["question"], "answer": m["answer"], "score": m["score"]}
        for m in all_messages if m["answer"] is not None
    ]
    used_sections = list(set(m["section"] for m in all_messages if m.get("section")))
    all_sections = get_all_sections(user_id)

    initial_state = {
        "user_id": user_id,
        "session_id": session_id,
        "job_description": session.get("job_description"),
        "last_question": last_message["question"],
        "last_chunk": last_message["retrieved_chunk"],
        "last_section": last_message.get("section", "unknown"),
        "answer": answer,
        "evaluation": {},
        "history": history,
        "used_sections": used_sections,
        "all_sections": all_sections,
        "decision": "",
        "next_question": "",
        "next_chunk": "",
        "next_section": "",
        "should_wrap_up": False,
        "wrap_up_reason": "",
        "detailed_feedback": None,
        "turn_number": last_message["turn_number"],
        "status": "in_progress"
    }

    result_state = interview_graph.invoke(initial_state)

    # Save the answer + evaluation to the message that was just answered
    supabase.table("messages").update({
        "answer": answer,
        "score": result_state["evaluation"].get("score"),
        "feedback": result_state["evaluation"].get("feedback")
    }).eq("id", last_message["id"]).execute()

    if result_state["status"] == "completed":
        detailed_feedback = generate_session_feedback(result_state["history"], session.get("job_description"))

        supabase.table("sessions").update({
            "status": "completed",
            "verdict": result_state["wrap_up_reason"],
            "overall_score": detailed_feedback.get("overall_score"),
            "detailed_feedback": detailed_feedback
        }).eq("id", session_id).execute()

        return {
            "session_id": session_id,
            "status": "completed",
            "wrap_up_reason": result_state["wrap_up_reason"],
            "evaluation": result_state["evaluation"],
            "sections_covered": result_state["used_sections"],
            "total_sections": result_state["all_sections"],
            "detailed_feedback": detailed_feedback
        }

    # Save the new question as the next message
    supabase.table("messages").insert({
        "session_id": session_id,
        "turn_number": result_state["turn_number"],
        "question": result_state["next_question"],
        "retrieved_chunk": result_state["next_chunk"],
        "section": result_state["next_section"]
    }).execute()

    return {
        "session_id": session_id,
        "turn_number": result_state["turn_number"],
        "question": result_state["next_question"],
        "status": "in_progress",
        "evaluation": result_state["evaluation"],
        "decision": result_state["decision"],
        "sections_covered": result_state["used_sections"],
        "total_sections": result_state["all_sections"]
    }

from app.services.llm import generate_global_feedback


def update_global_feedback(user_id: str) -> dict:
    """
    Fetches all completed sessions for this user and regenerates global 
    cross-session feedback, storing it in the global_feedback table.
    """
    sessions = supabase.table("sessions").select("*").eq("user_id", user_id).eq("status", "completed").order("started_at").execute().data

    if len(sessions) < 2:
        raise ValueError("Need at least 2 completed sessions to generate global feedback.")

    global_feedback = generate_global_feedback(sessions)

    # Upsert into global_feedback table
    existing = supabase.table("global_feedback").select("*").eq("user_id", user_id).execute().data

    if existing:
        supabase.table("global_feedback").update({
            "feedback_text": json.dumps(global_feedback),
            "sessions_analyzed": len(sessions)
        }).eq("user_id", user_id).execute()
    else:
        supabase.table("global_feedback").insert({
            "user_id": user_id,
            "feedback_text": json.dumps(global_feedback),
            "sessions_analyzed": len(sessions)
        }).execute()

    return global_feedback