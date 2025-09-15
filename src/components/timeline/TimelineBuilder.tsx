import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Calendar,
  Clock,
  FileText,
  Users,
  Trash2,
  Save,
  ChevronRight,
} from "lucide-react";

interface TimelineItem {
  id: string;
  type: "task" | "milestone";
  title: string;
  description: string;
  date: string;
  position: { x: number; y: number };
  completed: boolean;
}

interface TimelineTemplate {
  id: string;
  name: string;
  description: string;
  items: TimelineItem[];
}

const TimelineBuilder = ({
  clientId = "",
  onSave = () => {},
}: {
  clientId?: string;
  onSave?: (timeline: any) => void;
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [timelineName, setTimelineName] = useState("New Timeline");
  const [timelineDescription, setTimelineDescription] = useState("");
  const [draggedItem, setDraggedItem] = useState<TimelineItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  // Mock templates
  const templates: TimelineTemplate[] = [
    {
      id: "hdb-purchase",
      name: "HDB Purchase",
      description: "Timeline template for HDB purchase process",
      items: [
        {
          id: "1",
          type: "milestone",
          title: "Option to Purchase",
          description: "Sign OTP with seller",
          date: "2023-06-01",
          position: { x: 100, y: 100 },
          completed: false,
        },
        {
          id: "2",
          type: "task",
          title: "HDB Appointment",
          description: "Schedule appointment with HDB",
          date: "2023-06-15",
          position: { x: 300, y: 100 },
          completed: false,
        },
        {
          id: "3",
          type: "milestone",
          title: "Completion",
          description: "Complete purchase and key collection",
          date: "2023-07-30",
          position: { x: 500, y: 100 },
          completed: false,
        },
      ],
    },
    {
      id: "condo-sale",
      name: "Condo Sale",
      description: "Timeline template for selling a condominium",
      items: [
        {
          id: "1",
          type: "milestone",
          title: "Listing",
          description: "Property listed on market",
          date: "2023-06-01",
          position: { x: 100, y: 100 },
          completed: false,
        },
        {
          id: "2",
          type: "task",
          title: "Viewings",
          description: "Schedule property viewings",
          date: "2023-06-15",
          position: { x: 300, y: 100 },
          completed: false,
        },
        {
          id: "3",
          type: "milestone",
          title: "Offer Accepted",
          description: "Buyer offer accepted",
          date: "2023-07-01",
          position: { x: 500, y: 100 },
          completed: false,
        },
        {
          id: "4",
          type: "task",
          title: "Legal Process",
          description: "Complete legal documentation",
          date: "2023-07-15",
          position: { x: 700, y: 100 },
          completed: false,
        },
        {
          id: "5",
          type: "milestone",
          title: "Completion",
          description: "Sale completed",
          date: "2023-08-01",
          position: { x: 900, y: 100 },
          completed: false,
        },
      ],
    },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setTimelineItems(template.items);
      setTimelineName(template.name);
      setTimelineDescription(template.description);
    }
  };

  const handleAddItem = (type: "task" | "milestone") => {
    const newItem: TimelineItem = {
      id: `item-${Date.now()}`,
      type,
      title: type === "task" ? "New Task" : "New Milestone",
      description: "",
      date: new Date().toISOString().split("T")[0],
      position: { x: 100, y: 200 },
      completed: false,
    };
    setTimelineItems([...timelineItems, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setTimelineItems(timelineItems.filter((item) => item.id !== id));
  };

  const handleItemDragStart = (item: TimelineItem) => {
    setDraggedItem(item);
  };

  const handleItemDragEnd = (e: React.MouseEvent, item: TimelineItem) => {
    if (draggedItem) {
      const canvasRect = document
        .getElementById("timeline-canvas")
        ?.getBoundingClientRect();
      if (canvasRect) {
        const updatedItems = timelineItems.map((i) => {
          if (i.id === item.id) {
            return {
              ...i,
              position: {
                x: e.clientX - canvasRect.left,
                y: e.clientY - canvasRect.top,
              },
            };
          }
          return i;
        });
        setTimelineItems(updatedItems);
      }
      setDraggedItem(null);
    }
  };

  const handleSaveTimeline = () => {
    const timeline = {
      name: timelineName,
      description: timelineDescription,
      items: timelineItems,
      clientId,
      createdAt: new Date().toISOString(),
    };
    onSave(timeline);
    // Here you would typically save to your backend
    console.log("Saving timeline:", timeline);
  };

  return (
    <div className="bg-background w-full h-full flex flex-col">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Choose a Timeline Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer hover:border-primary transition-colors ${selectedTemplate === template.id ? "border-primary" : ""}`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {template.items.length} items
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => setIsDialogOpen(false)}
              disabled={!selectedTemplate}
            >
              Select Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center p-4 border-b">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{timelineName}</h2>
          <p className="text-sm text-muted-foreground">{timelineDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            Change Template
          </Button>
          <Button onClick={handleSaveTimeline}>
            <Save className="mr-2 h-4 w-4" /> Save Timeline
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Tools */}
        <div className="w-64 border-r p-4 bg-muted/20">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Timeline Details</h3>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="timeline-name">Name</Label>
                  <Input
                    id="timeline-name"
                    value={timelineName}
                    onChange={(e) => setTimelineName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="timeline-desc">Description</Label>
                  <Input
                    id="timeline-desc"
                    value={timelineDescription}
                    onChange={(e) => setTimelineDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Add Items</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAddItem("task")}
                >
                  <FileText className="mr-2 h-4 w-4" /> Add Task
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAddItem("milestone")}
                >
                  <Calendar className="mr-2 h-4 w-4" /> Add Milestone
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Assign Client</h3>
              <Select defaultValue={clientId || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client-1">John Doe</SelectItem>
                  <SelectItem value="client-2">Jane Smith</SelectItem>
                  <SelectItem value="client-3">Robert Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main canvas area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="canvas" className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <TabsList>
                <TabsTrigger value="canvas">Canvas</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="canvas" className="flex-1 overflow-hidden">
              <div
                id="timeline-canvas"
                className="w-full h-full relative bg-muted/10 overflow-auto p-4"
              >
                {/* Timeline connector line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted-foreground/20 z-0"></div>

                {/* Timeline items */}
                {timelineItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className={`absolute p-4 rounded-lg shadow-md z-10 cursor-move ${item.type === "milestone" ? "bg-primary/10 border-primary/30" : "bg-card"}`}
                    style={{
                      left: `${item.position.x}px`,
                      top: `${item.position.y}px`,
                      width: "200px",
                      border: "1px solid",
                      borderColor:
                        item.type === "milestone"
                          ? "hsl(var(--primary) / 0.3)"
                          : "hsl(var(--border))",
                    }}
                    drag
                    dragMomentum={false}
                    onDragStart={() => handleItemDragStart(item)}
                    onDragEnd={(e) => handleItemDragEnd(e as any, item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{item.title}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" /> {item.date}
                    </div>
                    {item.type === "milestone" && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary"></div>
                    )}
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {timelineItems
                    .sort(
                      (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime(),
                    )
                    .map((item) => (
                      <Card key={item.id}>
                        <CardHeader className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              {item.type === "milestone" ? (
                                <div className="w-4 h-4 rounded-full bg-primary mr-2"></div>
                              ) : (
                                <FileText className="h-4 w-4 mr-2" />
                              )}
                              <CardTitle className="text-base">
                                {item.title}
                              </CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" /> {item.date}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar - Item properties */}
        <div className="w-64 border-l p-4 bg-muted/20">
          <h3 className="text-lg font-medium mb-4">Properties</h3>
          {draggedItem ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item-title">Title</Label>
                <Input id="item-title" defaultValue={draggedItem.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-desc">Description</Label>
                <Input id="item-desc" defaultValue={draggedItem.description} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-date">Date</Label>
                <Input
                  id="item-date"
                  type="date"
                  defaultValue={draggedItem.date}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue={draggedItem.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select an item to edit its properties
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineBuilder;