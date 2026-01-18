import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AuthRole,
  clearActiveRole,
  getTokenKey,
  getUserKey,
  resolveActiveRole,
  setActiveRole,
} from "@/utils/authTokens";

interface AuthUser {
  name: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role: AuthRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore session on refresh
  useEffect(() => {
    const legacyUser = localStorage.getItem("user");
    const legacyAccess = localStorage.getItem("access_token");
    const legacyRefresh = localStorage.getItem("refresh_token");
    const hasAgentToken = localStorage.getItem(getTokenKey("agent", "access"));

    if (legacyUser && legacyAccess && !hasAgentToken) {
      localStorage.setItem(getUserKey("agent"), legacyUser);
      localStorage.setItem(getTokenKey("agent", "access"), legacyAccess);
      if (legacyRefresh) {
        localStorage.setItem(getTokenKey("agent", "refresh"), legacyRefresh);
      }
      setActiveRole("agent");
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }

    const role = resolveActiveRole();
    const storedUser = localStorage.getItem(getUserKey(role));
    const token = localStorage.getItem(getTokenKey(role, "access"));

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: AuthRole) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");

    setActiveRole(role);
    localStorage.setItem(getTokenKey(role, "access"), data.access_token);
    localStorage.setItem(getTokenKey(role, "refresh"), data.refresh_token);

    const userData = {
      name: data.name,   // ✅ comes from backend
      role: data.role,
    };

    localStorage.setItem(getUserKey(role), JSON.stringify(userData));
    setUser(userData);

    return true;
  };

  const logout = () => {
    const role = resolveActiveRole();
    localStorage.removeItem(getTokenKey(role, "access"));
    localStorage.removeItem(getTokenKey(role, "refresh"));
    localStorage.removeItem(getUserKey(role));
    clearActiveRole();
    setUser(null);
    window.location.href = role === "client" ? "/client-login" : "/agent-login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
