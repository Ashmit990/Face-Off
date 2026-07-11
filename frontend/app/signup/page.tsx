"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, password);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-8">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent opacity-[0.04] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent opacity-[0.03] blur-[80px]" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative w-full max-w-[400px] animate-fade-up">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent shadow-button">
            <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
              <path d="M4 5l8 5-8 5V5z" fill="#09090b" />
              <path d="M13 5l4 5-4 5" stroke="#09090b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="font-display text-xl font-bold tracking-tight text-ink">
            Face<span className="text-accent">off</span>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-ink mb-2">Create account</h1>
            <p className="text-[14px] text-muted leading-relaxed">
              Upload once. Practice as many times as you want.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["CV-grounded questions", "Voice answers", "Real-time scoring"].map((feat) => (
              <span key={feat} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 border border-brand-200 text-[11.5px] font-medium text-accent">
                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {feat}
              </span>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="field-label" htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="signup-password">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPass ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-11"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-subtle transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? (
                    <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
                      <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
                      <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="text-[11.5px] text-danger-400 mt-1.5">Minimum 6 characters required</p>
              )}
            </div>

            {error && (
              <div className="alert-error animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              id="signup-submit"
              disabled={loading}
              className="btn-primary w-full mt-1"
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ borderTopColor: "#09090b" }} />
                  Creating account…
                </>
              ) : "Get started free"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-[13.5px] text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-accent font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
