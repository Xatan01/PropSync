import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  CreditCard, 
  Users, 
  Crown, 
  Check, 
  X,
  TrendingUp,
  Calendar,
  Settings,
  Plus
} from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing: "monthly" | "yearly";
  features: string[];
  limits: {
    clients: number;
    timelines: number;
    notifications: number;
    storage: string;
  };
  popular?: boolean;
}

interface AgentAccount {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
  status: "active" | "inactive";
  lastLogin: string;
  clientsManaged: number;
}

const SubscriptionManagement = () => {
  const [currentPlan, setCurrentPlan] = useState("premium");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans: SubscriptionPlan[] = [
    {
      id: "starter",
      name: "Starter",
      price: billingCycle === "monthly" ? 29 : 290,
      billing: billingCycle,
      features: [
        "Up to 10 clients",
        "5 timeline templates",
        "Basic notifications",
        "Email support",
        "1GB storage"
      ],
      limits: {
        clients: 10,
        timelines: 5,
        notifications: 100,
        storage: "1GB"
      }
    },
    {
      id: "premium",
      name: "Premium",
      price: billingCycle === "monthly" ? 79 : 790,
      billing: billingCycle,
      features: [
        "Up to 50 clients",
        "Unlimited timeline templates",
        "Advanced notifications",
        "Priority support",
        "10GB storage",
        "Custom branding",
        "Analytics dashboard"
      ],
      limits: {
        clients: 50,
        timelines: -1, // unlimited
        notifications: 1000,
        storage: "10GB"
      },
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: billingCycle === "monthly" ? 199 : 1990,
      billing: billingCycle,
      features: [
        "Unlimited clients",
        "Unlimited timeline templates",
        "Advanced automation",
        "24/7 phone support",
        "100GB storage",
        "White-label solution",
        "API access",
        "Multi-agency management"
      ],
      limits: {
        clients: -1, // unlimited
        timelines: -1, // unlimited
        notifications: -1, // unlimited
        storage: "100GB"
      }
    }
  ];

  const agentAccounts: AgentAccount[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@agency.com",
      role: "admin",
      status: "active",
      lastLogin: "2023-06-08T10:30:00Z",
      clientsManaged: 12
    },
    {
      id: "2",
      name: "Sarah Smith",
      email: "sarah.smith@agency.com",
      role: "agent",
      status: "active",
      lastLogin: "2023-06-08T09:15:00Z",
      clientsManaged: 8
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@agency.com",
      role: "agent",
      status: "inactive",
      lastLogin: "2023-06-05T14:20:00Z",
      clientsManaged: 5
    }
  ];

  const usageStats = {
    clients: 25,
    timelines: 12,
    notifications: 450,
    storage: "3.2GB"
  };

  const currentPlanData = plans.find(plan => plan.id === currentPlan);

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
            <p className="text-muted-foreground">
              Manage your subscription plan and agency accounts
            </p>
          </div>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Billing Settings
          </Button>
        </div>

        {/* Current Plan Overview */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Current Plan: {currentPlanData?.name}
                </CardTitle>
                <CardDescription>
                  ${currentPlanData?.price}/{billingCycle === "monthly" ? "month" : "year"}
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Clients</div>
                <div className="text-2xl font-bold">{usageStats.clients}</div>
                <div className="text-xs text-muted-foreground">
                  of {currentPlanData?.limits.clients === -1 ? "unlimited" : currentPlanData?.limits.clients}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ 
                      width: currentPlanData?.limits.clients === -1 ? "25%" : 
                             `${(usageStats.clients / currentPlanData!.limits.clients) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Timelines</div>
                <div className="text-2xl font-bold">{usageStats.timelines}</div>
                <div className="text-xs text-muted-foreground">
                  of {currentPlanData?.limits.timelines === -1 ? "unlimited" : currentPlanData?.limits.timelines}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: currentPlanData?.limits.timelines === -1 ? "15%" : 
                             `${(usageStats.timelines / currentPlanData!.limits.timelines) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Notifications</div>
                <div className="text-2xl font-bold">{usageStats.notifications}</div>
                <div className="text-xs text-muted-foreground">
                  of {currentPlanData?.limits.notifications === -1 ? "unlimited" : currentPlanData?.limits.notifications} this month
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: currentPlanData?.limits.notifications === -1 ? "45%" : 
                             `${(usageStats.notifications / currentPlanData!.limits.notifications) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Storage</div>
                <div className="text-2xl font-bold">{usageStats.storage}</div>
                <div className="text-xs text-muted-foreground">
                  of {currentPlanData?.limits.storage}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: "32%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="plans">
          <TabsList>
            <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
            <TabsTrigger value="agents">Agent Accounts</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={billingCycle === "monthly" ? "font-medium" : "text-muted-foreground"}>
                Monthly
              </span>
              <Switch 
                checked={billingCycle === "yearly"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
              />
              <span className={billingCycle === "yearly" ? "font-medium" : "text-muted-foreground"}>
                Yearly
              </span>
              {billingCycle === "yearly" && (
                <Badge className="bg-green-100 text-green-800">Save 17%</Badge>
              )}
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {currentPlan === plan.id && (
                        <Badge variant="outline">Current</Badge>
                      )}
                    </CardTitle>
                    <div className="text-3xl font-bold">
                      ${plan.price}
                      <span className="text-lg font-normal text-muted-foreground">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={currentPlan === plan.id ? "outline" : "default"}
                      disabled={currentPlan === plan.id}
                    >
                      {currentPlan === plan.id ? "Current Plan" : "Upgrade"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Agent Accounts</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Agent
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {agentAccounts.map((agent) => (
                    <div key={agent.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={agent.role === "admin" ? "default" : "outline"}>
                              {agent.role}
                            </Badge>
                            <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                              {agent.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {agent.clientsManaged} clients
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last login: {new Date(agent.lastLogin).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">
                            {agent.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Billing History</h2>
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Update Payment Method
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[
                    { date: "2023-06-01", amount: 79, status: "paid", plan: "Premium Monthly" },
                    { date: "2023-05-01", amount: 79, status: "paid", plan: "Premium Monthly" },
                    { date: "2023-04-01", amount: 79, status: "paid", plan: "Premium Monthly" },
                    { date: "2023-03-01", amount: 29, status: "paid", plan: "Starter Monthly" }
                  ].map((invoice, index) => (
                    <div key={index} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{invoice.plan}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(invoice.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${invoice.amount}</div>
                        <Badge className="bg-green-100 text-green-800">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SubscriptionManagement;