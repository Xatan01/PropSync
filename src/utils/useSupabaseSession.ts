import { useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Handles token refresh + auto logout if expired.
 * Keeps user signed in automatically.
 */
export function useSupabaseSession() {
  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token");

    // ⏱️ Immediately try refreshing once at startup
    if (refreshToken) refreshSession();

    // 🔁 Schedule silent refresh every 55 minutes (before access token expires)
    const interval = setInterval(refreshSession, 55 * 60 * 1000);

    async function refreshSession() {
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) return;

        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Refresh failed");

        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        console.log("🔄 Access token refreshed");
      } catch (err) {
        console.warn("Session refresh failed, logging out...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/agent-login";
      }
    }

    return () => clearInterval(interval);
  }, []);
}
