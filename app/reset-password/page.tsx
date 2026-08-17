"use client";
import { AuthShell } from "@/components/layout/auth-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
function Reset() {
  const sp = useSearchParams();
  const router = useRouter();
  const [form, setForm] = useState({
    email: sp.get("email") ?? "",
    token: sp.get("token") ?? "",
    password: "",
    password_confirmation: "",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/reset-password", form);
      toast.success("Password reset");
      router.push("/login");
    } catch (e: any) {
      toast.error(
        e.response?.data?.message ?? "Reset link is invalid or expired",
      );
    }
  };
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Use at least eight characters and choose a password you don’t use elsewhere."
    >
      <form onSubmit={submit}>
        {[
          ["email", "Email", "email"],
          ["password", "New password", "password"],
          ["password_confirmation", "Confirm password", "password"],
        ].map(([k, l, t]) => (
          <Label key={k} className="mt-5 block">
            {l}
            <Input
              required
              type={t}
              value={(form as any)[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="mt-2"
            />
          </Label>
        ))}
        <Button className="mt-6 w-full" size="lg">
          Reset password
        </Button>
      </form>
    </AuthShell>
  );
}
export default function Page() {
  return (
    <Suspense>
      <Reset />
    </Suspense>
  );
}
