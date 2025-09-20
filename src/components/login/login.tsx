import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Be resilient to non-JSON bodies
      let data: any = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        // 🔑 Prefer structured code from backend
        const code = typeof data.detail === "object" ? data.detail?.code : null;

        // Fallback to string matching if backend returns a string
        const detailStr =
          typeof data.detail === "string" ? data.detail : "";

        const looksUnconfirmed =
          code === "USER_NOT_CONFIRMED" ||
          /isn[’']?t confirmed|not confirmed/i.test(detailStr);

        if (looksUnconfirmed) {
          const msg =
            code === "USER_NOT_CONFIRMED"
              ? data.detail?.message || "Your account isn’t confirmed yet. We’ve resent the confirmation code to your email."
              : detailStr || "Your account isn’t confirmed yet. We’ve resent the confirmation code to your email.";

          // Save email so Confirm page can confirm by email
          localStorage.setItem("unconfirmed_email", formData.email);

          // Redirect to confirm
          navigate("/confirm");

          setTimeout(() => {
            alert("⚠️ " + msg);
          }, 200);
          return;
        }

        throw new Error(detailStr || "Login failed");
      }

      // ✅ Login success
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      alert("✅ Logged in successfully!");
      navigate("/");
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
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-sm text-center text-gray-600 mt-4">
              Don’t have an account?{" "}
              <Link to="/register" className="text-primary underline hover:text-primary/80">
                Register
              </Link>
            </p>

            <p className="text-sm text-center text-gray-600 mt-2">
              Forgot your password?{" "}
              <Link to="/forgot-password" className="text-primary underline hover:text-primary/80">
                Reset it
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
