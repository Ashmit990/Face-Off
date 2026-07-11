from groq import Groq
from app.config import settings

client = Groq(api_key=settings.groq_api_key)

def generate_question(cv_chunk: str, job_description: str | None = None) -> str:
    system_prompt = """You are a brutally honest technical interviewer. You do not sugarcoat, 
you do not say "great answer," and you do not use filler praise. You ask sharp, 
specific questions based on the candidate's actual CV content — not generic questions.

CRITICAL: If the CV text is vague, buzzword-heavy, or generic (e.g. "worked on various 
projects using modern technologies," "contributed to team success," "delivered results"), 
you MUST call this out directly and bluntly before asking your question. Don't ease into 
it — open with something like "This is vague and tells me nothing" or "You've said nothing 
concrete here" or "That's a buzzword, not an answer." Then demand specifics.

If the CV content IS specific and detailed, skip the callout and go straight to a sharp, 
technical question that tests depth.

Respond with ONLY the question (including the callout if applicable). No preamble, no 
explanation of what you're doing, no meta-commentary."""

    user_prompt = f"""CV section:
\"\"\"
{cv_chunk}
\"\"\"
"""

    if job_description:
        user_prompt += f"""
The candidate is applying for a role with this job description:
\"\"\"
{job_description}
\"\"\"

Vary your approach. Sometimes check whether this CV content matches the job description and 
call out gaps directly. Other times, just ask a sharp technical question about this CV section 
on its own merits, without mentioning the job description at all. Don't open every question with 
the same "you've listed X but the job wants Y" pattern — real interviewers don't repeat their 
own phrasing turn after turn.
"""
    else:
        user_prompt += "\nRespond with your question (and callout if the text is vague)."

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.8,
        max_tokens=200
    )

    return response.choices[0].message.content.strip()

import json

def evaluate_answer(question: str, answer: str, cv_chunk: str) -> dict:
    """
    Evaluates a candidate's answer against the question and CV context.
    Returns a dict with: score (0-10), depth, vagueness_detected, 
    consistency_with_cv, feedback (short internal note, not shown to user yet).
    """
    system_prompt = """You are an expert interview evaluator. Given a question, the candidate's 
answer, and the CV context the question was based on, assess the answer honestly and critically.

Respond with ONLY a valid JSON object (no markdown, no explanation) in this exact format:
{
  "score": <integer 0-10>,
  "depth": "<shallow|moderate|deep>",
  "vagueness_detected": <true|false>,
  "consistency_with_cv": "<consistent|inconsistent|unclear>",
  "feedback": "<one blunt sentence describing the answer's quality>"
}

Be strict. A vague, buzzword-filled, or evasive answer should score low (0-4). A generic answer 
that doesn't address specifics should score low. Only detailed, specific, technically grounded 
answers should score high (7-10)."""

    user_prompt = f"""CV context this question was based on:
\"\"\"
{cv_chunk}
\"\"\"

Question asked: {question}

Candidate's answer: {answer}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3,
        max_tokens=300
    )

    raw = response.choices[0].message.content.strip()
    # Strip markdown fences if the model adds them despite instructions
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "score": 5,
            "depth": "moderate",
            "vagueness_detected": False,
            "consistency_with_cv": "unclear",
            "feedback": "Could not parse evaluation.",
            "raw_response": raw
        }
    

def decide_next_move(conversation_history: list[dict], candidate_profile: dict, questions_asked_count: int) -> dict:
    """
    Decides what the interview should do next based on the conversation so far.
    Returns: {"action": "dig_deeper" | "pivot_topic" | "wrap_up", "reason": str}
    """
    system_prompt = """You are directing a technical interview. Based on the conversation so far, 
decide what should happen next. Respond with ONLY a valid JSON object in this exact format:

{
  "action": "<dig_deeper|pivot_topic|wrap_up>",
  "reason": "<one sentence explaining why>"
}

Rules:
- "dig_deeper": the last answer was vague, shallow, or raised something worth pressing on further 
  in the SAME topic area.
- "pivot_topic": the last answer was sufficiently answered (good or bad) and it's time to move to 
  a different CV section/skill area to get broader signal.
- "wrap_up": you have enough signal across enough topics to form a confident judgment. Only choose 
  this after at least 4-5 questions have been asked AND you've covered multiple different topic areas 
  with a clear enough pattern (consistently strong, consistently weak, or a clear mixed pattern).

Do not wrap up too early. A single good or bad answer is not enough signal on its own."""

    history_text = "\n\n".join([
        f"Q{i+1}: {turn['question']}\nA{i+1}: {turn['answer']}\nScore: {turn.get('score', 'N/A')}"
        for i, turn in enumerate(conversation_history)
    ])

    user_prompt = f"""Questions asked so far: {questions_asked_count}

