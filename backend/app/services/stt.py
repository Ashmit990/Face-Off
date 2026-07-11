from groq import Groq
from app.config import settings

client = Groq(api_key=settings.groq_api_key)

def transcribe_audio(file_bytes: bytes, filename: str = "audio.webm", name_hint: str | None = None) -> str:
    """
    Transcribes audio bytes to text using Groq's Whisper API.
    Optionally biases recognition toward a known name/vocabulary via prompt hint.
    """
    prompt = None
    if name_hint:
        prompt = f"This is a technical interview. The candidate's name is {name_hint}."

    transcription = client.audio.transcriptions.create(
        file=(filename, file_bytes),
        model="whisper-large-v3-turbo",
        response_format="text",
        prompt=prompt
    )
    return transcription.strip() if isinstance(transcription, str) else transcription.text.strip()