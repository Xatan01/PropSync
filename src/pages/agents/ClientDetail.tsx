import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Calendar, CheckCircle2, FileText, Send, UserPlus, UserRound } from "lucide-react";

interface ClientDetailData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  property?: string;
  status?: string;
  transaction_type?: string;
  invite_status?: string;
  value?: number;
}

interface DealData {
  id: string;
  client_id: string;
  agent_id: string;
  property_type?: string;
  transaction_type?: string;
  status?: string;
  value?: number;
  created_at?: string;
  updated_at?: string;
}

interface DealNote {
  id: string;
  deal_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

interface DocumentRequest {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  due_date?: string;
  status: string;
  created_at?: string;
}

interface ClientDocument {
  id: string;
  file_name: string;
  status: string;
  notes?: string;
  created_at?: string;
  request_id?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  in_progress: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  on_hold: { label: "On Hold", color: "text-slate-600", bg: "bg-slate-100 border-slate-200", dot: "bg-slate-400" },
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
};

const inviteConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  uninvited: {
    label: "Not Invited",
    color: "text-slate-600",
    bg: "bg-slate-100 border-slate-200",
    icon: UserPlus,
  },
  pending: {
    label: "Invited",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: Send,
  },
  confirmed: {
    label: "Joined Portal",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  },
};

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientDetailData | null>(null);
  const [deal, setDeal] = useState<DealData | null>(null);
  const [notes, setNotes] = useState<DealNote[]>([]);
  const [noteBody, setNoteBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [dealStatus, setDealStatus] = useState<string>("pending");
  const [savingDeal, setSavingDeal] = useState(false);
  const [docRequests, setDocRequests] = useState<DocumentRequest[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [requestRequired, setRequestRequired] = useState(true);
  const [requestDueDate, setRequestDueDate] = useState("");
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [reviewingDocId, setReviewingDocId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/clients/${clientId}`);
        setClient(res.data || null);
      } catch {
        setClient(null);
      }

      try {
        const dealRes = await api.get(`/deals/clients/${clientId}/deal`);
        setDeal(dealRes.data || null);
        setDealStatus((dealRes.data?.status as string) || "pending");
      } catch {
        setDeal(null);
        setDealStatus("pending");
      } finally {
        setLoading(false);
      }
    };

    if (clientId) fetchClient();
  }, [clientId]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!deal?.id) {
        setNotes([]);
        return;
      }
      setNotesLoading(true);
      try {
        const res = await api.get(`/deals/${deal.id}/notes`);
        setNotes(res.data || []);
      } catch {
        setNotes([]);
      } finally {
        setNotesLoading(false);
      }
    };

    fetchNotes();
  }, [deal?.id]);

  const fetchDocuments = async () => {
    if (!clientId) return;
    try {
      const [reqRes, docRes] = await Promise.all([
        api.get(`/documents/clients/${clientId}/requests`),
        api.get(`/documents/clients/${clientId}/documents`),
      ]);
      setDocRequests(reqRes.data || []);
      setDocuments(docRes.data || []);
    } catch {
      setDocRequests([]);
      setDocuments([]);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [clientId]);

  const handleAddNote = async () => {
    if (!clientId) return;
    const trimmed = noteBody.trim();
    if (!trimmed) return;
    setSavingNote(true);
    try {
      let activeDeal = deal;
      if (!activeDeal) {
        const dealRes = await api.post(`/deals/clients/${clientId}/deal`, {});
        activeDeal = dealRes.data;
        setDeal(activeDeal);
      }
      await api.post(`/deals/${activeDeal.id}/notes`, { body: trimmed });
      setNoteBody("");
      const res = await api.get(`/deals/${activeDeal.id}/notes`);
      setNotes(res.data || []);
      toast.success("Note added.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDealStatusUpdate = async (newStatus: string) => {
    if (!clientId) return;
    setSavingDeal(true);
    try {
      let activeDeal = deal;
      if (!activeDeal) {
        const dealRes = await api.post(`/deals/clients/${clientId}/deal`, {
          status: newStatus,
        });
        activeDeal = dealRes.data;
        setDeal(activeDeal);
      } else {
        const dealRes = await api.patch(`/deals/${activeDeal.id}`, {
          status: newStatus,
        });
        setDeal(dealRes.data);
      }
      toast.success("Stage updated successfully.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update status.");
      setDealStatus(deal?.status || "pending");
    } finally {
      setSavingDeal(false);
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!deal?.id) return;
    const trimmed = editingBody.trim();
    if (!trimmed) return;
    setSavingNote(true);
    try {
      await api.patch(`/deals/${deal.id}/notes/${noteId}`, { body: trimmed });
      const res = await api.get(`/deals/${deal.id}/notes`);
      setNotes(res.data || []);
      setEditingNoteId(null);
      setEditingBody("");
      toast.success("Note updated.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!deal?.id) return;
    if (!window.confirm("Delete this note?")) return;
    setSavingNote(true);
    try {
      await api.delete(`/deals/${deal.id}/notes/${noteId}`);
      const res = await api.get(`/deals/${deal.id}/notes`);
      setNotes(res.data || []);
      toast.success("Note deleted.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete note.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!clientId || !requestTitle.trim()) return;
    setCreatingRequest(true);
    try {
      await api.post(`/documents/clients/${clientId}/requests`, {
        title: requestTitle.trim(),
        description: requestDescription.trim() || null,
        required: requestRequired,
        due_date: requestDueDate || null,
      });
      setRequestTitle("");
      setRequestDescription("");
      setRequestDueDate("");
      setRequestRequired(true);
      await fetchDocuments();
      toast.success("Document request created.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create request.");
    } finally {
      setCreatingRequest(false);
    }
  };

  const handleUploadDocument = async (file: File) => {
    if (!clientId || !file) return;
    setUploadingDoc(true);
    try {
      const uploadRes = await api.post(`/documents/clients/${clientId}/upload-url`, {
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        request_id: selectedRequestId || null,
      });

      const signedUrl = uploadRes.data?.signed_url;
      const storagePath = uploadRes.data?.storage_path;
      if (!signedUrl || !storagePath) {
        throw new Error("Missing upload URL");
      }

      const uploadResp = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadResp.ok) {
        throw new Error("Upload failed");
      }

      await api.post(`/documents/clients/${clientId}/documents/confirm`, {
        storage_path: storagePath,
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        request_id: selectedRequestId || null,
      });

      await fetchDocuments();
      toast.success("Document uploaded.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || "Failed to upload document.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleReviewDocument = async (docId: string, status: "approved" | "rejected") => {
    setReviewingDocId(docId);
    try {
      const notes = status === "rejected" ? window.prompt("Rejection notes (optional):") || "" : "";
      await api.patch(`/documents/${docId}/review`, { status, notes });
      await fetchDocuments();
      toast.success(`Document ${status}.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update document.");
    } finally {
      setReviewingDocId(null);
    }
  };
  const handleInvite = async () => {
    if (!client?.id) return;
    try {
      const res = await api.post(`/clients/invite/${client.id}`);
      const status = res?.data?.status;
      if (status === "invited" || status === "sent") {
        toast.success("Invite email sent.");
      } else if (status === "already_invited") {
        toast.message("Invite already pending - resent.");
      } else if (status === "already_registered") {
        toast.message("Email already registered. Ask the client to log in or reset their password.");
      } else if (status === "already_confirmed") {
        toast.message("Client already confirmed and can log in.");
      } else {
        toast.success("Invite updated.");
      }
      const refreshed = await api.get(`/clients/${client.id}`);
      setClient(refreshed.data || null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to send invite.");
    }
  };

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {client?.name || "Client"}
              </h1>
              <p className="text-xs text-muted-foreground">
                Client overview and deal workspace
              </p>
            </div>
          </div>
        </div>

        <Card className="border-muted shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Client Snapshot</CardTitle>
            <CardDescription>Core details and deal status</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            {loading ? (
              <div className="text-sm text-muted-foreground italic">Loading client...</div>
            ) : !client ? (
              <div className="text-sm text-muted-foreground italic">Client not found.</div>
            ) : (
              <>
                <div className="relative flex w-full items-center justify-between px-2">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 -z-0" />
                  {Object.entries(statusConfig).map(([key, cfg], index) => {
                    const currentIndex = Object.keys(statusConfig).indexOf(dealStatus);
                    const isActive = dealStatus === key;
                    const isPast = currentIndex >= index;

                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setDealStatus(key);
                          handleDealStatusUpdate(key);
                        }}
                        className="relative z-10 flex flex-col items-center group transition-all"
                        type="button"
                      >
                        <div
                          className={`h-8 w-8 rounded-full border-4 flex items-center justify-center transition-all ${
                            isActive
                              ? "bg-primary border-background scale-125 shadow-lg"
                              : isPast
                              ? "bg-emerald-500 border-background"
                              : "bg-muted border-background"
                          }`}
                        >
                          {isPast && !isActive ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <div className={`h-2 w-2 rounded-full ${isActive ? "bg-white" : "bg-muted-foreground"}`} />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-[11px] font-bold uppercase tracking-tighter ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {cfg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-muted/50">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <UserRound className="h-6 w-6 text-slate-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-none">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.email || "No email"}</p>
                      <p className="text-xs text-muted-foreground">{client.phone || "No phone"}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                          Property Assignment
                        </span>
                        <div>
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-2 uppercase tracking-tight border-blue-200 bg-blue-50/60 text-blue-700 font-bold"
                          >
                            {client.transaction_type || "Standard"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {client.property || "No Listing Attached"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Portal Access
                      </span>
                      {savingDeal && (
                        <span className="text-[10px] text-primary animate-pulse font-bold">
                          SAVING...
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const status = client.invite_status || "uninvited";
                        const config = inviteConfig[status] || inviteConfig.uninvited;
                        const Icon = config.icon;
                        return (
                          <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm transition-all ${config.bg} ${config.color}`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs font-bold">{config.label}</span>
                          </div>
                        );
                      })()}
                      {client.invite_status === "uninvited" && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs font-bold text-primary underline"
                          onClick={handleInvite}
                        >
                          Send Invite
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto h-12 bg-muted/50 p-1 border border-muted">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Documents
          </TabsTrigger>
        </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="border-muted shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Deal Notes</CardTitle>
                <CardDescription>
                  Keep lightweight notes or next steps for this client.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      placeholder="Add a note about this deal..."
                      className="text-xs"
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleAddNote} disabled={savingNote}>
                        {savingNote ? "Saving..." : "Add Note"}
                      </Button>
                    </div>
                  </div>

                  {notesLoading ? (
                    <div className="text-xs text-muted-foreground italic">Loading notes...</div>
                  ) : notes.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">
                      No notes yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note.id} className="p-3 rounded-md border border-muted bg-background">
                          {editingNoteId === note.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editingBody}
                                onChange={(e) => setEditingBody(e.target.value)}
                                className="text-xs"
                                rows={3}
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingNoteId(null);
                                    setEditingBody("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleEditNote(note.id)}
                                  disabled={savingNote}
                                >
                                  {savingNote ? "Saving..." : "Save"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs leading-relaxed">{note.body}</p>
                              <div className="mt-2 flex items-center justify-between gap-3">
                                <p className="text-[10px] text-muted-foreground">
                                  {new Date(note.created_at).toLocaleString()}
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingNoteId(note.id);
                                      setEditingBody(note.body);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteNote(note.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card className="border-muted shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
                <CardDescription>Review milestones and task progress.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  Open the timeline builder to manage tasks and deadlines.
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/timeline/${clientId}`)}
                  className="text-xs font-bold"
                >
                  Open Timeline
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card className="border-muted shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Documents</CardTitle>
                <CardDescription>Request and review client uploads.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        New Request
                      </p>
                      <Input
                        value={requestTitle}
                        onChange={(e) => setRequestTitle(e.target.value)}
                        placeholder="Document title (e.g. ID, Option to Purchase)"
                        className="text-xs"
                      />
                      <Textarea
                        value={requestDescription}
                        onChange={(e) => setRequestDescription(e.target.value)}
                        placeholder="Request details or instructions"
                        className="text-xs"
                        rows={3}
                      />
                      <div className="flex items-center gap-3">
                        <Input
                          type="date"
                          value={requestDueDate}
                          onChange={(e) => setRequestDueDate(e.target.value)}
                          className="text-xs"
                        />
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Checkbox
                            checked={requestRequired}
                            onCheckedChange={(val) => setRequestRequired(Boolean(val))}
                          />
                          Required
                        </label>
                      </div>
                      <Button size="sm" onClick={handleCreateRequest} disabled={creatingRequest}>
                        {creatingRequest ? "Creating..." : "Create Request"}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Upload Document
                      </p>
                      <select
                        value={selectedRequestId}
                        onChange={(e) => setSelectedRequestId(e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                      >
                        <option value="">Link to request (optional)</option>
                        {docRequests.map((req) => (
                          <option key={req.id} value={req.id}>
                            {req.title}
                          </option>
                        ))}
                      </select>
                      <input
                        type="file"
                        className="text-xs"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadDocument(file);
                          e.currentTarget.value = "";
                        }}
                        disabled={uploadingDoc}
                      />
                      {uploadingDoc && (
                        <div className="text-xs text-muted-foreground italic">Uploading...</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Requested Documents
                    </p>
                    {docRequests.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic">No requests yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {docRequests.map((req) => (
                          <div key={req.id} className="rounded-md border border-muted p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold">{req.title}</p>
                              <Badge variant="outline" className="text-[10px] uppercase">
                                {req.status}
                              </Badge>
                            </div>
                            {req.description && (
                              <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                            )}
                            {req.due_date && (
                              <p className="text-[10px] text-muted-foreground mt-2">
                                Due {req.due_date}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Uploaded Documents
                    </p>
                    {documents.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic">No documents uploaded yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div key={doc.id} className="rounded-md border border-muted p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold">{doc.file_name}</p>
                              <Badge variant="outline" className="text-[10px] uppercase">
                                {doc.status}
                              </Badge>
                            </div>
                            {doc.notes && (
                              <p className="text-xs text-muted-foreground mt-1">Notes: {doc.notes}</p>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              {doc.status === "submitted" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={reviewingDocId === doc.id}
                                    onClick={() => handleReviewDocument(doc.id, "approved")}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={reviewingDocId === doc.id}
                                    onClick={() => handleReviewDocument(doc.id, "rejected")}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDetail;