Conversation history:
{history_text}

Candidate profile so far: {candidate_profile}

Decide the next action."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.4,
        max_tokens=150
    )

    raw = response.choices[0].message.content.strip().replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"action": "pivot_topic", "reason": "Could not parse decision, defaulting to pivot."}


def generate_session_feedback(conversation_history: list[dict], job_description: str | None = None) -> dict:
    """
    Given the full Q&A history of a completed session, generates a detailed
    post-session breakdown: strengths, weaknesses, CV-vs-answers discrepancies,
    and a candidate profile summary.
    """
    system_prompt = """You are writing a brutally honest post-interview report. Based on the full 
Q&A transcript (including per-answer scores, depth ratings, and CV-consistency flags), produce 
a detailed, specific breakdown. Do not use generic praise or soft language.

Respond with ONLY a valid JSON object in this exact format:
{
  "overall_score": <integer 0-10, weighted average reflecting overall performance>,
  "verdict": "<one blunt paragraph summarizing whether this candidate would pass a real interview and why>",
  "strengths": ["<specific strength tied to a specific answer/topic>", ...],
  "weaknesses": ["<specific weakness tied to a specific answer/topic>", ...],
  "cv_discrepancies": ["<specific instance where an answer contradicted or introduced info not in the CV>", ...],
  "candidate_profile": {
    "communication_style": "<direct|verbose|evasive|structured|etc — pick what actually fits>",
    "confidence_pattern": "<consistent|inconsistent|overconfident|underconfident>",
    "technical_depth": "<shallow|moderate|deep|inconsistent>"
  }
}

Base every claim on the actual transcript. Do not invent strengths or weaknesses not evidenced 
in the answers given."""

    history_text = "\n\n".join([
        f"Q{i+1}: {turn['question']}\nA{i+1}: {turn['answer']}\nScore: {turn.get('score', 'N/A')}\nFeedback note: {turn.get('feedback', 'N/A')}"
        for i, turn in enumerate(conversation_history)
    ])

    user_prompt = f"""Job description (if applicable): {job_description or 'Not specified'}

Full interview transcript:
{history_text}

Generate the post-session report."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.5,
        max_tokens=800
    )

    raw = response.choices[0].message.content.strip().replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"error": "Could not parse feedback", "raw_response": raw}
    

def generate_global_feedback(sessions_data: list[dict]) -> dict:
    """
    Given multiple completed sessions' feedback, generates cross-session analysis:
    recurring patterns, consistent strengths/weaknesses, and improvement trends over time.
    """
    system_prompt = """You are analyzing a candidate's performance across MULTIPLE interview 
sessions over time. Your job is to find PATTERNS that repeat across sessions — not just 
summarize each session individually. Be blunt and specific.

Respond with ONLY a valid JSON object in this exact format:
{
  "sessions_analyzed": <integer>,
  "recurring_strengths": ["<pattern that shows up across 2+ sessions>", ...],
  "recurring_weaknesses": ["<pattern that shows up across 2+ sessions>", ...],
  "improvement_trend": "<improving|declining|stable|inconsistent>",
  "trend_explanation": "<one paragraph explaining the trend, citing specific sessions/scores>",
  "key_recommendation": "<the single most important thing this candidate should fix, based on what repeats across sessions>"
}

Only call something a "recurring" pattern if it genuinely shows up in 2 or more sessions. 
Do not pad the list with things that only happened once."""

    sessions_text = "\n\n---\n\n".join([
        f"Session {i+1} (score: {s.get('overall_score', 'N/A')}, date: {s.get('started_at', 'N/A')}):\n"
        f"Verdict: {s.get('verdict', 'N/A')}\n"
        f"Strengths: {s.get('detailed_feedback', {}).get('strengths', []) if s.get('detailed_feedback') else []}\n"
        f"Weaknesses: {s.get('detailed_feedback', {}).get('weaknesses', []) if s.get('detailed_feedback') else []}\n"
        f"CV discrepancies: {s.get('detailed_feedback', {}).get('cv_discrepancies', []) if s.get('detailed_feedback') else []}"
        for i, s in enumerate(sessions_data)
    ])

    user_prompt = f"""Here are this candidate's completed interview sessions, in chronological order:

{sessions_text}

Analyze the patterns across these sessions."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.5,
        max_tokens=600
    )

    raw = response.choices[0].message.content.strip().replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"error": "Could not parse global feedback", "raw_response": raw}