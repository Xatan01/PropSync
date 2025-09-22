import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Confirm = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // what we stored earlier
  const pendingToken = localStorage.getItem("pending_token");
  const email =
    sessionStorage.getItem("pending_email") ||
    localStorage.getItem("unconfirmed_email");
  const password = sessionStorage.getItem("pending_password"); // only exists if user came from register/login

  const handleConfirm = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);

    try {
      // ✅ Step 1: build request depending on whether we have a pending_token
      let endpoint = "/auth/confirm-signup";
      let body: Record<string, string> = { code };

      if (pendingToken) {
        body.pending_token = pendingToken;
      } else {
        if (!email) throw new Error("No email found. Please try login/register again.");
        endpoint = "/auth/confirm-signup-by-email";
        body = { email, code };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Confirmation failed");

      // ✅ Step 2: auto-login if we have stored credentials
      if (email && password) {
        const loginResp = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginResp.json();
        if (!loginResp.ok) throw new Error(loginData.detail || "Auto-login failed");

        localStorage.setItem("access_token", loginData.access_token);
        localStorage.setItem("refresh_token", loginData.refresh_token);
      }

      // ✅ Step 3: cleanup storage
      localStorage.removeItem("pending_token");
      localStorage.removeItem("unconfirmed_email");
      sessionStorage.removeItem("pending_email");
      sessionStorage.removeItem("pending_password");

      alert("✅ Account confirmed and logged in!");
      navigate("/home");
    } catch (err) {
      alert("❌ Error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Confirm Your Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <Label htmlFor="code">Confirmation Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter the code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-white"
              disabled={loading}
            >
              {loading ? "Confirming..." : "Confirm Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Confirm;
