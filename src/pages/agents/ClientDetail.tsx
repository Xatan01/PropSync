import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Calendar, FileText, UserRound } from "lucide-react";

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
      } catch {
        setDeal(null);
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
          <CardContent className="pt-5">
            {loading ? (
              <div className="text-sm text-muted-foreground italic">Loading client...</div>
            ) : !client ? (
              <div className="text-sm text-muted-foreground italic">Client not found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <UserRound className="h-4 w-4 text-primary" />
                    Contact
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {client.email || "No email"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {client.phone || "No phone"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Calendar className="h-4 w-4 text-primary" />
                    Deal
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Property: {client.property || "Unassigned"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Transaction: {client.transaction_type || "Standard"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <FileText className="h-4 w-4 text-primary" />
                    Status
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest">
                      {client.status || "pending"}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">
                      {client.invite_status || "uninvited"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
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
                <div className="text-xs text-muted-foreground italic">
                  Document requests and approvals will appear here.
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
