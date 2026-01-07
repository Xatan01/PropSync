import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User } from "lucide-react";
import { PASSWORD_REGEX } from "@/utils/password";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(formData.password)) {
      alert("❌ Password must include upper, lower, number, special character and be 8+ chars.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Registration failed");

      alert("✅ Registration successful! Check your email for a confirmation link.");
      navigate("/agent-login");
    } catch (err) {
      alert("❌ Registration failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <div className="flex items-center border rounded-md px-2">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-0 focus-visible:ring-0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center border rounded-md px-2">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-0 focus-visible:ring-0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="flex items-center border rounded-md px-2">
                <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="border-0 focus-visible:ring-0"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary text-white" disabled={loading}>
              {loading ? "Registering..." : "Create Account"}
            </Button>

            <p className="text-sm text-center text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/agent-login" className="text-primary underline hover:text-primary/80">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;