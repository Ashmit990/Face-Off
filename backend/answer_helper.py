import sys
import requests

TOKEN = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjMwYjhmYzJiLWNjZGMtNGVhNC04NGY2LWFkZGU1ZThmM2U1MiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2Npd3NiZGR2dnZldm1oZGdreW1iLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIwZTc3ZDEwYS04YmM5LTQxMTgtODRiOS05YWZhNDg3NzAyMDciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgzNjUzNzU1LCJpYXQiOjE3ODM2NTAxNTUsImVtYWlsIjoiZmFjZW9mZi5nbG9iYWxAZXhhbXBsZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoiZmFjZW9mZi5nbG9iYWxAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiIwZTc3ZDEwYS04YmM5LTQxMTgtODRiOS05YWZhNDg3NzAyMDcifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc4MzY1MDE1NX1dLCJzZXNzaW9uX2lkIjoiMTM0ZTcwZDktYzllMC00NzU1LTliZTItM2VlOTc3ZDkxZjU4IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.G5oeqKOUip8oOCdF46S56FFuVSFTw56rt39cWeg5uTYXQ4NaxyHQTPLrLUaCTtffMgTLlfG-NVHxN4ETGRmeNQ"
BASE_URL = "http://localhost:8000"

def send_answer(session_id: str, answer: str):
    response = requests.post(
        f"{BASE_URL}/interview/answer",
        headers={"Authorization": f"Bearer {TOKEN}"},
        json={"session_id": session_id, "answer": answer}
    )
    print(response.status_code)
    print(response.json())

if __name__ == "__main__":
    session_id = sys.argv[1]
    answer = sys.argv[2]
    send_answer(session_id, answer)