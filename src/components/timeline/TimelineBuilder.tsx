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
  Edge,
  Node,
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Trash2,
  FileText,
  Calendar,
  Save,
} from "lucide-react";

// ---------------- Helper ----------------
const formatDate = (iso: string) => {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
};

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
  const isMilestone = data.type === "milestone";

  return (
    <Card
      className={`relative p-3 shadow-md border w-[220px] cursor-pointer ${
        isMilestone
          ? "bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary"
          : "bg-card"
      }`}
    >
      <CardHeader className="p-0 mb-2 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          {isMilestone && <Calendar className="h-4 w-4 text-primary" />}
          <CardTitle className={isMilestone ? "text-base font-bold" : "text-sm"}>
            {data.title}
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete(data.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardDescription className="text-xs text-muted-foreground">
        {data.description}
      </CardDescription>
      <CardContent className="p-0 pt-2 flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" /> {formatDate(data.date)}
      </CardContent>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

const nodeTypes = { timelineNode: TimelineNode };

// ---------------- Main Component ----------------
const TimelineBuilder = () => {
  const templates: TimelineTemplate[] = [
    {
      id: "hdb",
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
  ];

  const [selectedTemplate, setSelectedTemplate] =
    useState<TimelineTemplate | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Build edges automatically based on date
  const buildEdgesFromNodes = (items: TimelineItem[]): Edge[] => {
    const sorted = [...items].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const edges: Edge[] = [];
    sorted.forEach((item, i) => {
      const next = sorted[i + 1];
      if (next) {
        edges.push({
          id: `e${item.id}-${next.id}`,
          source: item.id,
          target: next.id,
          animated: true,
          markerEnd: { type: "arrowclosed" },
        });
      }
    });
    return edges;
  };

  // Select template
  const handleSelectTemplate = (template: TimelineTemplate) => {
    setSelectedTemplate(template);

    const nodes = template.items.map((item, idx) => ({
      id: item.id,
      type: "timelineNode",
      position: { x: 220 * idx, y: 100 },
      data: {
        ...item,
        onDelete: (id: string) => handleDeleteNode(id),
      },
    }));

    setNodes(nodes);
    setEdges(buildEdgesFromNodes(template.items));
    setIsDialogOpen(false);
  };

  // Delete node
  const handleDeleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  // Add Task / Milestone
  const handleAddNode = (type: "task" | "milestone") => {
    const id = `n-${Date.now()}`;
    const newItem: TimelineItem = {
      id,
      type,
      title: type === "task" ? "New Task" : "New Milestone",
      description: "",
      date: new Date().toISOString().split("T")[0],
      position: { x: 100, y: 200 },
      completed: false,
    };
    setNodes((nds) => [
      ...nds,
      {
        id: newItem.id,
        type: "timelineNode",
        position: newItem.position,
        data: {
          ...newItem,
          onDelete: (id: string) => handleDeleteNode(id),
        },
      },
    ]);
  };

  const onConnect = useCallback(
    (params: any) =>
      setEdges((eds) =>
        addEdge(
          { ...params, animated: true, markerEnd: { type: "arrowclosed" } },
          eds
        )
      ),
    [setEdges]
  );

  // Update node data when editing properties
  const updateNodeData = (field: string, value: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNodeId
          ? { ...n, data: { ...n.data, [field]: value } }
          : n
      )
    );
  };

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

          {/* Body */}
          <Tabs defaultValue="canvas" className="flex flex-1 flex-col">
            <div className="p-2 border-b">
              <TabsList>
                <TabsTrigger value="canvas">Canvas</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
            </div>

            {/* Canvas View */}
            <TabsContent value="canvas" className="flex flex-1 overflow-hidden">
              <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-72 border-r p-4 bg-muted/20 overflow-auto">
                  <h3 className="text-lg font-medium mb-2">Timeline Details</h3>
                  <Label>Name</Label>
                  <Input defaultValue={selectedTemplate.name} className="mb-2" />
                  <Label>Description</Label>
                  <Input
                    defaultValue={selectedTemplate.description}
                    className="mb-4"
                  />
                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium mb-2">Add Items</h3>
                  <Button
                    variant="outline"
                    className="w-full justify-start mb-2"
                    onClick={() => handleAddNode("task")}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Add Task
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAddNode("milestone")}
                  >
                    <Calendar className="mr-2 h-4 w-4" /> Add Milestone
                  </Button>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-muted/5">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                    fitView
                    proOptions={{ hideAttribution: true }} 
                  >
                    <Background />
                    <Controls />
                    <MiniMap />
                  </ReactFlow>
                </div>

                {/* Right Sidebar */}
<div className="w-72 border-l p-4 bg-muted/20 overflow-auto">
  <h3 className="text-lg font-medium mb-4">Properties</h3>
  {selectedNode ? (
    <div className="space-y-2">
      <Label>Title</Label>
      <Input
        value={selectedNode.data.title}
        onChange={(e) => updateNodeData("title", e.target.value)}
      />
      <Label>Description</Label>
      <Input
        value={selectedNode.data.description}
        onChange={(e) =>
          updateNodeData("description", e.target.value)
        }
      />
      <Label>Date (dd/mm/yyyy)</Label>
      <Input
        value={formatDate(selectedNode.data.date)} // show dd/mm/yyyy
        onChange={(e) => {
          const input = e.target.value;
          // only update if valid format dd/mm/yyyy
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
            updateNodeData("date", parseDate(input));
          }
        }}
      />
      <Label>Type</Label>
      <Select
        value={selectedNode.data.type}
        onValueChange={(val) => updateNodeData("type", val)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="task">Task</SelectItem>
          <SelectItem value="milestone">Milestone</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">
      Select a node to edit its properties
    </p>
  )}
</div>

              </div>
            </TabsContent>

            {/* List View */}
            <TabsContent value="list" className="flex-1 overflow-auto p-4">
              {nodes
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.data.date).getTime() -
                    new Date(b.data.date).getTime()
                )
                .map((item) => (
                  <Card key={item.id} className="mb-2">
                    <CardHeader className="p-2 flex flex-row justify-between items-center">
                      <div className="flex items-center gap-2">
                        {item.data.type === "milestone" ? (
                          <Calendar className="h-4 w-4 text-primary" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        <CardTitle className="text-sm">
                          {item.data.title}
                        </CardTitle>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.data.date)}
                      </span>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      {item.data.description}
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default TimelineBuilder;
