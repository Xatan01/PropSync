import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Clock, DollarSign, Home, Users, LogOut, CheckCircle2, ChevronRight, LayoutTemplate, Plus, BookOpen
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddClientModal from "@/components/clients/AddClientModal";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface Client {
  id: string;
  name: string;
  property?: string;
  status?: string;
  transactionType?: string;
  value?: number;
  invite_status?: string;
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

const AgentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sortBy, setSortBy] = useState<string>("value");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch for industry-standard performance
      const [clientRes, tempRes, actRes] = await Promise.all([
        api.get("/clients"),
        api.get("/timeline/templates"),
        api.get("/clients/activity")
      ]);
      setClients(clientRes.data);
      setTemplates(tempRes.data);
      setActivities(actRes.data);
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
      await api.post(`/clients/invite/${id}`);
      toast.success("Invite sent successfully!");
      fetchData();
    } catch {
      toast.error("Failed to send invite.");
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === "value" && a.value && b.value) return (b.value || 0) - (a.value || 0);
    return 0;
  });

  // KPI Calculations
  const activeCount = clients.filter(c => c.status === "active").length;
  const totalValue = clients.reduce((sum, c) => sum + (c.value || 0), 0);

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- Header Section --- */}
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
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">PropSync Certified</p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-card-foreground">
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Portfolio</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{clients.length} Clients</div></CardContent>
          </Card>
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Deals</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{activeCount} In-Progress</div></CardContent>
          </Card>
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Template Library</CardTitle>
              <LayoutTemplate className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{templates.length} Saved Templates</div></CardContent>
          </Card>
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">${totalValue.toLocaleString()}</div></CardContent>
          </Card>
        </div>

        {/* --- Main Workspace --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Client Management Card */}
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
                   <div className="py-10 text-center italic text-muted-foreground text-sm">Syncing clients...</div>
                ) : sortedClients.length === 0 ? (
                  <div className="py-10 text-center italic text-muted-foreground text-sm border-b border-dashed">
                    No clients found. Add your first client to begin.
                  </div>
                ) : (
                  <div className="divide-y divide-muted">
                    {sortedClients.map(client => (
                      <div 
                        key={client.id} 
                        onClick={() => navigate(`/timeline/${client.id}`)} 
                        className="flex justify-between items-center p-5 hover:bg-accent/30 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-11 w-11 border border-muted ring-2 ring-background group-hover:ring-primary/20 transition-all">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.name}`} />
                            <AvatarFallback>{client.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-sm tracking-tight">{client.name}</div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Home className="h-3 w-3" /> {client.property || "Unassigned"}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary" className="text-[9px] h-4 uppercase font-bold tracking-tight px-1.5">{client.transactionType || 'Standard'}</Badge>
                              <Badge variant={client.invite_status === "confirmed" ? "default" : "outline"} className="text-[9px] h-4 uppercase font-bold tracking-tight px-1.5">
                                {client.invite_status || "uninvited"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant={client.invite_status === "pending" ? "outline" : "default"} size="sm" className="h-8 rounded-md text-[11px] font-bold" disabled={client.invite_status === "confirmed"} onClick={(e) => inviteClient(client.id, e)}>
                            {client.invite_status === "pending" ? "Resend" : "Invite"}
                          </Button>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Timeline Templates Card */}
            <Card className="border-muted shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-primary/5 border-b py-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Timeline Templates</CardTitle>
                    <CardDescription>Pre-build standard roadmaps (BTO, Resale, etc.)</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/templates/builder")} className="border-primary/20 hover:bg-primary/5">
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
                        className="p-5 hover:bg-accent/50 cursor-pointer group flex justify-between items-center transition-colors"
                        onClick={() => navigate(`/templates/builder/${template.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2.5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <LayoutTemplate className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-tight">{template.template_name}</p>
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

          {/* --- Activity Sidebar --- */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="h-full border-muted shadow-sm">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2 font-bold tracking-tight">
                    <Calendar className="h-5 w-5 text-primary" />
                    Activity Log
                </CardTitle>
                <CardDescription className="text-xs">Updates & notifications</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:to-transparent">
                  {activities.map((a) => (
                    <div key={a.id} className="relative flex items-start gap-4 pl-10 group">
                        <div className="absolute left-0 grid place-items-center w-10 h-10 rounded-full bg-background border-2 border-primary/20 text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                           <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm font-bold leading-none">{a.action}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed italic">{a.description}</p>
                          <div className="text-[10px] text-primary/60 mt-2 flex items-center gap-1 font-bold uppercase tracking-widest">
                              <Clock className="h-3 w-3" /> {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;