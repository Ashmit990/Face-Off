"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getSession } from "@/lib/api";

function ScoreBadge({ score }: { score: number }) {
  const colorClass =
    score >= 7 ? "bg-brand-100 text-accent border-brand-200" :
    score >= 5 ? "bg-yellow-900/20 text-yellow-400 border-yellow-700/30" :
    "bg-danger-100 text-danger-400 border-danger-200";
  return (
    <span className={`inline-flex items-center font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full border ${colorClass}`}>
      {score}/10
    </span>
  );
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSession(sessionId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <ProtectedRoute>
      <div className="max-w-[720px]">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink transition-colors mb-6 group"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to history
        </Link>

        {loading && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="glass-card p-8 text-center">
              <div className="skeleton h-16 w-16 rounded-2xl mx-auto mb-4" />
              <div className="skeleton h-5 w-32 rounded mx-auto mb-2" />
              <div className="skeleton h-4 w-48 rounded mx-auto" />
            </div>
          </div>
        )}

        {error && (
          <div className="alert-error animate-fade-in">{error}</div>
        )}

        {data && (
          <div className="animate-fade-up">
            <div className="badge badge-green mb-4">
              <span className="badge-dot" />
              {data.session.status === "completed" ? "Completed" : "In Progress"}
            </div>

            {data.session.overall_score !== null ? (
              <div className="glass-card p-8 mb-6 text-center">
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted mb-3">Overall Score</p>
                <div className={`font-display text-[72px] font-bold leading-none mb-2 ${
                  data.session.overall_score >= 7 ? "text-accent" :
                  data.session.overall_score >= 5 ? "text-yellow-400" :
                  "text-danger-400"
                }`}>
                  {data.session.overall_score}
                </div>
                <p className="text-[14px] text-muted">/10</p>
                {data.session.verdict && (
                  <p className="mt-4 text-[14px] text-subtle leading-relaxed max-w-[500px] mx-auto">
                    {data.session.verdict}
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-6">
                <h1 className="font-display text-[32px] font-bold text-ink mb-2">Session Detail</h1>
                {data.session.verdict && (
                  <p className="text-[15px] text-subtle leading-relaxed">{data.session.verdict}</p>
                )}
              </div>
            )}

            {data.session.detailed_feedback && (
              <div className="flex flex-col gap-4 mb-8">
                <div className="glass-card p-6">
                  <h3 className="text-[12px] font-mono uppercase tracking-widest text-muted mb-3">Verdict</h3>
                  <p className="text-[14px] text-subtle leading-relaxed">
                    {data.session.detailed_feedback.verdict}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-5">
                    <h3 className="text-[12px] font-mono uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Strengths
                    </h3>
                    <ul className="flex flex-col gap-2.5">
                      {data.session.detailed_feedback.strengths?.map((s: string, i: number) => (
                        <li key={i} className="text-[13px] text-subtle flex gap-2 leading-snug">
                          <span className="text-accent flex-shrink-0">+</span>
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
                      {data.session.detailed_feedback.weaknesses?.map((w: string, i: number) => (
                        <li key={i} className="text-[13px] text-subtle flex gap-2 leading-snug">
                          <span className="text-danger-400 flex-shrink-0">&#8722;</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="section-divider">
                <span className="font-mono text-[10.5px] uppercase tracking-widest text-muted">Full Transcript</span>
              </div>
              <div className="flex flex-col gap-4">
                {data.messages.map((m: any, i: number) => (
                  <div key={m.id} className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-[10.5px] text-muted uppercase tracking-wider">
                        Turn {m.turn_number}
                      </span>
                      {typeof m.score === "number" && <ScoreBadge score={m.score} />}
                      {m.section && (
                        <span className="font-mono text-[10.5px] bg-brand-100 text-accent border border-brand-200 px-2.5 py-1 rounded-full">
                          {m.section}
                        </span>
                      )}
                      <div className="flex-1 h-px bg-border-subtle" />
                    </div>
                    <p className="text-[14px] font-semibold text-ink mb-3 leading-snug">{m.question}</p>
                    {m.answer && (
                      <p className="text-[13.5px] text-subtle mb-3 leading-relaxed">{m.answer}</p>
                    )}
                    {m.feedback && (
                      <div className="border-t border-border-subtle pt-3 mt-1">
                        <p className="text-[12.5px] text-muted italic leading-relaxed">{m.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}