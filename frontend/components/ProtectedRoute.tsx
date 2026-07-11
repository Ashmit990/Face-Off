"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Sidebar from "./Sidebar";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { userId, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !userId) {
      router.push("/login");
    }
  }, [loading, userId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-brand-200 animate-spin-smooth border-t-accent" />
          </div>
          <p className="font-mono text-xs text-muted tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="px-10 py-10 max-w-[1080px]">
          {children}
        </div>
      </main>
    </div>
  );
}
