# Faceoff Frontend

Next.js (App Router, TypeScript, Tailwind) frontend for Faceoff, wired directly to your
FastAPI backend. No Supabase client needed on this side — all auth and data calls go
through your backend's `/auth` and `/interview` and `/cv` endpoints.

## Setup

1. Copy this whole `frontend` folder into `C:\AI\FaceOff\frontend`, replacing/merging
   with anything already there.

2. Install dependencies:
   ```powershell
   cd C:\AI\FaceOff\frontend
   npm install
   ```

3. Create your real env file:
   ```powershell
   copy .env.local.example .env.local
   ```
   Open `.env.local` and confirm it points at your running backend:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Make sure your backend is running in another terminal:
   ```powershell
   cd C:\AI\FaceOff\backend
   venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload
   ```

5. Start the frontend:
   ```powershell
   npm run dev
   ```

6. Open `http://localhost:3000` — you should land on the login page.

## What's wired up

- **Signup / Login** (`/signup`, `/login`) — calls your `/auth/signup` and `/auth/login`,
  stores the access token in `localStorage`.
- **Dashboard** (`/`) — session count, average score, quick links.
- **CV Upload** (`/upload`) — calls `/cv/upload`, optional job description.
- **Interview** (`/interview`) — calls `/interview/start` and `/interview/answer` in a
  loop, shows evaluation per turn, renders the full feedback report on wrap-up. Includes
  a voice recorder that calls `/interview/transcribe` and fills the answer box with the
  transcript for you to review/edit before submitting — matching your "voice or typing,
  their choice" spec.
- **Session History** (`/history`, `/history/[id]`) — lists all sessions, click into one
  for the full transcript + detailed feedback.
- **Global Feedback** (`/global-feedback`) — cross-session patterns, needs 2+ completed
  sessions or it'll show a friendly "keep practicing" message instead of an error.

## Notes

- Auth token lives in `localStorage` under `faceoff_token` — this is a real local app on
  your machine, not a Claude-hosted artifact, so `localStorage` is fine here.
- If your Supabase JWT expiry is still ~1 hour, you'll need to log in again periodically
  during long testing sessions — same as we hit in backend testing.
- Voice recording requires microphone permission in the browser and works over
  `localhost` without HTTPS.
