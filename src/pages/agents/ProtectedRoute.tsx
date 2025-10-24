// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/agent-login" />;
};
