// src/utils/api.ts
import axios from "axios";
import { getActiveRole, getTokenKey } from "@/utils/authTokens";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// 🔹 Request interceptor: attach access token automatically
api.interceptors.request.use((config) => {
  const role = getActiveRole();
  const token = localStorage.getItem(getTokenKey(role, "access"));
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🔹 Response interceptor: refresh tokens if expired (401)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const role = getActiveRole();
      const refresh_token = localStorage.getItem(getTokenKey(role, "refresh"));

      if (refresh_token) {
        try {
          const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token,
          });

          const newAccess = refreshRes.data.access_token;
          const newRefresh = refreshRes.data.refresh_token;

          localStorage.setItem(getTokenKey(role, "access"), newAccess);
          localStorage.setItem(getTokenKey(role, "refresh"), newRefresh);

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest); // retry the original request
        } catch (err) {
          console.error("Session expired, please log in again.");
          localStorage.removeItem(getTokenKey(role, "access"));
          localStorage.removeItem(getTokenKey(role, "refresh"));
          window.location.href = role === "client" ? "/client-login" : "/agent-login";
        }
      }
    }

    return Promise.reject(error);
  }
);
