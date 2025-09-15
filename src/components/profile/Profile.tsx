import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Calendar, Mail, Phone, User, Settings, LogOut } from "lucide-react";

const Profile = () => {
  // Initial agent profile
  const [agent, setAgent] = useState({
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+65 9876 5432",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=agent",
    plan: "Premium",
    clients: 12,
    timelines: 5,
    memberSince: "Jan 2023",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: agent.email,
    phone: agent.phone,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setAgent({ ...agent, ...formData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ email: agent.email, phone: agent.phone });
    setIsEditing(false);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Profile</h1>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Settings className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Overview */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback>{agent.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <CardTitle className="text-2xl">{agent.name}</CardTitle>
              <CardDescription>Real Estate Agent</CardDescription>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {agent.plan} Plan
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Member since {agent.memberSince}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Contact & Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              {!isEditing ? (
                <span>{agent.email}</span>
              ) : (
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              )}
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              {!isEditing ? (
                <span>{agent.phone}</span>
              ) : (
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              )}
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>{agent.clients} Active Clients</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{agent.timelines} Active Timelines</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button variant="destructive">
            <LogOut className="h-4 w-4 mr-2" /> Log Out
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
