import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";

export default function AddClientModal({ onClientAdded }: { onClientAdded: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    property: "",
    transactionType: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/clients", form);
      alert("✅ Client added!");
      onClientAdded();
    } catch {
      alert("❌ Failed to add client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ Add Client</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add New Client</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div><Label>Name</Label><Input name="name" value={form.name} onChange={handleChange} required /></div>
          <div><Label>Email</Label><Input name="email" value={form.email} onChange={handleChange} type="email" /></div>
          <div><Label>Phone</Label><Input name="phone" value={form.phone} onChange={handleChange} /></div>
          <div><Label>Property</Label><Input name="property" value={form.property} onChange={handleChange} /></div>
          <div><Label>Transaction Type</Label><Input name="transactionType" value={form.transactionType} onChange={handleChange} /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving..." : "Save Client"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
