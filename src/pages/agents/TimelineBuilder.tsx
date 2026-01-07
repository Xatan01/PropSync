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
  Calendar, Save, Plus, Home, Building2, CheckCircle2, Trash2, FileText 
} from "lucide-react";

// ---------------- Helper ----------------
const formatDate = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-SG", { day: '2-digit', month: 'short' });
};

// ---------------- PropSync Custom Node ----------------
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
        <h4 className={`text-sm font-bold leading-tight px-2 ${selected ? "text-primary" : "text-foreground"}`}>
          {data.title}
        </h4>
        <p className="text-[11px] text-muted-foreground line-clamp-2 italic mt-1 max-w-[160px]">
          {data.description || "Set details..."}
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
      { id: '1', type: 'milestone', title: 'Option to Purchase', date: '2024-06-01', description: 'Sign OTP' },
      { id: '2', type: 'task', title: 'Valuation Request', date: '2024-06-05', description: 'Submit to HDB' }
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
    <div className="flex flex-col h-[calc(100vh-48px)] space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Choose Template</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="h-16 justify-start gap-4 px-4 text-foreground" onClick={() => handleSelectTemplate("hdb")}>
              <Home className="text-primary h-5 w-5" /> HDB Resale Journey
            </Button>
            <Button variant="outline" className="h-16 justify-start gap-4 px-4 text-foreground" onClick={() => handleSelectTemplate("bto")}>
              <Building2 className="text-primary h-5 w-5" /> BTO Launch Timeline
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Width Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journey Builder</h1>
          <p className="text-muted-foreground text-xs italic">PropSync &bull; Transaction Roadmap</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>Templates</Button>
            <Button size="sm" className="shadow-sm"><Save className="h-4 w-4 mr-2" /> Save Journey</Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden pb-4">
        {/* Responsive Sidebar */}
        <aside className="w-80 border rounded-xl bg-slate-50/50 p-5 flex flex-col gap-5 overflow-y-auto shrink-0">
          <div>
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Builder Tools</Label>
            <div className="grid gap-2 mt-3">
              <Button onClick={() => handleAddNode("task")} variant="outline" className="justify-start bg-white shadow-sm h-11 border-slate-200 text-foreground text-xs">
                <Plus className="w-3.5 h-3.5 mr-2 text-primary" /> Add Action Task
              </Button>
              <Button onClick={() => handleAddNode("milestone")} variant="outline" className="justify-start bg-white shadow-sm h-11 border-slate-200 text-foreground text-xs">
                <Calendar className="w-3.5 h-3.5 mr-2 text-primary" /> Add Milestone
              </Button>
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {selectedNode ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Properties</Label>
                <Button variant="ghost" size="sm" onClick={() => deleteNode(selectedNodeId!)} className="text-destructive h-7 px-2 hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Title</Label>
                  <Input value={selectedNode.data.title} onChange={(e) => updateNodeData("title", e.target.value)} className="bg-white h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Date</Label>
                  <Input type="date" value={selectedNode.data.date} onChange={(e) => updateNodeData("date", e.target.value)} className="bg-white h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Client Instructions</Label>
                  <textarea 
                    className="w-full text-xs p-3 border border-slate-200 rounded-md min-h-[120px] bg-white outline-none focus:ring-1 focus:ring-primary" 
                    value={selectedNode.data.description} 
                    onChange={(e) => updateNodeData("description", e.target.value)}
                    placeholder="Tell your client what they need to do..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-16 text-center opacity-40 flex flex-col items-center p-4">
              <FileText className="w-10 h-10 mb-3 text-slate-400" />
              <p className="text-[10px] font-bold uppercase tracking-tight text-slate-500">Selection Required</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Click a step on the roadmap to configure its details.</p>
            </div>
          )}
        </aside>

        {/* Immersive Canvas */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden border rounded-xl shadow-sm bg-white">
          <Tabs defaultValue="canvas" className="flex-1 flex flex-col overflow-hidden">
             <div className="flex justify-center p-2 border-b bg-white relative z-10">
                <TabsList className="bg-slate-100 h-9">
                    <TabsTrigger value="canvas" className="px-10 text-xs">Roadmap</TabsTrigger>
                    <TabsTrigger value="list" className="px-10 text-xs">List View</TabsTrigger>
                </TabsList>
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
                  <Controls className="bg-white border-slate-200 shadow-sm rounded-lg" />
                </ReactFlow>
             </TabsContent>

             <TabsContent value="list" className="flex-1 m-0 overflow-auto p-10 bg-slate-50/30 outline-none">
                <div className="max-w-xl mx-auto space-y-3">
                    {nodes.map((n, i) => (
                    <div key={n.id} className="flex gap-4 items-start group">
                        <div className="flex flex-col items-center gap-1.5 pt-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-colors ${selectedNodeId === n.id ? 'bg-primary text-primary-foreground' : 'bg-white border text-slate-400'}`}>
                              {i + 1}
                            </div>
                            {i !== nodes.length - 1 && <div className="w-0.5 h-14 bg-slate-200" />}
                        </div>
                        <Card 
                          onClick={() => setSelectedNodeId(n.id)}
                          className={`flex-1 shadow-sm cursor-pointer transition-all border-2 ${selectedNodeId === n.id ? 'border-primary' : 'border-transparent hover:border-slate-200'}`}
                        >
                            <CardHeader className="p-3.5 flex flex-row justify-between items-center">
                                <div className="space-y-0.5">
                                    <CardTitle className="text-xs font-bold">{n.data.title}</CardTitle>
                                    <p className="text-[11px] text-muted-foreground italic truncate max-w-[200px]">{n.data.description || "No notes added"}</p>
                                    <div className="pt-1.5 flex items-center gap-2">
                                      <Badge variant="secondary" className="text-[8px] h-3.5 px-1.5 font-bold uppercase tracking-wider">{n.data.type}</Badge>
                                      <span className="text-[10px] text-primary font-bold">{formatDate(n.data.date)}</span>
                                    </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-slate-200 hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => { e.stopPropagation(); deleteNode(n.id); }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </CardHeader>
                        </Card>
                    </div>
                    ))}
                </div>
             </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const TimelineBuilder = () => {
  return (
    <div className="bg-background min-h-screen p-6 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full">
        <ReactFlowProvider>
          <BuilderContent />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default TimelineBuilder;