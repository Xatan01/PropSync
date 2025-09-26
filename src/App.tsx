import { Routes, Route } from "react-router-dom";
import ClientList from "./components/client/ClientList";
import ClientPortal from "./components/client/ClientPortal";
import AgentDashboard from "./components/dashboard/AgentDashboard";
import NotificationSystem from "./components/notifications/NotificationSystem";
import SubscriptionManagement from "./components/subscription/SubscriptionManagement";
import TimelineBuilder from "./components/timeline/TimelineBuilder";
import Home from "./components/home";

// ✅ Auth pages
import Register from "./components/register/register";
import Login from "./components/login/login";
import Confirm from "./components/confirm/confirm";
import ForgotPassword from "./components/ForgetPassword/ForgetPassword";
import ResetPassword from "./components/ResetPassword/ResetPassword";

function App() {
  return (
    <Routes>
      {/* Public / Auth routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/confirm" element={<Confirm />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* App routes */}
      <Route path="/" element={<Login />} />
      <Route path="/client-list" element={<ClientList />} />
      <Route path="/client-portal" element={<ClientPortal />} />
      <Route path="/dashboard" element={<AgentDashboard />} />
      <Route path="/notifications" element={<NotificationSystem />} />
      <Route path="/subscription" element={<SubscriptionManagement />} />
      <Route path="/timeline" element={<TimelineBuilder />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
