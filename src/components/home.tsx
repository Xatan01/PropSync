import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Plus,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Home as HomeIcon,
} from "lucide-react";

const Home = () => {
  // Mock data for demonstration
  const clients = [
    {
      id: 1,
      name: "Sarah Chen",
      property: "Clementi HDB, 4-Room",
      status: "In Progress",
      progress: 65,
      nextTask: "Submit Option Fee by 15 May",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      type: "HDB Purchase",
    },
    {
      id: 2,
      name: "Michael Tan",
      property: "The Clement Canopy, 2-Bedroom",
      status: "Early Stage",
      progress: 25,
      nextTask: "Property Viewing on 12 May",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      type: "Condo Sale",
    },
    {
      id: 3,
      name: "Priya Singh",
      property: "Tampines GreenVines, 5-Room",
      status: "Completing",
      progress: 85,
      nextTask: "Final Walkthrough on 10 May",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      type: "HDB Sale",
    },
  ];

  const templates = [
    { id: 1, name: "HDB Purchase", tasks: 12, days: 90 },
    { id: 2, name: "Condo Sale", tasks: 15, days: 120 },
    { id: 3, name: "Commercial Lease", tasks: 10, days: 60 },
    { id: 4, name: "Private Property Purchase", tasks: 14, days: 100 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Early Stage":
        return "bg-purple-100 text-purple-800";
      case "Completing":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-purple-500";
    if (progress < 70) return "bg-blue-500";
    return "bg-amber-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HomeIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">PropAgent</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Premium Subscription
            </Badge>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Agent Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your clients and property transactions
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Timeline
            </Button>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" /> Add Client
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-md">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Active Clients
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900">12</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-md">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Ongoing Transactions
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900">8</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-md">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Upcoming Tasks
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900">23</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="clients">My Clients</TabsTrigger>
            <TabsTrigger value="templates">Timeline Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Client Transactions</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Clock className="mr-2 h-4 w-4" /> Sort by Date
                </Button>
                <Button variant="outline" size="sm">
                  <DollarSign className="mr-2 h-4 w-4" /> Sort by Value
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Card key={client.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={client.avatar} />
                          <AvatarFallback>
                            {client.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {client.name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {client.property}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{client.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(client.progress)}`}
                          style={{ width: `${client.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Next Task</p>
                        <p className="text-sm text-gray-600">
                          {client.nextTask}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50 flex justify-between">
                    <Badge variant="outline">{client.type}</Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/client/${client.id}`}>View Timeline</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Available Templates</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Custom Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>
                      Standard timeline template
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{template.tasks} Tasks</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        <span>~{template.days} Days</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-gray-50">
                    <Button className="w-full" variant="outline" asChild>
                      <Link to={`/templates/${template.id}`}>Use Template</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Home;
