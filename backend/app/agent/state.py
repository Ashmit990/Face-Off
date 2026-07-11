from typing import TypedDict, Optional, Literal

class InterviewState(TypedDict):
    user_id: str
    session_id: str
    job_description: Optional[str]

    last_question: str
    last_chunk: str
    last_section: str
    answer: str

    evaluation: dict
    history: list[dict]
    used_sections: list[str]
    all_sections: list[str]

    decision: str
    next_question: str
    next_chunk: str
    next_section: str

    should_wrap_up: bool
    wrap_up_reason: str
    detailed_feedback: Optional[dict]

    turn_number: int
    status: Literal["in_progress", "completed"]