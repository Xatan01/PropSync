import React, { useState } from "react";
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

export default function AddClientModal({ onClientAdded }: { onClientAdded: () => void }) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
    } catch {
      alert("❌ Failed to add client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Add Client</Button>
      </DialogTrigger>
      <DialogContent className="p-0 flex flex-col max-h-[90vh] sm:max-w-md overflow-hidden">
        <DialogHeader className="p-6 border-b text-left">
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required autoFocus />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                inputMode="tel"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="property">Property</Label>
              <Input id="property" name="property" value={form.property} onChange={handleChange} />
            </div>
            <div className="grid gap-2 pb-2">
              <Label htmlFor="transactionType">Transaction Type</Label>
              <Input
                id="transactionType"
                name="transactionType"
                value={form.transactionType}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50/50">
            <Button
              type="submit"
              className="w-full h-10 bg-black text-white hover:bg-black/90"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
