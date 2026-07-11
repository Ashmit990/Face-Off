from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.services.db import supabase
from fastapi import Depends
from app.services.auth_dependency import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
def signup(data: SignupRequest):
    try:
        result = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })
        return {
            "user_id": result.user.id if result.user else None,
            "email": result.user.email if result.user else None,
            "message": "Signup successful. Check email for confirmation if required."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login(data: LoginRequest):
    try:
        result = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
        return {
            "user_id": result.user.id,
            "email": result.user.email,
            "access_token": result.session.access_token,
            "refresh_token": result.session.refresh_token
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    


@router.get("/me")
def get_me(user_id: str = Depends(get_current_user)):
    # Fetch CV profile if it exists
    cv_result = supabase.table("cv_profiles").select("*").eq("user_id", user_id).execute()
    cv_profile = cv_result.data[0] if cv_result.data else None

    return {
        "user_id": user_id,
        "has_cv_profile": cv_profile is not None,
        "cv_profile": cv_profile
    }