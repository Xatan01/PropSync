import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/pages/agents/ProtectedRoute";

// ✅ Pages
import Register from "@/pages/auth/register";
import Login from "@/pages/auth/login";
import ResetPassword from "@/pages/auth/ResetPassword";
import ForgetPassword from "@/pages/auth/ForgetPassword";
import AgentDashboard from "@/pages/agents/AgentDashboard";
import TimelineBuilder from "@/pages/agents/TimelineBuilder";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/register" element={<Register />} />
        <Route path="/agent-login" element={<Login role="agent" />} />
        <Route path="/client-login" element={<Login role="client" />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* --- PROTECTED ROUTES (Requires Login) --- */}
        
        {/* 1. Dashboard: Overview of all transactions */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AgentDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* 2. Client Timeline: Drill-down for a specific transaction */}
        <Route 
          path="/timeline/:clientId" 
          element={
            <ProtectedRoute>
              <TimelineBuilder />
            </ProtectedRoute>
          } 
        />

        {/* 3. Template Builder: For building reusable master roadmaps */}
        <Route 
          path="/templates/builder/:templateId?" 
          element={
            <ProtectedRoute>
              <TimelineBuilder isTemplateMode={true} />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;