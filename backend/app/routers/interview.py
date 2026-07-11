from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.interview import start_interview, submit_answer, update_global_feedback
from app.services.auth_dependency import get_current_user

router = APIRouter(prefix="/interview", tags=["interview"])


class AnswerRequest(BaseModel):
    session_id: str
    answer: str


@router.post("/start")
def start(user_id: str = Depends(get_current_user)):
    try:
        return start_interview(user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/answer")
def answer(data: AnswerRequest, user_id: str = Depends(get_current_user)):
    try:
        return submit_answer(data.session_id, user_id, data.answer)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

from app.services.db import supabase

@router.get("/session/{session_id}")
def get_session(session_id: str, user_id: str = Depends(get_current_user)):
    result = supabase.table("sessions").select("*").eq("id", session_id).eq("user_id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = supabase.table("messages").select("*").eq("session_id", session_id).order("turn_number").execute().data

    return {
        "session": result.data,
        "messages": messages
    }

@router.get("/global-feedback")
def get_global_feedback(user_id: str = Depends(get_current_user)):
    try:
        return update_global_feedback(user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.get("/sessions")
def list_sessions(user_id: str = Depends(get_current_user)):
    result = supabase.table("sessions").select("*").eq("user_id", user_id).order("started_at", desc=True).execute()
    return {
        "sessions": result.data
    }


from fastapi import UploadFile, File
from app.services.stt import transcribe_audio

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file")

    # Fetch candidate name hint from their CV profile
    name_hint = None
    profile_result = supabase.table("cv_profiles").select("candidate_name").eq("user_id", user_id).execute()
    if profile_result.data:
        name_hint = profile_result.data[0].get("candidate_name")

    try:
        text = transcribe_audio(file_bytes, filename=file.filename or "audio.webm", name_hint=name_hint)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    return {"transcript": text, "name_hint_used": name_hint}