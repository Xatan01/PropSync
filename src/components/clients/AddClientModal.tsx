import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";

type FormState = {
  name: string;
  email: string;
  phone: string;
  property: string;
  transactionType: string;
};

function useMediaQuery(query: string) {
  const getMatch = () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(getMatch());

  useEffect(() => {
    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);
    handleChange();
    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, [query]);

  return matches;
}

export default function AddClientModal({ onClientAdded }: { onClientAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    property: "",
    transactionType: "",
  });
  const [loading, setLoading] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

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

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain pb-20">
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
          <Input id="phone" name="phone" value={form.phone} onChange={handleChange} inputMode="tel" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="property">Property</Label>
          <Input id="property" name="property" value={form.property} onChange={handleChange} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="transactionType">Transaction Type</Label>
          <Input
            id="transactionType"
            name="transactionType"
            value={form.transactionType}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="p-4 border-t bg-background sticky bottom-0">
        <Button
          type="submit"
          className="w-full h-10 bg-black text-white hover:bg-black/90"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Client"}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>+ Add Client</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden max-h-[85vh]">
          <DialogHeader className="p-6 border-b text-left">
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>+ Add Client</Button>
      </DrawerTrigger>
      <DrawerContent className="h-[92dvh] p-0">
        <DrawerHeader className="border-b text-left">
          <DrawerTitle>Add New Client</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden">{formContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
