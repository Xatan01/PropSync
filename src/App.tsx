import { Suspense } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import Home from "./components/home";
import ClientList from "./components/client/ClientList";
import ClientPortal from "./components/client/ClientPortal";
import NotificationSystem from "./components/notifications/NotificationSystem";
import SubscriptionManagement from "./components/subscription/SubscriptionManagement";
import TimelineBuilder from "./components/timeline/TimelineBuilder";
import Profile from "./components/profile/Profile";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Confirm from "./components/confirm/Confirm";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import ForgotPassword from "./components/ForgetPassword/ForgetPassword";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          {/* Core pages */}
          <Route path="/" element={<Register />} />
          <Route path="/client-list" element={<ClientList />} />
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route path="/notifications" element={<NotificationSystem />} />
          <Route path="/subscription" element={<SubscriptionManagement />} />
          <Route path="/timeline" element={<TimelineBuilder />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path ="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/home" element={<Home />} />
          {/* Optional: catch-all route for 404 */}
          <Route path="*" element={<p>404 - Page Not Found</p>} />
        </Routes>

        {/* Tempo dynamic routes (only if env var enabled) */}
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
