import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Home as HomeIcon, Bell, Plus, Calendar, ChevronRight } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface Client {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  property?: string;
  transactionType?: string;
  progress?: number;
  status?: "active" | "pending" | "completed";
  value?: number;
  nextTask?: string;
  dueDate?: string;
}

interface Transaction {
  id: string;
  title: string;
  type: string;
  progress: number;
  client: string;
  dueDate: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [sortBy, setSortBy] = useState("dueDate");
  const [open, setOpen] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "", email: "", phone: "", property: "",
    transactionType: "", status: "pending", progress: 0,
  });

  // ✅ Capture Supabase magic link tokens
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log("✅ Magic link login successful");
    }
  }, []);

  // ✅ Fetch clients using token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    axios.get(`${API_BASE_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setClients(res.data))
    .catch(() => setClients([]));
  }, []);

  const handleAddClient = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.post(`${API_BASE_URL}/clients`, newClient, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setClients((prev) => [...prev, res.data]);
      setOpen(false);
    } catch (err) {
      console.error("❌ Failed to add client", err);
    }
  };

  // ... your existing JSX for UI (unchanged)
  return (
    <div className="bg-background min-h-screen">
      {/* your existing content unchanged */}
    </div>
  );
};

export default Home;
