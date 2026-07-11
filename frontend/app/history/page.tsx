"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { listSessions } from "@/lib/api";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSessions()
      .then((res) => setSessions(res.sessions || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-[820px]">
        {/* Header */}
        <div className="animate-fade-up mb-8">
          <div className="badge badge-green mb-4">
            <span className="badge-dot" />
            Session History
          </div>
          <h1 className="font-display text-[32px] font-bold tracking-tight text-ink mb-2">
            Past interviews
          </h1>
          <p className="text-[15px] text-subtle leading-relaxed">
            Every session you&apos;ve completed, most recent first.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-2 animate-fade-in">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-5 flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="skeleton h-3.5 w-24 rounded" />
                  <div className="skeleton h-3 w-64 rounded" />
                </div>
                <div className="skeleton h-3 w-16 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert-error animate-fade-in">{error}</div>
        )}

        {/* Empty state */}
        {!loading && sessions.length === 0 && (
          <div className="animate-fade-up glass-card p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-elevated text-muted mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-ink mb-2">No sessions yet</p>
            <p className="text-[13.5px] text-muted mb-5">Start your first mock interview to see your history here.</p>
            <Link href="/interview" className="btn-primary">
              Start first interview
            </Link>
          </div>
        )}

        {/* Session list */}
        {!loading && sessions.length > 0 && (
          <div className="flex flex-col gap-2 animate-fade-up">
            {sessions.map((s, i) => {
              const score = s.overall_score;
              const scoreColor =
                score === null ? "text-muted" :
                score >= 7 ? "text-accent" :
                score >= 5 ? "text-yellow-400" :
                "text-danger-400";
              return (
                <Link
                  key={s.id}
                  href={`/history/${s.id}`}
                  className="glass-card px-5 py-4 flex items-center gap-4 hover:border-border-hover transition-all group"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Score circle */}
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold font-display border ${
                    score === null
                      ? "bg-elevated border-border-subtle text-muted"
                      : score >= 7
                      ? "bg-brand-100 border-brand-200 text-accent"
                      : score >= 5
                      ? "bg-yellow-900/20 border-yellow-700/30 text-yellow-400"
                      : "bg-danger-100 border-danger-200 text-danger-400"
                  }`}>
                    {score ?? "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-[10.5px] font-semibold uppercase tracking-wider ${
                        s.status === "completed" ? "text-accent" : "text-danger-400"
                      }`}>
                        {s.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                      {score !== null && (
                        <span className="font-mono text-[10.5px] text-muted">{score}/10</span>
                      )}
                    </div>
                    <p className="text-[13.5px] text-muted line-clamp-1 max-w-[520px]">{s.verdict}</p>
                  </div>

                  <div className="flex items-center gap-2 text-[12px] text-muted ml-2 flex-shrink-0">
                    <span>{new Date(s.started_at).toLocaleDateString()}</span>
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
