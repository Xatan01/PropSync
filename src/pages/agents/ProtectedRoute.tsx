// src/pages/agents/ProtectedRoute.tsx
import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

type Role = "agent" | "client";

export const ProtectedRoute = ({
  children,
  allow = ["agent", "client"],
}: {
  children: React.ReactNode;
  allow?: Role[];
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/agent-login" state={{ from: location }} replace />;
  }

  const role: Role | undefined =
    (user as any)?.role ||
    (user as any)?.user_metadata?.role ||
    (user as any)?.app_metadata?.role;

  // Missing role -> treat as invalid session
  if (!role) {
    return <Navigate to="/agent-login" replace />;
  }

  // Role not allowed
  if (!allow.includes(role)) {
    return role === "client"
      ? <Navigate to="/client-login" replace />
      : <Navigate to="/agent-login" replace />;
  }

  return <>{children}</>;
};
