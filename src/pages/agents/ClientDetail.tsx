import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/clients/${clientId}`);
        setClient(res.data || null);
      } catch {
        setClient(null);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) fetchClient();
  }, [clientId]);

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
                <div className="text-xs text-muted-foreground italic">
                  Notes area coming soon.
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
