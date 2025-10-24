import { Routes, Route } from "react-router-dom";

// ✅ Auth pages
import Register from "@/pages/auth/register";
import Login from "@/pages/auth/login";
import ResetPassword from "@/pages/auth/ResetPassword";
import ForgetPassword from "@/pages/auth/ForgetPassword";

// ✅ Agent / Client pages
import AgentDashboard from "@/pages/agents/AgentDashboard";
import TimelineBuilder from "@/pages/agents/TimelineBuilder";
import Home from "@/pages/agents/home";



function App() {
  return (
    <Routes>
      {/* Public / Auth routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/agent-login" element={<Login />} />
      <Route path="/client-login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* App routes */}
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<AgentDashboard />} />
      <Route path="/timeline" element={<TimelineBuilder />} />
    </Routes>
  );
}

export default App;
