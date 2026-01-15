// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/pages/agents/ProtectedRoute";

// Public auth pages
import Register from "@/pages/auth/register";
import Login from "@/pages/auth/login";
import ResetPassword from "@/pages/auth/ResetPassword";
import ForgetPassword from "@/pages/auth/ForgetPassword";

// Agent pages
import AgentDashboard from "@/pages/agents/AgentDashboard";
import TimelineBuilder from "@/pages/agents/TimelineBuilder";

// Client invite landing
import ClientSetPassword from "@/pages/clients/ClientSetPassword";

/**
 * Root redirect:
 * - Not logged in -> agent login
 * - Logged in agent -> /dashboard
 * - Logged in client -> /client-login (until you build client dashboard)
 */
const IndexRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) return <Navigate to="/agent-login" replace />;

  const role =
    (user as any)?.role ||
    (user as any)?.user_metadata?.role ||
    (user as any)?.app_metadata?.role;

  if (role === "client") return <Navigate to="/client-login" replace />;

  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* PUBLIC */}
        <Route path="/register" element={<Register />} />
        <Route path="/agent-login" element={<Login role="agent" />} />
        <Route path="/client-login" element={<Login role="client" />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ✅ Client invite landing (PUBLIC) */}
        <Route path="/client/set-password" element={<ClientSetPassword />} />

        {/* Root */}
        <Route path="/" element={<IndexRedirect />} />

        {/* AGENT ONLY */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allow={["agent"]}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timeline/:clientId"
          element={
            <ProtectedRoute allow={["agent"]}>
              <TimelineBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates/builder/:templateId?"
          element={
            <ProtectedRoute allow={["agent"]}>
              <TimelineBuilder isTemplateMode={true} />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
