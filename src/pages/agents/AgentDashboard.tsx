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
  Bell, Calendar, ChevronRight, Clock, DollarSign, Home, Plus, Users,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Client {
  id: string | number;
  name: string;
  email?: string;
  property?: string;
  status?: "active" | "pending" | "completed";
  transactionType?: string;
  progress?: number;
  value?: number;
  nextTask?: string;
  dueDate?: string;
}

const AgentDashboard = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [sortBy, setSortBy] = useState<string>("dueDate");

  // ✅ Fetch live clients from backend (RLS protected)
  useEffect(() => {
    api
      .get("/clients")
      .then((res) => setClients(res.data))
      .catch((err) => {
        console.error("Failed to load clients:", err);
        setClients([]);
      });
  }, []);

  // Sort dynamically
  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === "dueDate" && a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy === "value" && a.value && b.value) {
      return b.value - a.value;
    }
    return 0;
  });

  // Stats
  const activeCount = clients.filter((c) => c.status === "active").length;
  const pendingCount = clients.filter((c) => c.status === "pending").length;
  const completedCount = clients.filter((c) => c.status === "completed").length;
  const totalValue = clients.reduce((sum, c) => sum + (c.value || 0), 0);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back,
            </h1>
            <p className="text-muted-foreground">
              Manage your clients and property transactions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=agent"
                alt="Agent"
              />
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{activeCount}</div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{pendingCount}</div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Deals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{completedCount}</div>
                <Home className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Transaction Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  ${totalValue.toLocaleString()}
                </div>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Management Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>
                  Manage your clients and their transactions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="value">Transaction Value</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Client
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedClients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">
                    No clients yet.
                  </p>
                ) : (
                  sortedClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.name}`}
                            alt={client.name}
                          />
                          <AvatarFallback>
                            {client.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.property || "No property info"}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {client.transactionType && (
                              <Badge variant="outline">
                                {client.transactionType}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              <div
                                className={`w-2 h-2 rounded-full ${getStatusColor(
                                  client.status
                                )}`}
                              ></div>
                              <span className="text-xs capitalize">
                                {client.status || "unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {client.nextTask && (
                          <div className="text-sm">
                            <span className="font-medium">Next: </span>
                            {client.nextTask}
                          </div>
                        )}
                        {client.dueDate && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due:{" "}
                            {new Date(client.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        <div className="w-32">
                          <Progress
                            value={client.progress || 0}
                            className="h-1.5"
                          />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline">View All Clients</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
