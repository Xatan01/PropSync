import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // IMPORTANT: Wait until the AuthProvider finishes checking localStorage
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If after loading there is no user, redirect to login
  if (!user) {
    return <Navigate to="/agent-login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};