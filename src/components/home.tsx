import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, ChevronRight, Home as HomeIcon, Bell, Plus } from "lucide-react";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  property?: string;
  transactionType?: string;
  progress?: number;
  status?: "active" | "pending" | "completed";
  value?: number;
  nextTask?: string;
  dueDate?: string;
}

const Home = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [sortBy, setSortBy] = useState("dueDate");

  useEffect(() => {
    axios.get("http://localhost:8000/clients").then((res) => setClients(res.data));
  }, []);

  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === "dueDate" && a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy === "value" && a.value && b.value) {
      return b.value - a.value;
    }
    return 0;
  });

  const activeCount = clients.filter((c) => c.status === "active").length;
  const pendingCount = clients.filter((c) => c.status === "pending").length;
  const completedCount = clients.filter((c) => c.status === "completed").length;
  const totalValue = clients.reduce((sum, c) => sum + (c.value || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between">
          <div className="flex items-center space-x-2">
            <HomeIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">PropAgent</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-primary/10 text-primary">Premium</Badge>
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardHeader><CardTitle>Active</CardTitle></CardHeader><CardContent>{activeCount}</CardContent></Card>
          <Card><CardHeader><CardTitle>Pending</CardTitle></CardHeader><CardContent>{pendingCount}</CardContent></Card>
          <Card><CardHeader><CardTitle>Completed</CardTitle></CardHeader><CardContent>{completedCount}</CardContent></Card>
          <Card><CardHeader><CardTitle>Total Value</CardTitle></CardHeader><CardContent>${totalValue.toLocaleString()}</CardContent></Card>
        </div>

        {/* Client List */}
        <Card>
          <CardHeader className="flex justify-between">
            <div><CardTitle>Clients</CardTitle><CardDescription>Manage your clients</CardDescription></div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                </SelectContent>
              </Select>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Client</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedClients.map((client) => (
                <Link key={client.id} to={`/timeline/${client.id}`} className="block">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                    <div className="flex items-center gap-4">
                      <Avatar><AvatarImage src={client.avatar} /><AvatarFallback>{client.name[0]}</AvatarFallback></Avatar>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">{client.property}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge>{client.transactionType}</Badge>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(client.status || "")}`}>{client.status}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;
