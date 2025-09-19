import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Login failed");

      console.log("✅ Login successful:", data);
      localStorage.setItem("access_token", data.access_token);
      navigate("/home");
    } catch (err) {
      console.error("❌ Login error:", err);
      alert("Login failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center border rounded-md px-2">
                <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-0 focus-visible:ring-0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="flex items-center border rounded-md px-2">
                <Lock className="h-4 w-4 text-muted-foreground mr-2" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-0 focus-visible:ring-0"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary text-white" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* ✅ Subtext links below */}
            <div className="mt-4 text-sm text-center space-y-2">
              <p>
                <Link to="/forgot-password" className="text-primary underline hover:text-primary/80">
                  Forgot your password?
                </Link>
              </p>
              <p className="text-gray-600">
                Don’t have an account?{" "}
                <Link to="/register" className="text-primary underline hover:text-primary/80">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;