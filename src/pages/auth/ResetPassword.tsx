import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { PASSWORD_REGEX } from "@/utils/password"; // ✅ imported from utils

// ✅ Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);

  // ✅ Extract Supabase access token from URL hash
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (accessToken) {
      setToken(accessToken);
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: params.get("refresh_token") || "",
      });
    } else {
      alert("⚠️ Invalid or missing reset token.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) throw new Error("Missing reset token");

      // ✅ Validate password strength
      if (!PASSWORD_REGEX.test(newPassword)) {
        alert(
          "❌ Password must include upper, lower, number, special character and be 8+ characters long."
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("❌ Passwords do not match.");
        return;
      }

      // ✅ Update Supabase user password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      alert("✅ Password updated successfully. You can now log in.");
      navigate("/agent-login");
    } catch (err) {
      alert("❌ " + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-primary text-white">
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
