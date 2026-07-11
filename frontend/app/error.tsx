"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App boundary error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4 py-8 text-center">
      <div className="glass-card p-8 max-w-[400px] w-full animate-fade-up">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-100 text-danger-400 mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-ink mb-2">Something went wrong</h2>
        <p className="text-[13.5px] text-muted mb-6 leading-relaxed">
          An unexpected error occurred during rendering.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => reset()} className="btn-primary text-[13px] px-5">
            Try again
          </button>
          <a href="/" className="btn-secondary text-[13px] px-5">
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
