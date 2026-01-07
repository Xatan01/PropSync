import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Bell, Calendar, Clock, DollarSign, Home, Users,
} from "lucide-react";
import AddClientModal from "@/components/clients/AddClientModal";

interface Client {
  id: string;
  name: string;
  email?: string;
  property?: string;
  status?: string;
  transactionType?: string;
  progress?: number;
  value?: number;
  nextTask?: string;
  dueDate?: string;
  invite_status?: string;
}

interface Activity {
  id: string;
  action: string;
  description: string;
  created_at: string;
}

const AgentDashboard = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get("/clients");
      setClients(res.data);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    const res = await api.get("/clients/activity");
    setActivities(res.data);
  };

  useEffect(() => {
    fetchClients();
    fetchActivity();
  }, []);

  const inviteClient = async (id: string) => {
    try {
      await api.post(`/clients/invite/${id}`);
      alert("✅ Invite sent!");
      fetchClients();
      fetchActivity();
    } catch {
      alert("❌ Failed to send invite.");
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === "dueDate" && a.dueDate && b.dueDate)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (sortBy === "value" && a.value && b.value)
      return b.value - a.value;
    return 0;
  });

  const activeCount = clients.filter(c => c.status === "active").length;
  const pendingCount = clients.filter(c => c.status === "pending").length;
  const completedCount = clients.filter(c => c.status === "completed").length;
  const totalValue = clients.reduce((sum, c) => sum + (c.value || 0), 0);

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome back,</h1>
            <p className="text-muted-foreground">Manage your clients and property transactions</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon"><Bell className="h-5 w-5" /></Button>
            <Avatar><AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=agent" /><AvatarFallback>AG</AvatarFallback></Avatar>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Clients</CardTitle></CardHeader><CardContent><div className="flex justify-between"><div className="text-2xl font-bold">{activeCount}</div><Users className="h-5 w-5 text-muted-foreground" /></div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Transactions</CardTitle></CardHeader><CardContent><div className="flex justify-between"><div className="text-2xl font-bold">{pendingCount}</div><Clock className="h-5 w-5 text-muted-foreground" /></div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Completed Deals</CardTitle></CardHeader><CardContent><div className="flex justify-between"><div className="text-2xl font-bold">{completedCount}</div><Home className="h-5 w-5 text-muted-foreground" /></div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Transaction Value</CardTitle></CardHeader><CardContent><div className="flex justify-between"><div className="text-2xl font-bold">${totalValue.toLocaleString()}</div><DollarSign className="h-5 w-5 text-muted-foreground" /></div></CardContent></Card>
        </div>

        {/* Clients List + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clients */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex justify-between">
                <div>
                  <CardTitle>Client Management</CardTitle>
                  <CardDescription>Manage your clients</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                      <SelectItem value="value">Transaction Value</SelectItem>
                    </SelectContent>
                  </Select>
                  <AddClientModal onClientAdded={fetchClients} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground py-6">Loading clients...</p>
                ) : sortedClients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No clients yet.</p>
                ) : (
                  <div className="space-y-4">
                    {sortedClients.map(client => (
                      <div key={client.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent/50 transition">
                        <div className="flex items-center gap-4">
                          <Avatar><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.name}`} /><AvatarFallback>{client.name[0]}</AvatarFallback></Avatar>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-muted-foreground">{client.property || "No property info"}</div>
                            <div className="flex gap-2 mt-1">
                              {client.transactionType && <Badge variant="outline">{client.transactionType}</Badge>}
                              <Badge variant={
                                client.invite_status === "confirmed" ? "default" :
                                client.invite_status === "pending" ? "secondary" :
                                client.invite_status === "failed" ? "destructive" : "outline"
                              }>
                                {client.invite_status || "uninvited"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={client.invite_status === "confirmed"}
                          onClick={() => inviteClient(client.id)}
                        >
                          {client.invite_status === "pending" ? "Resend Invite" : "Send Invite"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Recent Activity</CardTitle><CardDescription>Latest updates</CardDescription></CardHeader>
              <CardContent>
                <Tabs defaultValue="activity">
                  <TabsList><TabsTrigger value="activity">Activity</TabsTrigger></TabsList>
                  <TabsContent value="activity" className="space-y-4 mt-4">
                    {activities.map(a => (
                      <div key={a.id} className="p-3 border rounded-lg">
                        <div className="font-medium">{a.action}</div>
                        <div className="text-xs text-muted-foreground">{a.description}</div>
                        <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
