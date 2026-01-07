import React, { useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Save, Plus, Home, Building2, CheckCircle2, Trash2, FileText, Bell 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ---------------- Helper ----------------
const formatDate = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-SG", { day: '2-digit', month: 'short' });
};

// ---------------- PropSync Custom Node (Matches Dashboard Badges/Text) ----------------
const TimelineNode = ({ data, selected }: any) => {
  const isMilestone = data.type === "milestone";

  return (
    <div className="flex flex-col items-center min-w-[150px]">
      <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-sm ${
        selected ? "bg-primary border-primary/20 scale-110 shadow-md" : "bg-background border-muted"
      }`}>
        {isMilestone ? (
          <Calendar className={`h-5 w-5 ${selected ? "text-primary-foreground" : "text-primary"}`} />
        ) : (
          <CheckCircle2 className={`h-5 w-5 ${selected ? "text-primary-foreground" : "text-muted-foreground"}`} />
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mb-1">
          {formatDate(data.date)}
        </p>
        <h4 className={`text-sm font-semibold leading-tight px-2 ${selected ? "text-primary" : "text-foreground"}`}>
          {data.title}
        </h4>
        <p className="text-[11px] text-muted-foreground line-clamp-2 italic mt-1 max-w-[160px]">
          {data.description || "Click to add details..."}
        </p>
      </div>

      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
};

const nodeTypes = { timelineNode: TimelineNode };

const BuilderContent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const buildEdges = (nodesList: any[]) => {
    return nodesList.slice(0, -1).map((node, i) => ({
      id: `e-${node.id}`,
      source: node.id,
      target: nodesList[i + 1].id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 4, opacity: 0.2 },
    }));
  };

  const handleSelectTemplate = (type: string) => {
    const initialItems = [
      { id: '1', type: 'milestone', title: 'Option to Purchase', date: '2024-06-01', description: 'Sign OTP with seller' },
      { id: '2', type: 'task', title: 'Valuation Request', date: '2024-06-05', description: 'Submit via HDB portal' }
    ];
    const formattedNodes = initialItems.map((item, idx) => ({
      id: item.id,
      type: "timelineNode",
      position: { x: 250 * idx, y: 150 },
      data: { ...item },
    }));
    setNodes(formattedNodes);
    setEdges(buildEdges(formattedNodes));
    setIsDialogOpen(false);
  };

  const handleAddNode = (type: "task" | "milestone") => {
    const id = `n-${Date.now()}`;
    const newX = nodes.length * 250;
    const newNode = {
      id,
      type: "timelineNode",
      position: { x: newX, y: 150 },
      data: {
        id,
        type,
        title: type === "task" ? "New Action Task" : "New Milestone",
        description: "",
        date: new Date().toISOString().split("T")[0],
      },
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setEdges(buildEdges(updatedNodes));
    setSelectedNodeId(id);
  };

  const updateNodeData = (field: string, value: any) => {
    setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, [field]: value } } : n));
  };

  const deleteNode = (nodeId: string) => {
    const filteredNodes = nodes.filter(n => n.id !== nodeId);
    const repositioned = filteredNodes.map((n, i) => ({...n, position: {x: i * 250, y: 150}}));
    setNodes(repositioned);
    setEdges(buildEdges(repositioned));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-48px)]">
        
        {/* Sync Header: Matches AgentDashboard.tsx */}
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Journey Builder</h1>
            <p className="text-muted-foreground">Draft your property journey for PropSync clients</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon"><Bell className="h-5 w-5" /></Button>
            <Avatar><AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=agent" /><AvatarFallback>AG</AvatarFallback></Avatar>
            <Button className="shadow-sm ml-2"><Save className="h-4 w-4 mr-2" /> Save Journey</Button>
          </div>
        </div>

        <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
          {/* Builder Sidebar - Matches Card Style */}
          <aside className="w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2">
            <Card className="border-muted shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Builder Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                <Button onClick={() => handleAddNode("task")} variant="outline" className="w-full justify-start h-11 border-dashed">
                  <Plus className="w-3.5 h-3.5 mr-2 text-primary" /> Add Action Task
                </Button>
                <Button onClick={() => handleAddNode("milestone")} variant="outline" className="w-full justify-start h-11 border-dashed">
                  <Calendar className="w-3.5 h-3.5 mr-2 text-primary" /> Add Milestone
                </Button>
              </CardContent>
            </Card>

            {selectedNode ? (
              <Card className="border-primary/20 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <CardHeader className="py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Properties</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => deleteNode(selectedNodeId!)} className="text-destructive h-7 px-2 hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Title</Label>
                    <Input value={selectedNode.data.title} onChange={(e) => updateNodeData("title", e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Target Date</Label>
                    <Input type="date" value={selectedNode.data.date} onChange={(e) => updateNodeData("date", e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Instructions</Label>
                    <textarea 
                      className="w-full text-xs p-3 border border-input rounded-md min-h-[120px] bg-background focus:ring-1 focus:ring-primary outline-none" 
                      value={selectedNode.data.description} 
                      onChange={(e) => updateNodeData("description", e.target.value)}
                      placeholder="What should the client do next?"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-accent/30 border border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center">
                <FileText className="w-8 h-8 mb-3 text-muted-foreground/50" />
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">No Step Selected</p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">Select a node on the roadmap to configure details.</p>
              </div>
            )}
          </aside>

          {/* Immersive Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <Card className="h-full overflow-hidden flex flex-col border-muted shadow-sm">
              <Tabs defaultValue="canvas" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-2 border-b flex justify-between items-center bg-accent/5">
                  <TabsList className="bg-background border shadow-none h-9">
                    <TabsTrigger value="canvas" className="px-8 text-xs">Roadmap View</TabsTrigger>
                    <TabsTrigger value="list" className="px-8 text-xs">List View</TabsTrigger>
                  </TabsList>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="h-8 text-xs">Templates</Button>
                  </div>
                </div>
                
                <TabsContent value="canvas" className="flex-1 m-0 relative outline-none h-full">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    nodeTypes={nodeTypes}
                    onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                    fitView
                  >
                    <Background variant="dots" gap={30} size={1} color="#E2E8F0" />
                    <Controls className="bg-background border border-muted shadow-sm rounded-lg" />
                  </ReactFlow>
                </TabsContent>

                <TabsContent value="list" className="flex-1 m-0 overflow-auto p-10 bg-accent/5 outline-none">
                  <div className="max-w-xl mx-auto space-y-3">
                    {nodes.map((n, i) => (
                      <div key={n.id} className="flex gap-4 items-start group">
                        <div className="flex flex-col items-center gap-1.5 pt-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-colors ${selectedNodeId === n.id ? 'bg-primary text-primary-foreground' : 'bg-background border text-muted-foreground'}`}>
                            {i + 1}
                          </div>
                          {i !== nodes.length - 1 && <div className="w-0.5 h-14 bg-muted" />}
                        </div>
                        <Card 
                          onClick={() => setSelectedNodeId(n.id)}
                          className={`flex-1 shadow-sm cursor-pointer transition-all border-2 ${selectedNodeId === n.id ? 'border-primary' : 'border-transparent hover:border-muted'}`}
                        >
                          <CardHeader className="p-4 flex flex-row justify-between items-center">
                            <div className="space-y-0.5">
                              <CardTitle className="text-sm font-semibold tracking-tight">{n.data.title}</CardTitle>
                              <p className="text-[11px] text-muted-foreground italic line-clamp-1">{n.data.description || "No description set"}</p>
                              <div className="pt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-[8px] h-4 font-bold uppercase tracking-widest">{n.data.type}</Badge>
                                <span className="text-[10px] text-primary font-bold">{formatDate(n.data.date)}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); deleteNode(n.id); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </CardHeader>
                        </Card>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      {/* Template Dialog - Consistent with CRM UX */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Choose Journey Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 mt-4">
            <Button variant="outline" className="h-16 justify-start gap-4 px-4 hover:border-primary transition-colors" onClick={() => handleSelectTemplate("hdb")}>
              <div className="bg-primary/10 p-2 rounded-lg text-primary"><Home className="w-5 h-5" /></div>
              <div className="text-left"><div className="font-bold text-sm">HDB Resale (Buyer)</div><div className="text-[10px] text-muted-foreground">Standard 4-6 month timeline</div></div>
            </Button>
            <Button variant="outline" className="h-16 justify-start gap-4 px-4 hover:border-primary transition-colors" onClick={() => handleSelectTemplate("bto")}>
              <div className="bg-primary/10 p-2 rounded-lg text-primary"><Building2 className="w-5 h-5" /></div>
              <div className="text-left"><div className="font-bold text-sm">BTO Launch Journey</div><div className="text-[10px] text-muted-foreground">From booking to keys</div></div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TimelineBuilder = () => {
  return (
    <ReactFlowProvider>
      <BuilderContent />
    </ReactFlowProvider>
  );
};

export default TimelineBuilder;