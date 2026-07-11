import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import cv, auth, interview
 
app = FastAPI(title="Faceoff API")
 
# Reads allowed origins from env so prod (Vercel) and local dev both work
# without editing code. Comma-separated so you can add Vercel preview-deployment
# URLs later, e.g.:
#   CORS_ALLOWED_ORIGINS=https://faceoff.vercel.app,http://localhost:3000
allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
app.include_router(cv.router)
app.include_router(auth.router)
app.include_router(interview.router)
 
@app.get("/health")
def health():
    return {"status": "ok"}
 