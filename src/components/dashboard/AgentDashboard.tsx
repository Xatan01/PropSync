import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  Home,
  Plus,
  Users,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Client {
  id: string;
  name: string;
  avatar?: string;
  property: string;
  transactionType: string;
  progress: number;
  status: "active" | "pending" | "completed";
  value: number;
  nextTask: string;
  dueDate: string;
}

interface Transaction {
  id: string;
  title: string;
  type: string;
  progress: number;
  client: string;
  dueDate: string;
}

const AgentDashboard = () => {
  const [sortBy, setSortBy] = useState<string>("dueDate");

  // Mock data for clients
  const clients: Client[] = [
    {
      id: "1",
      name: "John Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      property: "123 Orchard Road, #05-01",
      transactionType: "HDB Purchase",
      progress: 45,
      status: "active",
      value: 550000,
      nextTask: "Submit Option to Purchase",
      dueDate: "2023-06-15",
    },
    {
      id: "2",
      name: "Sarah Lee",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      property: "456 Marina Bay, #12-08",
      transactionType: "Condo Sale",
      progress: 75,
      status: "active",
      value: 1200000,
      nextTask: "Prepare for Handover",
      dueDate: "2023-06-10",
    },
    {
      id: "3",
      name: "Michael Tan",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      property: "789 Jurong East St 21, #03-123",
      transactionType: "HDB Rental",
      progress: 20,
      status: "pending",
      value: 2500,
      nextTask: "Tenant Screening",
      dueDate: "2023-06-20",
    },
    {
      id: "4",
      name: "Lisa Wong",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
      property: "321 Bukit Timah Road",
      transactionType: "Landed Property Sale",
      progress: 90,
      status: "completed",
      value: 3500000,
      nextTask: "Final Documentation",
      dueDate: "2023-06-05",
    },
  ];

  // Mock data for recent transactions
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
    {
      id: "t3",
      title: "Lease Agreement Signed",
      type: "HDB Rental",
      progress: 15,
      client: "Michael Tan",
      dueDate: "2023-06-12",
    },
  ];

  // Sort clients based on selected criteria
  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === "dueDate") {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy === "value") {
      return b.value - a.value;
    }
    return 0;
  });

  // Get counts for dashboard stats
  const activeCount = clients.filter((c) => c.status === "active").length;
  const pendingCount = clients.filter((c) => c.status === "pending").length;
  const completedCount = clients.filter((c) => c.status === "completed").length;
  const totalValue = clients.reduce((sum, client) => sum + client.value, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Agent Dashboard
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  {sortedClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={client.avatar} alt={client.name} />
                          <AvatarFallback>
                            {client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.property}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {client.transactionType}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <div
                                className={`w-2 h-2 rounded-full ${getStatusColor(client.status)}`}
                              ></div>
                              <span className="text-xs capitalize">
                                {client.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm">
                          <span className="font-medium">Next: </span>
                          {client.nextTask}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due: {new Date(client.dueDate).toLocaleDateString()}
                        </div>
                        <div className="w-32">
                          <Progress value={client.progress} className="h-1.5" />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline">View All Clients</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline Management</CardTitle>
                <CardDescription>
                  Create and manage property transaction timelines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    variant="outline"
                  >
                    <Plus className="h-6 w-6" />
                    <span>Create New Timeline</span>
                  </Button>
                  <Button
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    variant="outline"
                  >
                    <Home className="h-6 w-6" />
                    <span>Use HDB Purchase Template</span>
                  </Button>
                  <Button
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    variant="outline"
                  >
                    <Home className="h-6 w-6" />
                    <span>Use Condo Sale Template</span>
                  </Button>
                  <Button
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    variant="outline"
                  >
                    <Home className="h-6 w-6" />
                    <span>Use Rental Template</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity & Notifications */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates on your transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transactions">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="notifications">
                      Notifications
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="transactions" className="space-y-4 mt-4">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex flex-col gap-2 p-3 border rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {transaction.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.client}
                            </div>
                          </div>
                          <Badge variant="outline">{transaction.type}</Badge>
                        </div>
                        <Progress
                          value={transaction.progress}
                          className="h-1.5"
                        />
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due:{" "}
                          {new Date(transaction.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="notifications" className="space-y-4 mt-4">
                    <div className="flex flex-col gap-2 p-3 border rounded-lg">
                      <div className="font-medium">Document Uploaded</div>
                      <div className="text-xs text-muted-foreground">
                        Sarah Lee uploaded Option to Purchase document
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2 hours ago
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 p-3 border rounded-lg">
                      <div className="font-medium">Task Completed</div>
                      <div className="text-xs text-muted-foreground">
                        John Smith completed Bank Loan Application
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Yesterday
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 p-3 border rounded-lg">
                      <div className="font-medium">Timeline Updated</div>
                      <div className="text-xs text-muted-foreground">
                        You updated Michael Tan's transaction timeline
                      </div>
                      <div className="text-xs text-muted-foreground">
                        2 days ago
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>Your current plan and usage</CardDescription>
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
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Timelines</span>
                      <span className="font-medium">5 / 15</span>
                    </div>
                    <Progress value={(5 / 15) * 100} className="h-1.5" />
                  </div>
                  <Button variant="outline" className="w-full">
                    Manage Subscription
                  </Button>
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
