from fastapi import Header, HTTPException
from app.services.db import supabase

def get_current_user(authorization: str = Header(...)) -> str:
    """
    Extracts and verifies the user from the Authorization header.
    Expects header format: "Bearer <access_token>"
    Returns the user's UUID if valid.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    token = authorization.replace("Bearer ", "").strip()

    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user_response.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")