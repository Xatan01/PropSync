import ClientList from "./components/client/ClientList";
import ClientPortal from "./components/client/ClientPortal";
import AgentDashboard from "./components/dashboard/AgentDashboard";
import NotificationSystem from "./components/notifications/NotificationSystem";
import SubscriptionManagement from "./components/subscription/SubscriptionManagement";
import TimelineBuilder from "./components/timeline/TimelineBuilder";
import Home from "./components/ui/Home";



function App() {
  return (
    <Router>
      <div style={{ padding: "1rem" }}>
        {/* Quick nav menu for testing */}
        <nav>
          <ul style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/client-list">Client List</Link></li>
            <li><Link to="/client-portal">Client Portal</Link></li>
            <li><Link to="/dashboard">Agent Dashboard</Link></li>
            <li><Link to="/notifications">Notifications</Link></li>
            <li><Link to="/subscription">Subscription Management</Link></li>
            <li><Link to="/timeline">Timeline Builder</Link></li>
          </ul>
        </nav>

        <hr />

        {/* Define all routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/client-list" element={<ClientList />} />
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route path="/dashboard" element={<AgentDashboard />} />
          <Route path="/notifications" element={<NotificationSystem />} />
          <Route path="/subscription" element={<SubscriptionManagement />} />
          <Route path="/timeline" element={<TimelineBuilder />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
