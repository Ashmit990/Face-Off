from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    groq_api_key: str
    supabase_url: str
    supabase_key: str
    langchain_api_key: Optional[str] = None
    langchain_tracing_v2: Optional[str] = None
    langchain_project: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()