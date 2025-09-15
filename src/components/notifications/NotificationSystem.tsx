import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  Settings,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users
} from "lucide-react";

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  channels: string[];
  enabled: boolean;
  template: string;
}

interface NotificationHistory {
  id: string;
  type: string;
  recipient: string;
  message: string;
  channel: string;
  status: "sent" | "delivered" | "failed";
  timestamp: string;
}

const NotificationSystem = () => {
  const [activeTab, setActiveTab] = useState("rules");
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleDescription, setNewRuleDescription] = useState("");

  const notificationRules: NotificationRule[] = [
    {
      id: "task-reminder",
      name: "Task Reminder",
      description: "Remind clients about upcoming tasks 24 hours before due date",
      trigger: "task_due_24h",
      channels: ["email", "sms"],
      enabled: true,
      template: "Hi {{client_name}}, reminder that {{task_name}} is due tomorrow ({{due_date}}). Please complete it at your earliest convenience."
    },
    {
      id: "milestone-update",
      name: "Milestone Completed",
      description: "Notify clients when a milestone is reached",
      trigger: "milestone_completed",
      channels: ["email", "push"],
      enabled: true,
      template: "Great news {{client_name}}! We've completed {{milestone_name}} for your {{property_address}} transaction."
    },
    {
      id: "document-required",
      name: "Document Required",
      description: "Alert clients when documents need to be submitted",
      trigger: "document_required",
      channels: ["email", "sms", "push"],
      enabled: true,
      template: "{{client_name}}, we need you to submit {{document_name}} for your property transaction. Please upload it to your client portal."
    },
    {
      id: "appointment-reminder",
      name: "Appointment Reminder",
      description: "Remind clients about scheduled appointments",
      trigger: "appointment_24h",
      channels: ["email", "sms"],
      enabled: false,
      template: "Hi {{client_name}}, this is a reminder about your appointment tomorrow at {{appointment_time}} for {{appointment_purpose}}."
    }
  ];

  const notificationHistory: NotificationHistory[] = [
    {
      id: "1",
      type: "Task Reminder",
      recipient: "sarah.chen@email.com",
      message: "Reminder: Submit Option Fee is due tomorrow",
      channel: "email",
      status: "delivered",
      timestamp: "2023-06-08T10:30:00Z"
    },
    {
      id: "2",
      type: "Milestone Update",
      recipient: "+65 9123 4567",
      message: "Great news! Property viewing completed for Clementi HDB",
      channel: "sms",
      status: "sent",
      timestamp: "2023-06-08T09:15:00Z"
    },
    {
      id: "3",
      type: "Document Required",
      recipient: "michael.tan@email.com",
      message: "Please submit Income Statement for your transaction",
      channel: "email",
      status: "failed",
      timestamp: "2023-06-08T08:45:00Z"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "sent":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "push":
        return <Bell className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notification System</h1>
            <p className="text-muted-foreground">
              Automate client communications and reduce manual follow-ups
            </p>
          </div>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Notification Settings
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                  <p className="text-2xl font-bold">
                    {notificationRules.filter(rule => rule.enabled).length}
                  </p>
                </div>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sent Today</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                  <p className="text-2xl font-bold">98.5%</p>
                </div>
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="rules">Notification Rules</TabsTrigger>
            <TabsTrigger value="history">Message History</TabsTrigger>
            <TabsTrigger value="templates">Message Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Automated Notification Rules</h2>
              <Button>Add New Rule</Button>
            </div>

            <div className="grid gap-4">
              {notificationRules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {rule.name}
                          <Switch checked={rule.enabled} />
                        </CardTitle>
                        <CardDescription>{rule.description}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Trigger:</p>
                        <Badge variant="outline">{rule.trigger}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Channels:</p>
                        <div className="flex gap-2">
                          {rule.channels.map((channel) => (
                            <div key={channel} className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
                              {getChannelIcon(channel)}
                              <span className="text-sm capitalize">{channel}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Message Template:</p>
                        <div className="p-3 bg-muted rounded-md text-sm">
                          {rule.template}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Message History</h2>
              <div className="flex gap-2">
                <Input placeholder="Search messages..." className="w-64" />
                <Button variant="outline">Filter</Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {notificationHistory.map((notification) => (
                    <div key={notification.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(notification.status)}
                        <div>
                          <div className="font-medium">{notification.type}</div>
                          <div className="text-sm text-muted-foreground">
                            To: {notification.recipient}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {notification.message}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {getChannelIcon(notification.channel)}
                          <span className="text-sm capitalize">{notification.channel}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                        <Badge 
                          variant={notification.status === "delivered" ? "default" : 
                                  notification.status === "failed" ? "destructive" : "secondary"}
                          className="mt-1"
                        >
                          {notification.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Message Templates</h2>
              <Button>Create Template</Button>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Template</CardTitle>
                  <CardDescription>
                    Design reusable message templates with dynamic variables
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Template Name</label>
                    <Input 
                      placeholder="e.g., Property Viewing Confirmation"
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message Content</label>
                    <Textarea 
                      placeholder="Hi {{client_name}}, your property viewing for {{property_address}} is confirmed for {{date}} at {{time}}."
                      value={newRuleDescription}
                      onChange={(e) => setNewRuleDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button>Save Template</Button>
                    <Button variant="outline">Preview</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Variables</CardTitle>
                  <CardDescription>
                    Use these variables in your templates for dynamic content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      "{{client_name}}", "{{property_address}}", "{{task_name}}", 
                      "{{due_date}}", "{{appointment_time}}", "{{milestone_name}}",
                      "{{document_name}}", "{{agent_name}}", "{{transaction_type}}"
                    ].map((variable) => (
                      <Badge key={variable} variant="outline" className="justify-center">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationSystem;