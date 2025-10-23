import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isClient = !location.pathname.includes("agent");
  const role = isClient ? "client" : "agent";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isClient
        ? `${API_BASE_URL}/client-auth/login`
        : `${API_BASE_URL}/auth/login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = typeof data.detail === "string" ? data.detail : "";

        // ✅ Handle unconfirmed users cleanly (no redirect)
        if (
          message.toLowerCase().includes("not confirmed") ||
          message.toLowerCase().includes("isn’t confirmed") ||
          message.toLowerCase().includes("isn't confirmed")
        ) {
          alert(
            "⚠️ Your account isn’t confirmed yet. Please check your email inbox for the confirmation link."
          );
          return;
        }

        throw new Error(message || "Login failed");
      }

      // ✅ Save tokens and redirect
      localStorage.setItem(`${role}_access_token`, data.access_token);
      localStorage.setItem(`${role}_refresh_token`, data.refresh_token);

      alert("✅ Logged in successfully!");
      navigate(isClient ? "/client-dashboard" : "/dashboard");
    } catch (err) {
      alert("❌ Login failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isClient ? "Client Login" : "Agent Login"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center border rounded-md px-2">
                <Mail className="h-4 w-4 text-muted-foreground mr-2" />
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
                <Lock className="h-4 w-4 text-muted-foreground mr-2" />
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

            <Button
              type="submit"
              className="w-full bg-primary text-white hover:bg-primary/90"
              disabled={loading}
            >
              {loading
                ? isClient
                  ? "Logging in client..."
                  : "Logging in agent..."
                : "Login"}
            </Button>

            {/* Switcher link */}
            <p className="text-sm text-center text-gray-600 mt-4">
              {isClient ? (
                <>
                  Are you an agent?{" "}
                  <Link
                    to="/agent-login"
                    className="text-primary underline hover:text-primary/80"
                  >
                    Switch to Agent Login
                  </Link>
                </>
              ) : (
                <>
                  Are you a client?{" "}
                  <Link
                    to="/client-login"
                    className="text-primary underline hover:text-primary/80"
                  >
                    Switch to Client Login
                  </Link>
                </>
              )}
            </p>

            {/* Forgot password */}
            <p className="text-sm text-center text-gray-600 mt-2">
              Forgot your password?{" "}
              <Link
                to={isClient ? "/client-forgot-password" : "/forgot-password"}
                className="text-primary underline hover:text-primary/80"
              >
                Reset it
              </Link>
            </p>

            {/* Agent-only register */}
            {!isClient && (
              <p className="text-sm text-center text-gray-600 mt-2">
                Don’t have an agent account?{" "}
                <Link
                  to="/register"
                  className="text-primary underline hover:text-primary/80"
                >
                  Register
                </Link>
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;