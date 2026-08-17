"use client";
import { AuthShell } from "@/components/layout/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
export default function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/forgot-password", { email });
    setSent(true);
    toast.success("If the account exists, a reset link has been sent");
  };
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your account email and we’ll send a secure reset link."
    >
      <form onSubmit={submit}>
        <Label className="block">
          Email
          <Input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2"
          />
        </Label>
        <Button className="mt-5 w-full" size="lg">
          {sent ? "Send again" : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
