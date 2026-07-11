"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import * as api from "./api";

type AuthContextType = {
  userId: string | null;
  email: string | null;
  hasCvProfile: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [hasCvProfile, setHasCvProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function refreshProfile() {
    try {
      const me = await api.getMe();
      setUserId(me.user_id);
      setHasCvProfile(me.has_cv_profile);
    } catch {
      // token invalid/expired
      localStorage.removeItem("faceoff_token");
      setUserId(null);
      setEmail(null);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("faceoff_token");
    const storedEmail = localStorage.getItem("faceoff_email");
    if (token) {
      setEmail(storedEmail);
      refreshProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(emailInput: string, password: string) {
    const result = await api.login(emailInput, password);
    localStorage.setItem("faceoff_token", result.access_token);
    localStorage.setItem("faceoff_email", result.email);
    setEmail(result.email);
    setUserId(result.user_id);
    await refreshProfile();
    router.push("/");
  }

  async function signup(emailInput: string, password: string) {
    await api.signup(emailInput, password);
    await login(emailInput, password);
  }

  function logout() {
    localStorage.removeItem("faceoff_token");
    localStorage.removeItem("faceoff_email");
    setUserId(null);
    setEmail(null);
    setHasCvProfile(false);
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{
        userId,
        email,
        hasCvProfile,
        loading,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
