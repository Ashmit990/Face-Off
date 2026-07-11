const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("faceoff_token");
}

async function request(
  path: string,
  options: RequestInit = {},
  requireAuth = true
) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore parse failure
    }
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  return res.json();
}

// ---------- Auth ----------
export async function signup(email: string, password: string) {
  return request(
    "/auth/signup",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    false
  );
}

export async function login(email: string, password: string) {
  return request(
    "/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    false
  );
}

export async function getMe() {
  return request("/auth/me");
}

// ---------- CV ----------
export async function uploadCV(file: File, jobDescription: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("file", file);
  if (jobDescription) formData.append("job_description", jobDescription);

  const res = await fetch(`${API_URL}/cv/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "CV upload failed");
  }

  return res.json();
}

// ---------- Interview ----------
export async function startInterview() {
  return request("/interview/start", { method: "POST" });
}

export async function submitAnswer(sessionId: string, answer: string) {
  return request("/interview/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, answer }),
  });
}

export async function getSession(sessionId: string) {
  return request(`/interview/session/${sessionId}`);
}

export async function listSessions() {
  return request("/interview/sessions");
}

export async function getGlobalFeedback() {
  return request("/interview/global-feedback");
}

export async function transcribeAudio(blob: Blob) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("file", blob, "answer.webm");

  const res = await fetch(`${API_URL}/interview/transcribe`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Transcription failed");
  }

  return res.json();
}
