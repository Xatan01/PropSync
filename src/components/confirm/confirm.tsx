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
  const [resending, setResending] = useState(false);

  // Pull email indirectly via pending_token flow
  const pendingToken = localStorage.getItem("pending_token");

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/confirm-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, pending_token: pendingToken }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Confirmation failed");

      alert("✅ Account confirmed! You can now log in.");
      localStorage.removeItem("pending_token");
      navigate("/login");
    } catch (err) {
      alert("❌ Error: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingToken) return;
    setResending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pending_token: pendingToken }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Resend failed");

      alert("📩 A new confirmation code has been sent to your email.");
    } catch (err) {
      alert("❌ Resend failed: " + (err as Error).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Confirm Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <Label htmlFor="code">Confirmation Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter the 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            {/* Primary action = solid button */}
            <Button type="submit" className="w-full bg-primary text-white" disabled={loading}>
              {loading ? "Verifying..." : "Confirm Account"}
            </Button>

            {/* Secondary action = text link */}
            <p className="text-sm text-center mt-2">
              Didn’t get a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-primary underline hover:text-primary/80 disabled:opacity-50"
              >
                Resend Code
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Confirm;