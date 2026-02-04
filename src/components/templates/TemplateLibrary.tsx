import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  Building,
  Key,
  FileText,
  Search,
  Plus,
  Clock,
  Users,
  GripVertical as Grip,
} from "lucide-react";

interface TemplateItem {
  id: string;
  title: string;
  description: string;
  type: "task" | "milestone" | "document";
  duration: number; // days
  dependencies?: string[];
  category: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: "hdb" | "condo" | "landed" | "rental";
  duration: number;
  tasks: number;
  items: TemplateItem[];
  color: string;
}

const TemplateLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [draggedItem, setDraggedItem] = useState<TemplateItem | null>(null);

  const templates: Template[] = [
    {
      id: "hdb-purchase",
      name: "HDB Purchase",
      description: "Complete timeline for HDB flat purchase process",
      category: "hdb",
      duration: 90,
      tasks: 12,
      color: "bg-blue-500",
      items: [
        {
          id: "hdb-1",
          title: "Initial Consultation",
          description: "Meet with client to understand requirements",
          type: "task",
          duration: 1,
          category: "consultation"
        },
        {
          id: "hdb-2", 
          title: "Property Search",
          description: "Search and shortlist suitable properties",
          type: "task",
          duration: 14,
          category: "search"
        },
        {
          id: "hdb-3",
          title: "Property Viewing",
          description: "Schedule and conduct property viewings",
          type: "milestone",
          duration: 7,
          category: "viewing"
        },
        {
          id: "hdb-4",
          title: "Option to Purchase",
          description: "Submit and process Option to Purchase",
          type: "document",
          duration: 3,
          dependencies: ["hdb-3"],
          category: "legal"
        }
      ]
    },
    {
      id: "condo-sale",
      name: "Condo Sale",
      description: "Complete timeline for condominium sale process",
      category: "condo",
      duration: 120,
      tasks: 15,
      color: "bg-green-500",
      items: [
        {
          id: "condo-1",
          title: "Property Valuation",
          description: "Conduct professional property valuation",
          type: "task",
          duration: 3,
          category: "valuation"
        },
        {
          id: "condo-2",
          title: "Marketing Strategy",
          description: "Develop marketing plan and materials",
          type: "task",
          duration: 5,
          category: "marketing"
        },
        {
          id: "condo-3",
          title: "Listing Launch",
          description: "Launch property listing on portals",
          type: "milestone",
          duration: 1,
          dependencies: ["condo-1", "condo-2"],
          category: "marketing"
        }
      ]
    },
    {
      id: "rental-agreement",
      name: "Rental Agreement",
      description: "Streamlined rental process for landlords and tenants",
      category: "rental",
      duration: 30,
      tasks: 8,
      color: "bg-purple-500",
      items: [
        {
          id: "rental-1",
          title: "Tenant Screening",
          description: "Background check and income verification",
          type: "task",
          duration: 3,
          category: "screening"
        },
        {
          id: "rental-2",
          title: "Lease Agreement",
          description: "Prepare and review lease agreement",
          type: "document",
          duration: 2,
          category: "legal"
        }
      ]
    }
  ];

  const handleDragStart = (item: TemplateItem) => {
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task":
        return <Clock className="h-4 w-4" />;
      case "milestone":
        return <div className="w-4 h-4 rounded-full bg-primary" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hdb":
        return <Home className="h-5 w-5" />;
      case "condo":
        return <Building className="h-5 w-5" />;
      case "rental":
        return <Key className="h-5 w-5" />;
      default:
        return <Home className="h-5 w-5" />;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Template Library</h1>
            <p className="text-muted-foreground">
              Drag and drop timeline templates to create new client workflows
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Custom Template
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="hdb">HDB</TabsTrigger>
              <TabsTrigger value="condo">Condo</TabsTrigger>
              <TabsTrigger value="rental">Rental</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    <CardTitle>{template.name}</CardTitle>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${template.color}`} />
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Template Stats */}
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{template.duration} days</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{template.tasks} tasks</span>
                    </div>
                  </div>

                  {/* Draggable Items */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Template Items:
                    </div>
                    {template.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item)}
                        onDragEnd={handleDragEnd}
                        className="flex items-center gap-2 p-2 border rounded cursor-move hover:bg-accent/50 transition-colors"
                      >
                        <Grip className="h-4 w-4 text-muted-foreground" />
                        {getTypeIcon(item.type)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.duration}d
                        </Badge>
                      </div>
                    ))}
                    {template.items.length > 4 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{template.items.length - 4} more items
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" size="sm">
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Drag Drop Zone */}
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-muted-foreground mb-2">
                Drag template items here to create a custom timeline
              </div>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Start Building Timeline
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TemplateLibrary;
