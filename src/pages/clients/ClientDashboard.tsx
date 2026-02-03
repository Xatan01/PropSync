import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ClientProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  property?: string;
  transaction_type?: string;
  invite_status?: string;
}

interface DocumentRequest {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  due_date?: string;
  status: string;
}

interface ClientDocument {
  id: string;
  file_name: string;
  status: string;
  request_id?: string;
  created_at?: string;
  notes?: string;
  uploader_role?: string;
}

interface TimelineNode {
  id: string;
  position?: { x?: number; y?: number };
  data?: {
    title?: string;
    description?: string;
    date?: string;
    type?: string;
  };
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [timelineNodes, setTimelineNodes] = useState<TimelineNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      const [meRes, reqRes, docRes] = await Promise.all([
        api.get("/client/me"),
        api.get("/client/requests"),
        api.get("/client/documents"),
      ]);
      setProfile(meRes.data || null);
      setRequests(reqRes.data || []);
      setDocuments(docRes.data || []);
      try {
        const timelineRes = await api.get("/client/timeline");
        setTimelineNodes(timelineRes.data?.nodes || []);
      } catch {
        setTimelineNodes([]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load client portal data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const uploadRes = await api.post("/client/upload-url", {
        file_name: selectedFile.name,
        mime_type: selectedFile.type,
        file_size: selectedFile.size,
        request_id: selectedRequestId || null,
      });

      const signedUrl = uploadRes.data?.signed_url;
      const storagePath = uploadRes.data?.storage_path;
      if (!signedUrl || !storagePath) throw new Error("Missing upload URL");

      const uploadResp = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type || "application/octet-stream" },
        body: selectedFile,
      });

      if (!uploadResp.ok) throw new Error("Upload failed");

      await api.post("/client/documents/confirm", {
        storage_path: storagePath,
        file_name: selectedFile.name,
        mime_type: selectedFile.type,
        file_size: selectedFile.size,
        request_id: selectedRequestId || null,
      });

      toast.success("Document uploaded.");
      setSelectedFile(null);
      setSelectedRequestId("");
      await fetchClientData();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDocument = async (docId: string) => {
    try {
      const res = await api.get(`/client/documents/${docId}/download`);
      const url = res.data?.signed_url;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("No download URL returned.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to open document.");
    }
  };

  const requestedCount = requests.length;
  const submittedCount = documents.filter((doc) => doc.status === "submitted").length;

  const clientUploads = documents.filter((doc) => doc.uploader_role === "client");
  const agentFiles = documents.filter((doc) => doc.uploader_role === "agent");
  const linkedAgentFiles = agentFiles.filter((doc) => doc.request_id);
  const unlinkedAgentFiles = agentFiles.filter((doc) => !doc.request_id);

  const latestDocByRequest = clientUploads
    .filter((doc) => doc.request_id)
    .reduce<Record<string, ClientDocument>>((acc, doc) => {
      if (!doc.request_id) return acc;
      const existing = acc[doc.request_id];
      if (!existing) {
        acc[doc.request_id] = doc;
        return acc;
      }
      const existingTime = existing.created_at ? new Date(existing.created_at).getTime() : 0;
      const currentTime = doc.created_at ? new Date(doc.created_at).getTime() : 0;
      if (currentTime >= existingTime) {
        acc[doc.request_id] = doc;
      }
      return acc;
    }, {});

  const timelineItems = [...timelineNodes].sort((a, b) => {
    const dateA = a.data?.date ? new Date(a.data.date).getTime() : 0;
    const dateB = b.data?.date ? new Date(b.data.date).getTime() : 0;
    if (dateA && dateB) return dateA - dateB;
    const posA = a.position?.x ?? 0;
    const posB = b.position?.x ?? 0;
    return posA - posB;
  });

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {profile?.name ? `Welcome, ${profile.name}` : "Client Portal"}
            </h1>
            <p className="text-sm text-muted-foreground">Your transaction workspace</p>
          </div>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-muted shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requestedCount}</div>
              <div className="text-xs text-muted-foreground">Documents requested</div>
            </CardContent>
          </Card>
          <Card className="border-muted shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submittedCount}</div>
              <div className="text-xs text-muted-foreground">Uploads submitted</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="documents" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto h-12 bg-muted/50 p-1 border border-muted">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Documents</TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="border-muted shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Account</CardTitle>
                <CardDescription>Contact and deal summary</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                {loading ? (
                  <div className="text-xs text-muted-foreground italic">Loading profile...</div>
                ) : (
                  <div className="space-y-1">
                    <div><strong>Email:</strong> {profile?.email || "-"}</div>
                    <div><strong>Phone:</strong> {profile?.phone || "-"}</div>
                    <div><strong>Property:</strong> {profile?.property || "-"}</div>
                    <div><strong>Transaction:</strong> {profile?.transaction_type || "-"}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card className="border-muted shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Upload Documents</CardTitle>
                <CardDescription>Submit files requested by your agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <select
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="">Link to request (optional)</option>
                  {requests.map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.title}
                    </option>
                  ))}
                </select>
                <Input
                  type="file"
                  className="text-xs"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <Button size="sm" onClick={handleUpload} disabled={uploading || !selectedFile}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-muted shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Requested Documents</CardTitle>
                <CardDescription>What your agent needs from you</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic">No requests yet.</div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req) => (
                      <div key={req.id} className="rounded-md border border-muted p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{req.title}</p>
                          <div className="flex items-center gap-2">
                            {req.required && (
                              <Badge variant="secondary" className="text-[9px] uppercase">
                                Required
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] uppercase">{req.status}</Badge>
                          </div>
                        </div>
                        {req.description && (
                          <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                        )}
                        {req.due_date && (
                          <p className="text-[10px] text-muted-foreground mt-2">Due {req.due_date}</p>
                        )}
                        {latestDocByRequest[req.id] && (
                          <p className="text-[10px] text-muted-foreground mt-2">
                            Latest upload: {latestDocByRequest[req.id].status}
                          </p>
                        )}
                        {linkedAgentFiles.filter((doc) => doc.request_id === req.id).length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-[10px] uppercase text-muted-foreground font-bold">
                              Agent Attachments
                            </p>
                            {linkedAgentFiles
                              .filter((doc) => doc.request_id === req.id)
                              .map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between text-xs">
                                  <span>{doc.file_name}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-[10px]"
                                    onClick={() => handleOpenDocument(doc.id)}
                                  >
                                    View
                                  </Button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-muted shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Agent Shared Files</CardTitle>
                <CardDescription>Templates and reference files from your agent</CardDescription>
              </CardHeader>
              <CardContent>
                {unlinkedAgentFiles.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic">No shared files yet.</div>
                ) : (
                  <div className="space-y-2">
                    {unlinkedAgentFiles.map((doc) => (
                      <div key={doc.id} className="rounded-md border border-muted p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{doc.file_name}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDocument(doc.id)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-muted shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Your Uploads</CardTitle>
                <CardDescription>Submitted files and status</CardDescription>
              </CardHeader>
              <CardContent>
                {clientUploads.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic">No uploads yet.</div>
                ) : (
                  <div className="space-y-2">
                    {clientUploads.map((doc) => (
                      <div key={doc.id} className="rounded-md border border-muted p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">{doc.file_name}</p>
                            {doc.request_id && (
                              <p className="text-[10px] text-muted-foreground">
                                Request: {requests.find((req) => req.id === doc.request_id)?.title || "Unlinked"}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-[10px] uppercase">{doc.status}</Badge>
                        </div>
                        {doc.notes && (
                          <p className="text-xs text-muted-foreground mt-1">Notes: {doc.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card className="border-muted shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
                <CardDescription>Your progress and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                {timelineItems.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic">
                    No timeline items yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timelineItems.map((node) => (
                      <div key={node.id} className="rounded-md border border-muted p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{node.data?.title || "Timeline step"}</p>
                          <Badge variant="secondary" className="text-[9px] uppercase">
                            {node.data?.type || "task"}
                          </Badge>
                        </div>
                        {node.data?.description && (
                          <p className="text-xs text-muted-foreground mt-1">{node.data.description}</p>
                        )}
                        {node.data?.date && (
                          <p className="text-[10px] text-muted-foreground mt-2">Target {node.data.date}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
