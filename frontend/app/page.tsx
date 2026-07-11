"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth";
import { listSessions } from "@/lib/api";

export default function DashboardPage() {
  const { email, hasCvProfile } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSessions()
      .then((res) => setSessions(res.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const avgScore =
    completedCount > 0
      ? (
          sessions
            .filter((s) => s.overall_score !== null)
            .reduce((sum, s) => sum + s.overall_score, 0) / completedCount
        ).toFixed(1)
      : null;

  const firstName = email ? email.split("@")[0] : null;

  return (
    <ProtectedRoute>
      <div className="w-full max-w-[880px]">

        {/* ── Header ── */}
        <div className="animate-fade-up mb-8">
          <div className="badge badge-green mb-4">
            <span className="badge-dot" />
            Dashboard
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-[36px] font-bold tracking-tight leading-[1.15] text-ink mb-2">
                {firstName ? (
                  <>Welcome back, <span className="text-accent">{firstName}</span>.</>
                ) : (
                  "Welcome back."
                )}
              </h1>
              <p className="text-[15px] leading-relaxed text-subtle max-w-[500px]">
                {hasCvProfile
                  ? "Your prep is in motion. Keep sharpening your edge with every session."
                  : "Upload your CV to unlock AI-powered mock interviews tailored to you."}
              </p>
            </div>

            {/* Focus mode pill */}
            <div className="glass-card px-4 py-3 flex items-center gap-3 w-fit">
              <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
              <div>
                <div className="text-[13px] font-semibold text-ink">Focus Mode</div>
                <div className="text-[11.5px] text-muted mt-0.5">Practice with precision</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CV Banner ── */}
        {!hasCvProfile && (
          <div className="animate-fade-up stagger-1 mb-6">
            <div className="glass-card p-5 border-l-2 border-l-accent flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                 style={{ borderLeftColor: "var(--accent-primary)" }}>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-accent mt-0.5">
                  <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
                    <path d="M10 2v10M6 8l4-4 4 4M4 14v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-ink">Your profile is empty</div>
                  <div className="text-[13px] text-muted mt-0.5">Upload your CV to personalize every interview.</div>
                </div>
              </div>
              <Link href="/upload" className="btn-primary text-[13px]">
                Upload CV
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="animate-fade-up stagger-2 mb-8 grid gap-4 sm:grid-cols-3">
          {/* Sessions */}
          <div className="stat-card">
            <div className="stat-label">Sessions Done</div>
            {loading ? (
              <div className="skeleton h-7 w-12 rounded" />
            ) : (
              <div className="stat-value">{completedCount}</div>
            )}
            <p className="text-[12px] text-muted mt-2">
              {completedCount === 0 ? "No sessions yet" : completedCount === 1 ? "1 interview completed" : `${completedCount} interviews completed`}
            </p>
          </div>

          {/* Avg Score */}
          <div className="stat-card">
            <div className="stat-label">Avg Score</div>
            {loading ? (
              <div className="skeleton h-7 w-16 rounded" />
            ) : (
              <div className="stat-value">
                {avgScore ?? "—"}
                {avgScore && <span className="text-base font-normal text-muted ml-1">/10</span>}
              </div>
            )}
            <p className="text-[12px] text-muted mt-2">
              {avgScore ? "Across all sessions" : "Complete a session to score"}
            </p>
          </div>

          {/* CV Status */}
          <div className={`stat-card ${hasCvProfile ? "border-brand-200" : ""}`}>
            <div className="stat-label">CV Status</div>
            <div className={`stat-value text-2xl ${hasCvProfile ? "text-accent" : "text-subtle"}`}>
              {hasCvProfile ? "Ready" : "Missing"}
            </div>
            <p className="text-[12px] text-muted mt-2">
              {hasCvProfile ? "Profile is loaded" : "Upload your CV first"}
            </p>
          </div>
        </div>

        {/* ── Recent Activity ── */}
        {sessions.length > 0 && (
          <div className="animate-fade-up stagger-3 mb-8">
            <div className="section-divider">
              <span className="font-mono text-[10.5px] uppercase tracking-widest text-muted">Recent Sessions</span>
            </div>
            <div className="flex flex-col gap-2">
              {sessions.slice(0, 3).map((s, i) => (
                <Link
                  key={s.id}
                  href={`/history/${s.id}`}
                  className="glass-card px-5 py-4 flex items-center justify-between hover:border-border-hover transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold ${
                      s.status === "completed" ? "bg-brand-100 text-accent" : "bg-danger-100 text-danger-400"
                    }`}>
                      {s.overall_score ?? "—"}
                    </div>
                    <div>
                      <div className={`text-[12px] font-mono font-medium uppercase tracking-wider ${
                        s.status === "completed" ? "text-accent" : "text-danger-400"
                      }`}>
                        {s.status === "completed" ? "Completed" : "In Progress"}
                      </div>
                      <p className="text-[13px] text-muted line-clamp-1 max-w-[400px] mt-0.5">{s.verdict}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-muted ml-4 flex-shrink-0">
                    {new Date(s.started_at).toLocaleDateString()}
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="animate-fade-up stagger-4 flex flex-wrap gap-3">
          <Link href="/interview" className="btn-primary">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 6.5l5 3.5-5 3.5V6.5z" fill="currentColor" />
            </svg>
            Start Interview
          </Link>
          <Link href="/history" className="btn-secondary">
            View History
          </Link>
          {completedCount >= 2 && (
            <Link href="/global-feedback" className="btn-secondary">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <path d="M2 14l4-4 4 4 4-6 4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Global Insights
            </Link>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
