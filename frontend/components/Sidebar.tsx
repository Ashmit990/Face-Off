"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <rect x="2" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    href: "/upload",
    label: "Your CV",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <path d="M10 13V4M6 7l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/interview",
    label: "New Interview",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "Session History",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <path d="M4 6h12M4 10h8M4 14h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/global-feedback",
    label: "Global Feedback",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
        <path d="M2 14l4-4 4 4 4-6 4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { email, logout } = useAuth();

  const initials = email ? email.slice(0, 2).toUpperCase() : "??";

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col bg-[#0c0c0e] border-r border-white/[0.06] p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 pb-6 pt-1">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent shadow-button">
          <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
            <path d="M4 5l8 5-8 5V5z" fill="#09090b" />
            <path d="M13 5l4 5-4 5" stroke="#09090b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="font-display text-[17px] font-bold tracking-tight text-ink">
          Face<span className="text-accent">off</span>
        </div>
      </div>

      {/* Nav label */}
      <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        Navigation
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-[11px] px-2.5 py-2.5 text-[13.5px] font-medium transition-all duration-150 ${
                active
                  ? "bg-brand-100 text-accent border border-brand-200"
                  : "text-subtle hover:text-ink hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <span className={`flex-shrink-0 ${active ? "text-accent" : ""}`}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* CTA */}
      <Link
        href="/interview"
        className="btn-primary mb-3 w-full text-[13px]"
      >
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 6.5l5 3.5-5 3.5V6.5z" fill="currentColor" />
        </svg>
        Start Interview
      </Link>

      {/* User */}
      <button
        onClick={logout}
        className="flex items-center gap-2.5 rounded-[11px] border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-left transition-all hover:bg-white/[0.06] hover:border-white/[0.10] group"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-accent text-[12px] font-bold border border-brand-200">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-ink leading-tight">{email || "Account"}</div>
          <div className="text-[11px] text-muted mt-0.5 group-hover:text-danger-400 transition-colors">Sign out</div>
        </div>
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-muted flex-shrink-0">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </aside>
  );
}
