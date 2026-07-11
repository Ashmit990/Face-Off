from langgraph.graph import StateGraph, END
from app.agent.state import InterviewState
from app.services.llm import generate_question, evaluate_answer, decide_next_move
from app.services.vector_store import get_next_unused_section, get_or_create_collection

MIN_QUESTIONS_BEFORE_WRAPUP = 8
MIN_SECTION_COVERAGE_RATIO = 0.75


def evaluate_answer_node(state: InterviewState) -> InterviewState:
    evaluation = evaluate_answer(state["last_question"], state["answer"], state["last_chunk"])
    state["evaluation"] = evaluation

    state["history"] = state["history"] + [{
        "question": state["last_question"],
        "answer": state["answer"],
        "score": evaluation.get("score")
    }]

    if state["last_section"] not in state["used_sections"]:
        state["used_sections"] = state["used_sections"] + [state["last_section"]]

    return state


def decide_next_move_node(state: InterviewState) -> InterviewState:
    decision = decide_next_move(state["history"], {}, questions_asked_count=len(state["history"]))

    questions_answered = len(state["history"])
    coverage_ratio = len(state["used_sections"]) / len(state["all_sections"]) if state["all_sections"] else 1.0

    can_wrap_up = (
        questions_answered >= MIN_QUESTIONS_BEFORE_WRAPUP
        and coverage_ratio >= MIN_SECTION_COVERAGE_RATIO
    )

    if decision["action"] == "wrap_up" and not can_wrap_up:
        decision = {
            "action": "pivot_topic",
            "reason": f"Not enough coverage yet ({len(state['used_sections'])}/{len(state['all_sections'])} sections, {questions_answered} questions)."
        }

    state["decision"] = decision["action"]
    state["wrap_up_reason"] = decision["reason"]
    state["should_wrap_up"] = decision["action"] == "wrap_up"

    return state


def route_after_decision(state: InterviewState) -> str:
    if state["should_wrap_up"]:
        return "wrap_up"
    return "prepare_next_question"


def prepare_next_question_node(state: InterviewState) -> InterviewState:
    if state["decision"] == "dig_deeper":
        next_chunk = state["last_chunk"]
        next_section = state["last_section"]
    else:  # pivot_topic
        result = get_next_unused_section(state["user_id"], state["used_sections"])
        if result:
            next_section, next_chunk = result
        else:
            # No sections left — check if we can still wrap up
            if len(state["history"]) >= MIN_QUESTIONS_BEFORE_WRAPUP:
                state["should_wrap_up"] = True
                state["wrap_up_reason"] = "All CV sections covered with sufficient depth."
                return state
            next_chunk = state["last_chunk"]
            next_section = state["last_section"]

    state["next_chunk"] = next_chunk
    state["next_section"] = next_section
    return state


def route_after_prepare(state: InterviewState) -> str:
    if state["should_wrap_up"]:
        return "wrap_up"
    return "generate_question"


def generate_question_node(state: InterviewState) -> InterviewState:
    question = generate_question(state["next_chunk"], state.get("job_description"))
    state["next_question"] = question
    state["turn_number"] = state["turn_number"] + 1
    state["status"] = "in_progress"
    return state


def wrap_up_node(state: InterviewState) -> InterviewState:
    state["status"] = "completed"
    state["should_wrap_up"] = True
    return state


def build_interview_graph():
    graph = StateGraph(InterviewState)

    graph.add_node("evaluate_answer", evaluate_answer_node)
    graph.add_node("decide_next_move", decide_next_move_node)
    graph.add_node("prepare_next_question", prepare_next_question_node)
    graph.add_node("generate_question", generate_question_node)
    graph.add_node("wrap_up", wrap_up_node)

    graph.set_entry_point("evaluate_answer")
    graph.add_edge("evaluate_answer", "decide_next_move")
    graph.add_conditional_edges("decide_next_move", route_after_decision, {
        "wrap_up": "wrap_up",
        "prepare_next_question": "prepare_next_question"
    })
    graph.add_conditional_edges("prepare_next_question", route_after_prepare, {
        "wrap_up": "wrap_up",
        "generate_question": "generate_question"
    })
    graph.add_edge("generate_question", END)
    graph.add_edge("wrap_up", END)

    return graph.compile()


interview_graph = build_interview_graph()