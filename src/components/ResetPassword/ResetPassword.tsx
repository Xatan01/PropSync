import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CooldownButton from "@/components/ui/CooldownButton";
import CooldownLink from "@/components/ui/CooldownLink";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("reset_email");
    if (!savedEmail) {
      alert("⚠️ No email found. Please start from Forgot Password.");
      navigate("/forgot-password");
    } else {
      setEmail(savedEmail);
    }
  }, [navigate]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Reset failed");

      alert("✅ Password has been reset. You can now log in.");
      localStorage.removeItem("reset_email");
      navigate("/login");
    } catch (err) {
      alert("❌ Error: " + (err as Error).message);
    }
  };

  const handleResend = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      alert("📩 Reset code resent to your email.");
    } catch {
      alert("❌ Could not resend code. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Reset Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter the reset code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <CooldownButton type="submit" onClick={handleSubmit} className="w-full">
              Reset Password
            </CooldownButton>
          </form>

          <p className="text-sm text-center mt-2">
            Didn’t get the code? <CooldownLink onClick={handleResend}>Resend</CooldownLink>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;