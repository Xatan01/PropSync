// src/pages/clients/ClientSetPassword.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { getTokenKey, getUserKey } from "@/utils/authTokens";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";

function parseHashTokens(hash: string) {
  // Supabase puts tokens in URL hash: #access_token=...&refresh_token=...&type=invite
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(h);
  return {
    access_token: params.get("access_token") || "",
    refresh_token: params.get("refresh_token") || "",
    type: params.get("type") || "",
  };
}

function getPasswordErrorMessage(err: any) {
  const detail = err?.response?.data?.detail || "";
  if (typeof detail === "string") {
    if (detail.toLowerCase().includes("new password should be different")) {
      return "New password must be different from your previous password.";
    }
  }
  return detail || "Failed to set password.";
}

const ClientSetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 1) ALWAYS clear any existing session tokens (prevents agent session hijacking invite)
  useEffect(() => {
    localStorage.removeItem(getTokenKey("client", "access"));
    localStorage.removeItem(getTokenKey("client", "refresh"));
    localStorage.removeItem(getUserKey("client"));
  }, []);

  const tokens = useMemo(() => parseHashTokens(window.location.hash), []);

  const hasTokens = !!tokens.access_token && !!tokens.refresh_token;

  useEffect(() => {
    if (!hasTokens) {
      // If user lands here without tokens, just send them to client login
      toast.error("Invite link is missing tokens. Please open the invite email again.");
      navigate("/client-login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTokens]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/set-password", {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        password,
      });

      toast.success("Password set. You can now log in as a client.");
      // Send to client login
      navigate("/client-login", { replace: true });
    } catch (err: any) {
      toast.error(getPasswordErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-muted shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">Set your password</CardTitle>
              <CardDescription className="text-xs">
                Finish account setup to access the client portal.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                New Password
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                Confirm Password
              </Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="h-10"
              />
            </div>

            <Button type="submit" className="w-full font-bold" disabled={submitting || !hasTokens}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                </>
              ) : (
                "Set Password"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs"
              onClick={() => navigate("/client-login")}
            >
              Back to client login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSetPassword;
