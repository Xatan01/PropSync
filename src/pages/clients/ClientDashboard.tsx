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
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
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

  const requestedCount = requests.length;
  const submittedCount = documents.filter((doc) => doc.status === "submitted").length;

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
                          <Badge variant="outline" className="text-[10px] uppercase">{req.status}</Badge>
                        </div>
                        {req.description && (
                          <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                        )}
                        {req.due_date && (
                          <p className="text-[10px] text-muted-foreground mt-2">Due {req.due_date}</p>
                        )}
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
                {documents.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic">No uploads yet.</div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="rounded-md border border-muted p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{doc.file_name}</p>
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
                <div className="text-xs text-muted-foreground italic">
                  Timeline view is coming soon.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
