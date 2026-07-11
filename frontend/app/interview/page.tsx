"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AudioRecorder from "@/components/AudioRecorder";
import { startInterview, submitAnswer } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

type Turn = {
  question: string;
  answer?: string;
  score?: number;
  feedback?: string;
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 7 ? "bg-brand-100 text-accent border-brand-200" :
    score >= 5 ? "bg-yellow-900/20 text-yellow-400 border-yellow-700/30" :
    "bg-danger-100 text-danger-400 border-danger-200";
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full border ${color}`}>
      {score}/10
    </span>
  );
}

export default function InterviewPage() {
  const { hasCvProfile } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [wrapUpReason, setWrapUpReason] = useState<string | null>(null);
  const [detailedFeedback, setDetailedFeedback] = useState<any>(null);

  async function handleStart() {
    setError(null);
    setLoading(true);
    try {
      const res = await startInterview();
      setSessionId(res.session_id);
      setTurns([{ question: res.question }]);
    } catch (err: any) {
      setError(err.message || "Could not start interview");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!sessionId || !currentAnswer.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await submitAnswer(sessionId, currentAnswer);

      setTurns((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        last.answer = currentAnswer;
        last.score = res.evaluation?.score;
        last.feedback = res.evaluation?.feedback;
        return updated;
      });

      setCurrentAnswer("");

      if (res.status === "completed") {
        setCompleted(true);
        setWrapUpReason(res.wrap_up_reason);
        setDetailedFeedback(res.detailed_feedback);
      } else {
        setTurns((prev) => [...prev, { question: res.question }]);
      }
    } catch (err: any) {
      setError(err.message || "Could not submit answer");
    } finally {
      setLoading(false);
    }
  }

  // ── Not started ──
  if (!sessionId) {
    return (
      <ProtectedRoute>
        <div className="max-w-[600px]">
          <div className="animate-fade-up">
            <div className="badge badge-green mb-4">
              <span className="badge-dot" />
              New Interview
            </div>
            <h1 className="font-display text-[32px] font-bold tracking-tight text-ink mb-3">
              Ready when you are.
            </h1>
            <p className="text-[15px] leading-relaxed text-subtle mb-8 max-w-[480px]">
              No fixed length — Faceoff asks questions grounded in your CV and keeps going until it has enough signal to give you a real verdict.
            </p>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: "🎯", label: "CV-grounded", desc: "Questions based on your real experience" },
                { icon: "⚡", label: "Live scoring", desc: "Instant feedback on every answer" },
                { icon: "📊", label: "Full report", desc: "Detailed verdict when you're done" },
              ].map((item) => (
                <div key={item.label} className="glass-card p-4 text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-[13px] font-semibold text-ink mb-1">{item.label}</div>
                  <div className="text-[11.5px] text-muted leading-snug">{item.desc}</div>
                </div>
              ))}
            </div>

            {!hasCvProfile && (
              <div className="alert-error mb-5 flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 flex-shrink-0">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 6v5M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>
                  No CV uploaded.{" "}
                  <Link href="/upload" className="font-semibold underline">
                    Upload one first
                  </Link>
                  .
                </span>
              </div>
            )}

            {error && <div className="alert-error mb-5 animate-fade-in">{error}</div>}

            <button
              id="start-interview-btn"
              onClick={handleStart}
              disabled={loading || !hasCvProfile}
              className="btn-primary text-[15px] px-7 py-3.5"
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ borderTopColor: "#09090b" }} />
                  Starting…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 6.5l5 3.5-5 3.5V6.5z" fill="currentColor" />
                  </svg>
                  Start Interview
                </>
              )}
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ── Completed ──
  if (completed) {
    const score = detailedFeedback?.overall_score;
    const scoreColor = score >= 7 ? "text-accent" : score >= 5 ? "text-yellow-400" : "text-danger-400";

    return (
      <ProtectedRoute>
        <div className="max-w-[720px]">
          <div className="animate-fade-up">
            <div className="badge badge-green mb-4">
              <span className="badge-dot" />
              Session Complete
            </div>

            {/* Score hero */}
            <div className="glass-card p-8 mb-6 text-center">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted mb-3">Overall Score</p>
              <div className={`font-display text-[72px] font-bold leading-none mb-2 ${scoreColor}`}>
                {score ?? "—"}
              </div>
              <p className="text-[14px] text-muted">/10 · {turns.length} question{turns.length !== 1 ? "s" : ""}</p>
              {wrapUpReason && (
                <p className="mt-4 text-[14px] text-subtle leading-relaxed max-w-[500px] mx-auto">{wrapUpReason}</p>
              )}
            </div>

            {detailedFeedback && (
              <div className="flex flex-col gap-4 animate-fade-up stagger-1">
                {/* Verdict */}
                <div className="glass-card p-6">
                  <h3 className="text-[13px] font-mono uppercase tracking-widest text-muted mb-3">Verdict</h3>
                  <p className="text-[14.5px] text-subtle leading-relaxed">{detailedFeedback.verdict}</p>
                </div>

                {/* Strengths + Weaknesses */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-5">
                    <h3 className="text-[12px] font-mono uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Strengths
                    </h3>
                    <ul className="flex flex-col gap-2.5">
                      {detailedFeedback.strengths?.map((s: string, i: number) => (
                        <li key={i} className="text-[13px] text-subtle flex gap-2 leading-snug">
                          <span className="text-accent flex-shrink-0 mt-0.5">+</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-card p-5">
                    <h3 className="text-[12px] font-mono uppercase tracking-widest text-danger-400 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger-400" />
                      Weaknesses
                    </h3>
                    <ul className="flex flex-col gap-2.5">
                      {detailedFeedback.weaknesses?.map((w: string, i: number) => (
                        <li key={i} className="text-[13px] text-subtle flex gap-2 leading-snug">
                          <span className="text-danger-400 flex-shrink-0 mt-0.5">−</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CV discrepancies */}
                {detailedFeedback.cv_discrepancies?.length > 0 && (
                  <div className="glass-card p-5 border-danger-200">
                    <h3 className="text-[12px] font-mono uppercase tracking-widest text-danger-400 mb-3">
                      CV Discrepancies
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {detailedFeedback.cv_discrepancies.map((d: string, i: number) => (
                        <li key={i} className="text-[13px] text-danger-400 flex gap-2">
                          <span>⚠</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/history" className="btn-primary">
                    View Full History
                  </Link>
                  <Link href="/interview" className="btn-secondary">
                    Practice Again
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ── In progress ──
  const current = turns[turns.length - 1];
  const charCount = currentAnswer.length;

  return (
    <ProtectedRoute>
      <div className="max-w-[700px]">
        {/* Progress bar */}
        <div className="animate-fade-up mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {turns.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i < turns.length - 1
                    ? "w-6 bg-accent"
                    : "w-10 bg-accent opacity-40"
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-[11px] text-muted uppercase tracking-widest">
            Turn {turns.length}
          </span>
        </div>

        {/* Past turns */}
        <div className="flex flex-col gap-3 mb-5">
          {turns.slice(0, -1).map((t, i) => (
            <div key={i} className="glass-card p-5 opacity-50 hover:opacity-70 transition-opacity">
              <div className="flex items-start gap-3">
                <span className="font-mono text-[10.5px] text-muted uppercase tracking-wider flex-shrink-0 mt-0.5">Q{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-ink mb-2">{t.question}</p>
                  {t.answer && (
                    <p className="text-[13px] text-muted mb-2 leading-relaxed">{t.answer}</p>
                  )}
                  <div className="flex items-center gap-2">
                    {typeof t.score === "number" && <ScoreBadge score={t.score} />}
                    {t.feedback && (
                      <span className="text-[12px] text-muted italic line-clamp-1">{t.feedback}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current question card */}
        <div className="glass-card p-7 animate-fade-up">
          <div className="flex items-center gap-2 mb-5">
            <span className="font-mono text-[10.5px] text-muted uppercase tracking-wider">Question {turns.length}</span>
            <div className="flex-1 h-px bg-border-subtle" />
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>

          <p className="font-display text-[18px] font-semibold text-ink leading-snug mb-6">
            {current.question}
          </p>

          <div className="mb-4">
            <div className="relative">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={5}
                placeholder="Type your answer, or record it with your voice below…"
                className="input-field"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
                }}
              />
              {charCount > 0 && (
                <span className="absolute bottom-2.5 right-3 font-mono text-[10.5px] text-muted">
                  {charCount} chars
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted mt-1.5">Tip: Ctrl+Enter to submit</p>
          </div>

          {error && <div className="alert-error mb-4 animate-fade-in">{error}</div>}

          <div className="flex items-center justify-between gap-4">
            <AudioRecorder onTranscript={(text) => setCurrentAnswer(text)} />
            <button
              id="submit-answer-btn"
              onClick={handleSubmit}
              disabled={loading || !currentAnswer.trim()}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ borderTopColor: "#09090b" }} />
                  Evaluating…
                </>
              ) : (
                <>
                  Submit Answer
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
