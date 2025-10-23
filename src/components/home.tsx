import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface Client {
  id: string | number;
  name: string;
  email: string;
  property?: string;
  status?: string;
}

const Home = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    email: "",
    property: "",
    status: "pending",
  });

  // ✅ Fetch clients from backend (RLS-enforced)
  useEffect(() => {
    api
      .get("/clients")
      .then((res) => setClients(res.data))
      .catch(() => setClients([]));
  }, []);

  const handleAddClient = async () => {
    try {
      const res = await api.post("/clients", newClient);
      setClients((prev) => [...prev, res.data]);
      setOpen(false);
    } catch (err) {
      console.error("❌ Failed to add client", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Clients</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Name</Label>
              <Input
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              />
              <Label>Email</Label>
              <Input
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              />
              <Label>Property</Label>
              <Input
                value={newClient.property}
                onChange={(e) => setNewClient({ ...newClient, property: e.target.value })}
              />
              <Button onClick={handleAddClient} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients List</CardTitle>
          <CardDescription>Your current clients</CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p>No clients yet.</p>
          ) : (
            clients.map((client) => (
              <div key={client.id} className="flex justify-between py-2 border-b">
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-gray-600">{client.email}</p>
                </div>
                <span className="text-sm capitalize">{client.status}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
