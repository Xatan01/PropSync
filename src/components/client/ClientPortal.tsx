import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  MessageSquare,
  Phone,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  description: string;
}

interface Property {
  id: string;
  address: string;
  type: string;
  transactionType: "purchase" | "sale";
  progress: number;
  tasks: Task[];
  milestones: Milestone[];
  agentName: string;
  agentAvatar: string;
}

const ClientPortal = () => {
  // Default properties with mock data
  const [properties, setProperties] = useState<Property[]>([
    {
      id: "1",
      address: "123 Orchard Road, #12-34, Singapore 123456",
      type: "Condominium",
      transactionType: "purchase",
      progress: 65,
      agentName: "Sarah Tan",
      agentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      tasks: [
        {
          id: "t1",
          title: "Submit loan application",
          dueDate: "2023-06-15",
          completed: true,
          priority: "high",
        },
        {
          id: "t2",
          title: "Sign Option to Purchase",
          dueDate: "2023-06-20",
          completed: true,
          priority: "high",
        },
        {
          id: "t3",
          title: "Complete home inspection",
          dueDate: "2023-07-05",
          completed: false,
          priority: "medium",
        },
        {
          id: "t4",
          title: "Prepare downpayment",
          dueDate: "2023-07-10",
          completed: false,
          priority: "high",
        },
      ],
      milestones: [
        {
          id: "m1",
          title: "Property Viewing",
          date: "2023-05-20",
          completed: true,
          description: "Initial viewing of the property",
        },
        {
          id: "m2",
          title: "Option Fee Payment",
          date: "2023-06-01",
          completed: true,
          description: "1% option fee paid to seller",
        },
        {
          id: "m3",
          title: "Exercise Option",
          date: "2023-07-15",
          completed: false,
          description: "Exercise Option to Purchase",
        },
        {
          id: "m4",
          title: "Completion",
          date: "2023-08-30",
          completed: false,
          description: "Final payment and key collection",
        },
      ],
    },
    {
      id: "2",
      address: "456 Tampines Street 42, #05-123, Singapore 520456",
      type: "HDB",
      transactionType: "sale",
      progress: 30,
      agentName: "Michael Lim",
      agentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      tasks: [
        {
          id: "t5",
          title: "Prepare property for viewing",
          dueDate: "2023-06-10",
          completed: true,
          priority: "medium",
        },
        {
          id: "t6",
          title: "Gather necessary documents",
          dueDate: "2023-06-18",
          completed: true,
          priority: "high",
        },
        {
          id: "t7",
          title: "Review offers",
          dueDate: "2023-07-01",
          completed: false,
          priority: "high",
        },
        {
          id: "t8",
          title: "Prepare for handover",
          dueDate: "2023-08-15",
          completed: false,
          priority: "medium",
        },
      ],
      milestones: [
        {
          id: "m5",
          title: "Property Listing",
          date: "2023-05-15",
          completed: true,
          description: "Property listed on portals",
        },
        {
          id: "m6",
          title: "First Viewing",
          date: "2023-06-05",
          completed: true,
          description: "First batch of potential buyers",
        },
        {
          id: "m7",
          title: "Offer Acceptance",
          date: "2023-07-10",
          completed: false,
          description: "Accept buyer offer",
        },
        {
          id: "m8",
          title: "Completion",
          date: "2023-09-15",
          completed: false,
          description: "Final handover to buyer",
        },
      ],
    },
  ]);

  const [selectedProperty, setSelectedProperty] = useState<string>(
    properties[0]?.id || "",
  );

  // Find the currently selected property
  const currentProperty =
    properties.find((p) => p.id === selectedProperty) || properties[0];

  // Handle task completion toggle
  const toggleTaskCompletion = (taskId: string) => {
    setProperties((prevProperties) =>
      prevProperties.map((property) => {
        if (property.id === selectedProperty) {
          return {
            ...property,
            tasks: property.tasks.map((task) =>
              task.id === taskId
                ? { ...task, completed: !task.completed }
                : task,
            ),
          };
        }
        return property;
      }),
    );
  };

  // Calculate upcoming tasks (not completed and due within 7 days)
  const upcomingTasks =
    currentProperty?.tasks.filter(
      (task) =>
        !task.completed &&
        new Date(task.dueDate) <=
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ) || [];

  return (
    <div className="bg-background min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Client Portal</h1>
            <p className="text-muted-foreground">
              Track your property transaction progress
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0 space-x-2">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Agent
            </Button>
          </div>
        </div>

        {/* Property Selector */}
        {properties.length > 1 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Your Properties</h2>
            <div className="flex flex-wrap gap-2">
              {properties.map((property) => (
                <Button
                  key={property.id}
                  variant={
                    selectedProperty === property.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedProperty(property.id)}
                  className="flex items-center"
                >
                  <Home className="h-4 w-4 mr-2" />
                  {property.address.split(",")[0]}
                  <Badge variant="secondary" className="ml-2">
                    {property.transactionType === "purchase"
                      ? "Buying"
                      : "Selling"}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}

        {currentProperty && (
          <>
            {/* Property Overview Card */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <CardTitle>{currentProperty.address}</CardTitle>
                    <CardDescription>
                      {currentProperty.type} •{" "}
                      {currentProperty.transactionType === "purchase"
                        ? "Purchase"
                        : "Sale"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center mt-4 md:mt-0">
                    <Avatar className="h-10 w-10 mr-2">
                      <AvatarImage
                        src={currentProperty.agentAvatar}
                        alt={currentProperty.agentName}
                      />
                      <AvatarFallback>
                        {currentProperty.agentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {currentProperty.agentName}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>Contact Agent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">
                      Transaction Progress
                    </span>
                    <span className="text-sm font-medium">
                      {currentProperty.progress}%
                    </span>
                  </div>
                  <Progress value={currentProperty.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Timeline</CardTitle>
                    <CardDescription>
                      Key milestones in your property transaction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>

                      {/* Timeline items */}
                      <div className="space-y-8 relative">
                        {currentProperty.milestones.map((milestone, index) => (
                          <div key={milestone.id} className="ml-10 relative">
                            {/* Timeline dot */}
                            <div
                              className={`absolute -left-10 -mt-1 flex items-center justify-center w-8 h-8 rounded-full border ${milestone.completed ? "bg-primary border-primary" : "bg-background border-muted"}`}
                            >
                              {milestone.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                              ) : (
                                <span className="text-xs font-medium">
                                  {index + 1}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <h3 className="text-base font-medium">
                                  {milestone.title}
                                </h3>
                                <Badge
                                  variant={
                                    milestone.completed ? "default" : "outline"
                                  }
                                  className="ml-2"
                                >
                                  {milestone.completed
                                    ? "Completed"
                                    : "Pending"}
                                </Badge>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{milestone.date}</span>
                              </div>
                              <p className="text-sm mt-1">
                                {milestone.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Tasks</CardTitle>
                    <CardDescription>
                      Tasks that require your attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentProperty.tasks.length > 0 ? (
                        currentProperty.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start space-x-3 p-3 rounded-md border"
                          >
                            <Checkbox
                              id={task.id}
                              checked={task.completed}
                              onCheckedChange={() =>
                                toggleTaskCompletion(task.id)
                              }
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={task.id}
                                className={`text-sm font-medium cursor-pointer ${task.completed ? "line-through text-muted-foreground" : ""}`}
                              >
                                {task.title}
                              </label>
                              <div className="flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Due: {task.dueDate}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`ml-2 ${task.priority === "high" ? "border-red-500 text-red-500" : task.priority === "medium" ? "border-amber-500 text-amber-500" : "border-green-500 text-green-500"}`}
                                >
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>No tasks available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Required Documents</CardTitle>
                    <CardDescription>
                      Documents needed for your transaction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Placeholder document items */}
                      {[
                        "Option to Purchase",
                        "Loan Application",
                        "Property Valuation",
                        "ID Verification",
                      ].map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 rounded-md border"
                        >
                          <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc}</p>
                            <p className="text-xs text-muted-foreground">
                              PDF Document
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" className="ml-auto">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Upcoming Tasks Section */}
            <div className="mt-6">
              <h2 className="text-lg font-medium mb-2">Upcoming Tasks</h2>
              <Card>
                <CardContent className="p-4">
                  {upcomingTasks.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center p-2 rounded-md bg-muted/50"
                        >
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Due: {task.dueDate}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`ml-auto ${task.priority === "high" ? "border-red-500 text-red-500" : "border-amber-500 text-amber-500"}`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No upcoming tasks</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t px-4 py-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Full Calendar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;
