import React, { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Trash2, FileText, Calendar, Save } from "lucide-react";

// ---------------- Types ----------------
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

// ---------------- Custom Node ----------------
const TimelineNode = ({ data }: any) => {
  return (
    <Card
      className={`p-3 shadow-md border relative w-[200px] ${
        data.type === "milestone"
          ? "bg-primary/10 border-primary/30"
          : "bg-card"
      }`}
    >
      <CardHeader className="p-0 mb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-sm">{data.title}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => data.onDelete(data.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardDescription className="text-xs text-muted-foreground">
        {data.description}
      </CardDescription>
      <CardContent className="p-0 pt-2 flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" /> {data.date}
      </CardContent>

      {data.type === "milestone" && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary"></div>
      )}

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

const nodeTypes = { timelineNode: TimelineNode };

// ---------------- Main Component ----------------
const TimelineBuilder = () => {
  // Templates
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
          position: { x: 350, y: 100 },
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
          position: { x: 350, y: 100 },
          completed: false,
        },
      ],
    },
  ];

  // State
  const [selectedTemplate, setSelectedTemplate] = useState<TimelineTemplate | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  // Build nodes when template chosen
  const handleSelectTemplate = (template: TimelineTemplate) => {
    setSelectedTemplate(template);
    setNodes(
      template.items.map((item) => ({
        id: item.id,
        type: "timelineNode",
        position: item.position,
        data: {
          ...item,
          onDelete: (id: string) => handleDeleteNode(id),
        },
      }))
    );
    setEdges([]);
    setIsDialogOpen(false);
  };

  const handleDeleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Template Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Choose a Timeline Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectTemplate(template)}
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
        </DialogContent>
      </Dialog>

      {selectedTemplate && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedTemplate.description}
              </p>
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" /> Save Timeline
            </Button>
          </div>

          {/* Body: Sidebar + Canvas + Sidebar */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left sidebar */}
            <div className="w-64 border-r p-4 bg-muted/20 space-y-4">
              <h3 className="text-lg font-medium mb-2">Timeline Details</h3>
              <div className="space-y-2">
                <Label htmlFor="timeline-name">Name</Label>
                <Input id="timeline-name" defaultValue={selectedTemplate.name} />
                <Label htmlFor="timeline-desc">Description</Label>
                <Input id="timeline-desc" defaultValue={selectedTemplate.description} />
              </div>
              <Separator />
              <h3 className="text-lg font-medium mb-2">Add Items</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" /> Add Task
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" /> Add Milestone
                </Button>
              </div>
              <Separator />
              <h3 className="text-lg font-medium mb-2">Assign Client</h3>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client-1">John Doe</SelectItem>
                  <SelectItem value="client-2">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Canvas */}
            <div className="flex-1">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>

            {/* Right sidebar */}
            <div className="w-64 border-l p-4 bg-muted/20">
              <h3 className="text-lg font-medium mb-4">Properties</h3>
              <p className="text-sm text-muted-foreground">
                Select a node to edit its properties
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TimelineBuilder;
