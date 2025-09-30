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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Home as HomeIcon,
  Bell,
  Plus,
  Calendar,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ---- Types ----
interface Client {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  property?: string;
  transactionType?: string;
  progress?: number;
  status?: "active" | "pending" | "completed";
  value?: number;
  nextTask?: string;
  dueDate?: string;
}

interface Transaction {
  id: string;
  title: string;
  type: string;
  progress: number;
  client: string;
  dueDate: string;
}

const initialsFromName = (name?: string) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "U";

const dicebearFrom = (seed?: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    seed || "User"
  )}`;

const Home = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [sortBy, setSortBy] = useState("dueDate");
  const [open, setOpen] = useState(false);

  // Add Client form state
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    email: "",
    phone: "",
    property: "",
    transactionType: "",
    status: "pending",
    progress: 0,
    value: 0,
    nextTask: "",
    dueDate: "",
  });

  // Fetch clients
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    axios
      .get(`${API_BASE_URL}/clients`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      .then((res) => setClients(res.data))
      .catch(() => setClients([]));
  }, []);

  // Add client handler
  const handleAddClient = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.post(`${API_BASE_URL}/clients`, newClient, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setClients((prev) => [...prev, res.data]);
      setOpen(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        property: "",
        transactionType: "",
        status: "pending",
        progress: 0,
        value: 0,
        nextTask: "",
        dueDate: "",
      });
    } catch (err) {
      console.error("❌ Failed to add client", err);
    }
  };

  // Sorting logic
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

  // Placeholder transactions
  const recentTransactions: Transaction[] = [
    {
      id: "t1",
      title: "Option Fee Received",
      type: "HDB Purchase",
      progress: 30,
      client: "John Smith",
      dueDate: "2023-06-08",
    },
    {
      id: "t2",
      title: "Valuation Completed",
      type: "Condo Sale",
      progress: 60,
      client: "Sarah Lee",
      dueDate: "2023-06-07",
    },
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "pending":
        return "bg-yellow-500 text-black";
      case "completed":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <HomeIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">PropAgent</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Premium
            </Badge>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <Link to="/profile" aria-label="Profile">
              <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary">
                <AvatarImage src={dicebearFrom("User")} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Manage your clients and property transactions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Active</CardTitle>
              <CardDescription>Currently progressing</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{activeCount}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending</CardTitle>
              <CardDescription>Needs attention</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{pendingCount}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Completed</CardTitle>
              <CardDescription>Closed successfully</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{completedCount}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Value</CardTitle>
              <CardDescription>All active deals</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </CardContent>
          </Card>
        </div>

        {/* Clients */}
        <Card>
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>Clients</CardTitle>
              <CardDescription>Manage your clients</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                </SelectContent>
              </Select>

              {/* Add Client Modal */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Client</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={newClient.name}
                        onChange={(e) =>
                          setNewClient({ ...newClient, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={newClient.email}
                        onChange={(e) =>
                          setNewClient({ ...newClient, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Property</Label>
                      <Input
                        value={newClient.property}
                        onChange={(e) =>
                          setNewClient({ ...newClient, property: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Transaction Type</Label>
                      <Input
                        value={newClient.transactionType}
                        onChange={(e) =>
                          setNewClient({
                            ...newClient,
                            transactionType: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button onClick={handleAddClient} className="w-full">
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedClients.map((client) => {
                const seed = client.name || client.email;
                return (
                  <Link key={client.id} to={`/timeline/${client.id}`} className="block">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={client.avatar || dicebearFrom(seed)}
                          />
                          <AvatarFallback>
                            {initialsFromName(client.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.property || "—"}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {client.transactionType || "Unknown"}
                            </Badge>
                            <span
                              className={`text-xs px-2 py-1 rounded ${getStatusColor(
                                client.status
                              )}`}
                            >
                              {client.status || "unknown"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm">
                          <span className="font-medium">Next: </span>
                          {client.nextTask || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {client.dueDate
                            ? new Date(client.dueDate).toLocaleDateString()
                            : "—"}
                        </div>
                        <div className="w-32">
                          <Progress
                            value={client.progress || 0}
                            className="h-1.5"
                          />
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity + Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="transactions">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                <TabsContent value="transactions" className="space-y-4 mt-4">
                  {recentTransactions.map((t) => (
                    <div key={t.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{t.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {t.client}
                          </div>
                        </div>
                        <Badge variant="outline">{t.type}</Badge>
                      </div>
                      <Progress value={t.progress} className="h-1.5" />
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {new Date(t.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="notifications" className="space-y-4 mt-4">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Document Uploaded</div>
                    <div className="text-xs text-muted-foreground">
                      Sarah Lee uploaded Option to Purchase document
                    </div>
                    <div className="text-xs text-muted-foreground">2 hours ago</div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>Your current plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Premium Plan</div>
                  <Badge>Active</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Clients</span>
                    <span className="font-medium">{clients.length} / 25</span>
                  </div>
                  <Progress
                    value={(clients.length / 25) * 100}
                    className="h-1.5"
                  />
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/subscription">Manage Subscription</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Home;