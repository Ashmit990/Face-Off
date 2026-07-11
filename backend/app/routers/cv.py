from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Optional
from app.services.cv_parser import extract_text_from_pdf
from app.services.chunker import chunk_cv_text
from app.services.vector_store import store_cv_chunks
from app.services.db import supabase
from app.services.auth_dependency import get_current_user

router = APIRouter(prefix="/cv", tags=["cv"])

@router.post("/upload")
async def upload_cv(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    user_id: str = Depends(get_current_user)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    text = extract_text_from_pdf(file_bytes)

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    chunks = chunk_cv_text(text)
    collection_name = store_cv_chunks(user_id, chunks)

    summary_chunk = next((c["text"] for c in chunks if c["section"] in ("professional summary", "summary")), text[:500])

    # Extract candidate name: first non-empty line of raw CV text, if it looks name-like
    first_line = text.strip().split("\n")[0].strip()
    candidate_name = first_line if first_line and len(first_line.split()) <= 4 else None

    result = supabase.table("cv_profiles").upsert({
        "user_id": user_id,
        "original_filename": file.filename,
        "cv_summary": summary_chunk,
        "chroma_collection_name": collection_name,
        "job_description": job_description,
        "candidate_name": candidate_name
    }, on_conflict="user_id").execute()

    return {
        "filename": file.filename,
        "char_count": len(text),
        "sections_found": [c["section"] for c in chunks],
        "chroma_collection": collection_name,
        "job_description_provided": job_description is not None,
        "cv_profile_id": result.data[0]["id"] if result.data else None,
        "candidate_name": candidate_name
    }