import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

type EditableClient = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  property?: string;
  transactionType?: string;
};

export default function EditClientModal({
  client,
  onClientUpdated,
}: {
  client: EditableClient;
  onClientUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    property: "",
    transactionType: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      property: client.property || "",
      transactionType: client.transactionType || "",
    });
  }, [open, client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        transaction_type: form.transactionType,
      };
      await api.patch(`/clients/${client.id}`, payload);
      toast.success("Client details updated.");
      onClientUpdated();
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-[11px] font-bold">
          <Pencil className="h-3 w-3 mr-1" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div>
            <Label>Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input name="email" value={form.email} onChange={handleChange} type="email" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div>
            <Label>Property</Label>
            <Input name="property" value={form.property} onChange={handleChange} />
          </div>
          <div>
            <Label>Transaction Type</Label>
            <Input
              name="transactionType"
              value={form.transactionType}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
