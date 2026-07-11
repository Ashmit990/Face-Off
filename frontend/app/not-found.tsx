import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4 py-8 text-center">
      <div className="glass-card p-8 max-w-[400px] w-full animate-fade-up">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-elevated text-muted mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-ink mb-2">Page not found</h2>
        <p className="text-[13.5px] text-muted mb-6 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="btn-primary text-[13px] px-6">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
