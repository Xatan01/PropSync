import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

// Shadcn UI Imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

// Icons
import { 
  Calendar, Save, Plus, Home, Building2, CheckCircle2, Trash2, FileText, Loader2, ArrowLeft, LayoutTemplate, CopyPlus
} from "lucide-react";

// Utils
import { api } from "@/utils/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// ---------------- Helper ----------------
const formatDate = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-SG", { day: '2-digit', month: 'short' });
};

// ---------------- Custom Node Component ----------------
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
      </div>

      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
};

const nodeTypes = { timelineNode: TimelineNode };

// --- Main Builder Logic ---
interface BuilderProps {
  isTemplateMode?: boolean;
}

const BuilderContent = ({ isTemplateMode = false }: BuilderProps) => {
  const { clientId, templateId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["HDB", "RESALE", "CONDO", "LANDED"]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [headerInfo, setHeaderInfo] = useState({ title: "", subtitle: "", category: "HDB" });

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // ---------------- API Calls ----------------

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch available templates
      const tempRes = await api.get("/timeline/templates");
      setTemplates(tempRes.data);

      // 2. Extract dynamic categories from existing database entries
      const dbCategories = Array.from(new Set(tempRes.data.map((t: any) => t.category))) as string[];
      if (dbCategories.length > 0) {
        setCategories(prev => Array.from(new Set([...prev, ...dbCategories])));
      }

      if (isTemplateMode) {
        if (templateId) {
          const res = await api.get(`/timeline/templates/${templateId}`);
          setNodes(res.data.nodes || []);
          setEdges(res.data.edges || []);
          setHeaderInfo({ title: res.data.template_name, subtitle: "Editing Template Blueprint", category: res.data.category || "HDB" });
        } else {
          setHeaderInfo({ title: "New Timeline Template", subtitle: "Building Blueprint", category: "HDB" });
        }
      } 
      else if (clientId) {
        const [clientRes, tlRes] = await Promise.all([
          api.get(`/clients/${clientId}`),
          api.get(`/timeline/${clientId}`)
        ]);
        setHeaderInfo({ title: clientRes.data.name, subtitle: clientRes.data.property || "Active Journey", category: "Client" });
        if (tlRes.data?.nodes?.length > 0) {
          setNodes(tlRes.data.nodes);
          setEdges(tlRes.data.edges);
        } else {
          setIsDialogOpen(true);
        }
      }
    } catch (error) {
      toast.error("Failed to load journey data");
    } finally {
      setLoading(false);
    }
  }, [clientId, templateId, isTemplateMode, setNodes, setEdges]);

  useEffect(() => { loadData(); }, [loadData]);

  // Unified Save: Handles "Update Template", "Update Client", and "Save Client Progress as New Template"
  const handleSave = async (saveAsNewTemplate = false) => {
    setSaving(true);
    try {
      const payload = { 
        id: (isTemplateMode && !saveAsNewTemplate) ? templateId : null, // If editing existing, pass ID
        template_name: headerInfo.title, 
        category: headerInfo.category,
        nodes, 
        edges 
      };

      if (isTemplateMode || saveAsNewTemplate) {
        await api.post("/timeline/save-template", payload);
        toast.success(saveAsNewTemplate ? "New template added to library" : "Template updated");
        if (isTemplateMode) navigate("/dashboard");
      } else {
        await api.post(`/timeline/save/${clientId}`, { nodes, edges });
        toast.success("Client journey updated successfully");
      }
    } catch (error) {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateId || !window.confirm("Are you sure you want to delete this master template?")) return;
    try {
      await api.delete(`/timeline/templates/${templateId}`);
      toast.success("Template deleted");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to delete template");
    }
  };

  // ---------------- Builder Helpers ----------------

  const buildEdges = (nodesList: any[]) => {
    return nodesList.slice(0, -1).map((node, i) => ({
      id: `e-${node.id}`,
      source: node.id,
      target: nodesList[i + 1].id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 3, opacity: 0.3 },
    }));
  };

  const handleSelectTemplate = (template: any) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setIsDialogOpen(false);
    toast.info(`Applied template: ${template.template_name}`);
  };

  const handleAddNode = (type: "task" | "milestone") => {
    const id = `n-${Date.now()}`;
    const newX = nodes.length * 250;
    const newNode = {
      id,
      type: "timelineNode",
      position: { x: newX, y: 150 },
      data: { id, type, title: type === "task" ? "New Step" : "Milestone", description: "", date: new Date().toISOString().split("T")[0] },
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

  if (loading) return <div className="h-screen w-full flex items-center justify-center flex-col gap-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-sm">Initializing Builder...</p></div>;

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      {/* --- Unified Header --- */}
      <header className="border-b px-6 py-4 flex justify-between items-center bg-card shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}><ArrowLeft className="h-4 w-4 mr-2" /> Exit</Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {/* EDITABLE TITLE: Just click and type to rename */}
              <input 
                className="font-bold text-lg bg-transparent border-none focus:ring-1 focus:ring-primary rounded px-1 outline-none w-auto min-w-[200px] hover:bg-accent/50 transition-colors"
                value={headerInfo.title}
                onChange={(e) => setHeaderInfo(prev => ({...prev, title: e.target.value}))}
                placeholder="Journey Title..."
              />
              {isTemplateMode && <Badge variant="secondary" className="text-[10px] bg-primary text-primary-foreground">TEMPLATE MODE</Badge>}
            </div>
            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest px-1">{headerInfo.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isTemplateMode && (
             <Button variant="ghost" size="sm" onClick={() => handleSave(true)} className="text-primary hover:bg-primary/5 text-xs font-bold">
                <CopyPlus className="h-3 w-3 mr-1" /> Save as new Template
             </Button>
          )}

          {isTemplateMode && (
            <div className="flex items-center gap-2">
              <Select value={headerInfo.category} onValueChange={(val) => setHeaderInfo(prev => ({...prev, category: val}))}>
                <SelectTrigger className="w-[130px] h-8 text-[10px] font-bold uppercase tracking-wider">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {templateId && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={handleDeleteTemplate}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          
          <Button size="sm" onClick={() => handleSave(false)} disabled={saving} className="px-6 font-bold shadow-md">
            {saving ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Save className="h-3 w-3 mr-2" />} 
            {isTemplateMode ? "Save Changes" : "Update Journey"}
          </Button>
          <Avatar className="h-8 w-8 ml-2 border border-muted"><AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} /></Avatar>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden min-h-0">
        <aside className="w-80 border-r bg-accent/5 p-4 flex flex-col gap-4 overflow-y-auto">
          <Card className="shadow-none border-muted">
            <CardHeader className="p-4 pb-2"><CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Builder Tools</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <Button onClick={() => handleAddNode("task")} variant="outline" className="w-full justify-start border-dashed h-9 text-xs"><Plus className="w-3 h-3 mr-2 text-primary" /> New Step</Button>
              <Button onClick={() => handleAddNode("milestone")} variant="outline" className="w-full justify-start border-dashed h-9 text-xs"><Calendar className="w-3 h-3 mr-2 text-primary" /> New Milestone</Button>
            </CardContent>
          </Card>

          {selectedNode ? (
            <Card className="shadow-none border-primary/20 animate-in slide-in-from-left-2">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Properties</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => deleteNode(selectedNodeId!)} className="h-6 w-6 text-destructive hover:bg-destructive/10"><Trash2 className="w-3 h-3" /></Button>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold text-muted-foreground">Title</Label><Input value={selectedNode.data.title} onChange={(e) => updateNodeData("title", e.target.value)} className="h-9 text-xs" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold text-muted-foreground">Target Date</Label><Input type="date" value={selectedNode.data.date} onChange={(e) => updateNodeData("date", e.target.value)} className="h-9 text-xs" /></div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Client Instructions</Label>
                  <textarea className="w-full text-xs p-3 border rounded-md bg-background min-h-[140px] focus:ring-1 focus:ring-primary outline-none" value={selectedNode.data.description} onChange={(e) => updateNodeData("description", e.target.value)} placeholder="Provide specific steps for the client..." />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center px-4 border-2 border-dashed rounded-xl m-2">
              <FileText className="w-10 h-10 mb-2 text-muted-foreground" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Edit Details</p>
              <p className="text-[10px] mt-1 italic">Select a node on the canvas</p>
            </div>
          )}
        </aside>

        <main className="flex-1 relative bg-slate-50">
           <Tabs defaultValue="canvas" className="h-full flex flex-col">
              <div className="bg-card px-4 py-2 flex justify-between items-center border-b shadow-sm z-10">
                <TabsList className="h-8 bg-muted/50 border"><TabsTrigger value="canvas" className="text-[10px] px-6">Roadmap Canvas</TabsTrigger><TabsTrigger value="list" className="text-[10px] px-6">Step Summary</TabsTrigger></TabsList>
                {!isTemplateMode && (
                    <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="text-[10px] h-7 border-primary/20 hover:bg-primary/5">Apply Template</Button>
                )}
              </div>
              <TabsContent value="canvas" className="flex-1 m-0 h-full">
                <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} nodeTypes={nodeTypes} onNodeClick={(_, node) => setSelectedNodeId(node.id)} fitView className="bg-slate-50">
                  <Background variant="dots" gap={30} size={1} color="#e2e8f0" />
                  <Controls className="bg-white border rounded-lg shadow-lg" />
                </ReactFlow>
              </TabsContent>
              <TabsContent value="list" className="flex-1 m-0 p-8 overflow-y-auto">
                <div className="max-w-2xl mx-auto space-y-4">
                  {nodes.map((n, i) => (
                    <Card key={n.id} className="flex gap-4 items-start p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedNodeId(n.id); }}>
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i+1}</div>
                      <div className="flex-1">
                          <div className="flex justify-between items-start">
                              <h4 className="font-bold text-sm tracking-tight">{n.data.title}</h4>
                              <Badge variant="outline" className="text-[8px] uppercase tracking-tighter">{n.data.type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed italic">{n.data.description || "No instructions provided."}</p>
                          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase">
                              <Calendar className="w-3 h-3" /> {formatDate(n.data.date)}
                          </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
           </Tabs>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-center font-bold text-xl">Import Timeline Template</DialogTitle></DialogHeader>
          <div className="grid gap-3 mt-4">
            {templates.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-xl">
                    <LayoutTemplate className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-30" />
                    <p className="text-xs text-muted-foreground italic">No templates found in library.</p>
                </div>
            ) : (
                templates.map((template) => (
                    <Button key={template.id} variant="outline" className="h-16 justify-start gap-4 hover:border-primary transition-all group" onClick={() => handleSelectTemplate(template)}>
                      <div className="bg-primary/10 p-2.5 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        {template.category === "CONDO" ? <Building2 className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                          <div className="font-bold text-sm tracking-tight">{template.template_name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{template.category || "HDB"} Template</div>
                      </div>
                    </Button>
                  ))
            )}
            <Separator className="my-2" />
            <Button variant="ghost" className="text-xs italic underline" onClick={() => setIsDialogOpen(false)}>Start journey from scratch</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TimelineBuilder = ({ isTemplateMode = false }: BuilderProps) => {
  return (
    <ReactFlowProvider>
      <BuilderContent isTemplateMode={isTemplateMode} />
    </ReactFlowProvider>
  );
};

export default TimelineBuilder;