import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  DollarSign,
  Home,
  Users,
  LogOut,
  CheckCircle2,
  ChevronRight,
  LayoutTemplate,
  Plus,
  BookOpen,
  Pencil,
  Bell,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddClientModal from "@/components/clients/AddClientModal";
import EditClientModal from "@/components/clients/EditClientModal";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  property?: string;
  status?: string;
  transactionType?: string;
  value?: number;
  invite_status?: string; // "uninvited" | "pending" | "confirmed" (recommended)
}

interface Template {
  id: string;
  template_name: string;
  category?: string;
}

interface Activity {
  id: string;
  action: string;
  description: string;
  created_at: string;
}

interface ActionItem {
  id: string;
  client_id: string;
  type: string;
  title: string;
  description: string;
  due_date?: string;
}

type InviteVariant = "default" | "outline" | "secondary";

const getInviteUI = (status?: string): { label: string; disabled: boolean; variant: InviteVariant } => {
  if (status === "confirmed") return { label: "Confirmed", disabled: true, variant: "secondary" };
  if (status === "pending") return { label: "Resend", disabled: false, variant: "outline" };
  return { label: "Invite", disabled: false, variant: "default" };
};

const AgentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [sortBy, setSortBy] = useState<string>("value");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientRes, tempRes, actRes, actionRes] = await Promise.all([
        api.get("/clients"),
        api.get("/timeline/templates"),
        api.get("/clients/activity"),
        api.get("/actions/center?limit=5"),
      ]);
      const normalizedClients = (clientRes.data || []).map((client: any) => ({
        ...client,
        phone: client.phone ?? client.phone_number ?? "",
        transactionType: client.transactionType ?? client.transaction_type ?? "",
      }));
      setClients(normalizedClients);
      setTemplates(tempRes.data || []);
      setActivities(actRes.data || []);
      setActionItems(actionRes.data || []);
    } catch (err) {
      toast.error("Failed to sync dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const inviteClient = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/clients/invite/${id}`);
      const status = res?.data?.status;

      // Expect backend to return one of these statuses (recommended):
      // "sent" | "already_invited" | "already_confirmed" | "invited"
      if (status === "sent") {
        toast.success("Invite email sent.");
      } else if (status === "already_invited") {
        toast.message("Invite already pending - resent.");
      } else if (status === "already_registered") {
        toast.message("Email already registered. Ask the client to log in or reset their password.");
      } else if (status === "already_confirmed") {
        toast.message("Client already confirmed and can log in.");
      } else {
        // fallback for older backend response
        toast.success("Invite updated.");
      }

      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to send invite.");
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === "value") return (b.value || 0) - (a.value || 0);
    return 0;
  });

  const activeCount = clients.filter((c) => c.status === "active").length;
  const totalValue = clients.reduce((sum, c) => sum + (c.value || 0), 0);
  const getActionCta = (item: ActionItem) => {
    if (item.type === "invite") return "Send Invite";
    if (item.type === "invite_pending") return "Resend";
    if (item.type === "deal_details") return "Update";
    if (item.type === "timeline_missing") return "Create";
    if (item.type === "timeline_overdue" || item.type === "timeline_upcoming") return "View";
    return "Open";
  };

  const handleAction = (item: ActionItem) => {
    if (item.type === "invite" || item.type === "invite_pending") {
      inviteClient(item.client_id, { stopPropagation: () => {} } as React.MouseEvent);
      return;
    }
    if (item.type === "deal_details") {
      navigate(`/clients/${item.client_id}`);
      return;
    }
    if (item.type === "timeline_missing" || item.type === "timeline_overdue" || item.type === "timeline_upcoming") {
      navigate(`/timeline/${item.client_id}`);
      return;
    }
    navigate(`/clients/${item.client_id}`);
  };

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-primary">{user?.name || "Agent"}</span>
            </h1>
            <p className="text-muted-foreground italic tracking-tight">
              Managing your property ecosystem and master workflows
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">
                  PropSync Certified
                </p>
              </div>

              <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-card-foreground">
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Portfolio
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length} Clients</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Active Deals
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount} In-Progress</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Template Library
              </CardTitle>
              <LayoutTemplate className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length} Saved Templates</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pipeline Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Client Management */}
            <Card className="border-muted shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-accent/5 border-b py-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Client Management</CardTitle>
                    <CardDescription>Track individual transaction progress</CardDescription>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[120px] h-9 text-xs">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="value">Value</SelectItem>
                    </SelectContent>
                  </Select>

                  <AddClientModal onClientAdded={fetchData} />
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="py-10 text-center italic text-muted-foreground text-sm">
                    Syncing clients...
                  </div>
                ) : sortedClients.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-sm border-b border-dashed space-y-3">
                    <p className="italic">No clients found. Add your first client to begin.</p>
                    <div className="flex justify-center">
                      <AddClientModal onClientAdded={fetchData} />
                    </div>
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto divide-y divide-muted">
                    {sortedClients.map((client) => {
                      const ui = getInviteUI(client.invite_status);

                      return (
                        <div
                          key={client.id}
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="flex justify-between items-center p-5 hover:bg-accent/30 transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar className="h-11 w-11 border border-muted ring-2 ring-background group-hover:ring-primary/20 transition-all">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.name}`}
                              />
                              <AvatarFallback>{client.name?.[0]}</AvatarFallback>
                            </Avatar>

                            <div>
                              <div className="font-bold text-sm tracking-tight">{client.name}</div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Home className="h-3 w-3" /> {client.property || "Unassigned"}
                              </div>

                              <div className="flex gap-2 mt-2">
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] h-4 uppercase font-bold tracking-tight px-1.5"
                                >
                                  {client.transactionType || "Standard"}
                                </Badge>

                                <Badge
                                  variant={client.invite_status === "confirmed" ? "default" : "outline"}
                                  className="text-[9px] h-4 uppercase font-bold tracking-tight px-1.5"
                                >
                                  {client.invite_status || "uninvited"}
                                </Badge>
                              </div>
                            </div>
                          </div>

                        <div className="flex items-center gap-3">
                          <div onClick={(e) => e.stopPropagation()}>
                            <EditClientModal client={client} onClientUpdated={fetchData} />
                          </div>
                          <Button
                            variant={ui.variant}
                            size="sm"
                            className="h-8 rounded-md text-[11px] font-bold"
                            disabled={ui.disabled}
                              onClick={(e) => inviteClient(client.id, e)}
                            >
                              {ui.label}
                            </Button>

                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Templates */}
            <Card className="border-muted shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-primary/5 border-b py-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Timeline Templates</CardTitle>
                    <CardDescription>Pre-build standard roadmaps (BTO, Resale, etc.)</CardDescription>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/templates/builder")}
                  className="border-primary/20 hover:bg-primary/5"
                >
                  <Plus className="h-4 w-4 mr-2" /> Create New Template
                </Button>
              </CardHeader>

              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {templates.length === 0 ? (
                    <div className="col-span-2 py-10 text-center italic text-muted-foreground text-xs">
                      No templates saved. Create your first timeline to automate your workflow.
                    </div>
                  ) : (
                    templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => navigate(`/templates/builder/${template.id}`)}
                        className="flex justify-between items-center p-5 rounded-lg border border-border bg-background cursor-pointer group transition-all hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2.5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <LayoutTemplate className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-tight">
                              {template.template_name}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-muted shadow-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2 font-bold tracking-tight">
                  <Bell className="h-5 w-5 text-primary" />
                  Action Center
                </CardTitle>
                <CardDescription className="text-xs">Priority tasks to keep deals moving</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-3">
                {actionItems.length === 0 ? (
                  <div className="py-6 text-center italic text-muted-foreground text-xs">
                    All caught up. No urgent actions.
                  </div>
                ) : (
                  actionItems.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-muted/60 bg-background p-3">
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] font-bold h-8"
                        onClick={() => handleAction(item)}
                      >
                        {getActionCta(item)}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-muted shadow-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2 font-bold tracking-tight">
                  <Calendar className="h-5 w-5 text-primary" />
                  Activity Log
                </CardTitle>
                <CardDescription className="text-xs">Updates & notifications</CardDescription>
              </CardHeader>

              <CardContent className="p-0 pt-6 px-4 max-h-[520px] overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="py-8 text-center italic text-muted-foreground text-xs">
                    No activity yet.
                  </div>
                ) : (
                  <div className="relative space-y-6 pr-2 before:absolute before:top-2 before:bottom-0 before:ml-5 before:-translate-x-px before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:to-transparent">
                    {activities.map((a) => (
                      <div key={a.id} className="relative flex items-start gap-4 pl-10 group">
                        <div className="absolute left-0 grid place-items-center w-10 h-10 rounded-full bg-background border-2 border-primary/20 text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>

                        <div className="flex flex-col">
                          <p className="text-sm font-bold leading-none">{a.action}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed italic">
                            {a.description}
                          </p>
                          <div className="text-[10px] text-primary/60 mt-2 flex items-center gap-1 font-bold uppercase tracking-widest">
                            <Clock className="h-3 w-3" />{" "}
                            {new Date(a.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;

