"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getGlobalFeedback } from "@/lib/api";

const TREND_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  improving: { bg: "bg-brand-100 border-brand-200", text: "text-accent", dot: "bg-accent" },
  declining:  { bg: "bg-danger-100 border-danger-200", text: "text-danger-400", dot: "bg-danger-400" },
  stable:     { bg: "bg-elevated border-border", text: "text-subtle", dot: "bg-subtle" },
};

export default function GlobalFeedbackPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGlobalFeedback()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const trend = data?.improvement_trend?.toLowerCase() ?? "stable";
  const trendStyle = TREND_STYLES[trend] ?? TREND_STYLES.stable;

  return (
    <ProtectedRoute>
      <div className="max-w-[720px]">
        {/* Header */}
        <div className="animate-fade-up mb-8">
          <div className="badge badge-green mb-4">
            <span className="badge-dot" />
            Cross-Session Patterns
          </div>
          <h1 className="font-display text-[32px] font-bold tracking-tight text-ink mb-2">
            Global Feedback
          </h1>
          <p className="text-[15px] text-subtle leading-relaxed">
            Patterns that emerge across all your interviews — not just one session.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="glass-card p-6">
              <div className="skeleton h-4 w-24 rounded mb-4" />
              <div className="skeleton h-3 w-full rounded mb-2" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-card p-5">
                  <div className="skeleton h-3.5 w-28 rounded mb-4" />
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="skeleton h-3 w-full rounded mb-2" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="animate-fade-in glass-card p-8 text-center">
            <div className="text-3xl mb-3">📊</div>
            <p className="text-[15px] font-semibold text-ink mb-2">Not enough data yet</p>
            <p className="text-[13.5px] text-muted">
              {error.includes("at least 2")
                ? "You need at least 2 completed sessions before global patterns can be analyzed."
                : error}
            </p>
          </div>
        )}

        {/* Data */}
        {data && (
          <div className="flex flex-col gap-5 animate-fade-up">
            {/* Trend card */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-widest text-muted mb-1">Performance Trend</p>
                  <h2 className="font-display text-[22px] font-bold text-ink">Your trajectory</h2>
                </div>
                <div className={`flex items-center gap-2 px-3.5 py-2 rounded-full border font-mono text-[11.5px] font-semibold uppercase tracking-wider ${trendStyle.bg} ${trendStyle.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${trendStyle.dot}`} />
                  {data.improvement_trend}
                </div>
              </div>
              <p className="text-[14px] text-subtle leading-relaxed">{data.trend_explanation}</p>
            </div>

            {/* Strengths + Weaknesses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <h3 className="text-[12px] font-mono uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Recurring Strengths
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {data.recurring_strengths?.map((s: string, i: number) => (
                    <li key={i} className="text-[13px] text-subtle flex gap-2 leading-snug">
                      <span className="text-accent flex-shrink-0 font-semibold">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-[12px] font-mono uppercase tracking-widest text-danger-400 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger-400" />
                  Recurring Weaknesses
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {data.recurring_weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="text-[13px] text-subtle flex gap-2 leading-snug">
                      <span className="text-danger-400 flex-shrink-0 font-semibold">−</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Key recommendation */}
            <div className="glow-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-accent">
                  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                    <path d="M10 2a7 7 0 100 14 7 7 0 000-14z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 10V7M10 13h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-[13px] font-semibold text-accent font-mono uppercase tracking-wider">
                  Key Recommendation
                </h3>
              </div>
              <p className="text-[14.5px] text-subtle leading-relaxed">{data.key_recommendation}</p>
            </div>

            {/* Meta */}
            <p className="font-mono text-[11px] text-muted">
              Based on {data.sessions_analyzed} completed session{data.sessions_analyzed !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
