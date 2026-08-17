"use client";
import { api } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MailCheck, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
export default function Settings() {
  const router = useRouter();
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [saving, setSaving] = useState(false);
  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/change-password", form);
      localStorage.clear();
      toast.success("Password changed");
      router.push("/login");
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Password could not be changed");
    } finally {
      setSaving(false);
    }
  };
  const resend = async () => {
    try {
      await api.post("/email/verification-notification");
      toast.success("Verification email sent");
    } catch {
      toast.error("Unable to send verification email");
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Security"
        description="Protect your account and verify your contact address."
      />
      <div className="mt-6 grid max-w-4xl gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck size={18} />
              Change password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={change}>
              {[
                ["current_password", "Current password"],
                ["password", "New password"],
                ["password_confirmation", "Confirm new password"],
              ].map(([k, l]) => (
                <Label key={k} className="mt-5 block">
                  {l}
                  <Input
                    type="password"
                    required
                    value={(form as any)[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="mt-2"
                  />
                </Label>
              ))}
              <Button disabled={saving} className="mt-6">
                {saving ? "Updating…" : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailCheck size={18} />
              Email verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              Request a fresh signed verification link. Verification protects
              bookings, payments, and manager actions.
            </p>
            <Button variant="outline" onClick={resend} className="mt-6">
              Send verification email
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
