"use client";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
export default function Profile() {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api.get("/user").then((r) => setForm(r.data.data));
  }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/profile", form);
      localStorage.setItem("staynest_user", JSON.stringify(data.data));
      toast.success("Profile updated");
    } catch {
      toast.error("Unable to update profile");
    } finally {
      setSaving(false);
    }
  };
  const uploadAvatar = async (file: File) => {
    const body = new FormData();
    body.append("avatar", file);
    try {
      const { data } = await api.post("/profile/avatar", body);
      setForm(data.data);
      localStorage.setItem("staynest_user", JSON.stringify(data.data));
      toast.success("Profile photo updated");
    } catch {
      toast.error("Photo must be JPG, PNG, or WebP under 2 MB");
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Keep your identity and contact information current."
      />
      <form onSubmit={save} className="mt-6 max-w-3xl">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="mb-7 flex items-center gap-5 border-b pb-6">
              <Avatar
                src={form.avatar_path}
                name={form.name ?? "Profile"}
                className="size-20 text-xl"
              />
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border bg-card px-4 text-sm font-semibold hover:bg-muted">
                <Camera size={16} />
                Change photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    e.target.files?.[0] && uploadAvatar(e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ["first_name", "First name"],
                ["last_name", "Last name"],
                ["phone", "Phone"],
                ["country", "Country code"],
                ["language", "Language"],
              ].map(([k, l]) => (
                <Label key={k}>
                  {l}
                  <Input
                    value={form[k] ?? ""}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="mt-2"
                  />
                </Label>
              ))}
              <Label className="sm:col-span-2">
                Address
                <Textarea
                  value={form.address ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="mt-2"
                />
              </Label>
            </div>
            <Button disabled={saving} className="mt-6">
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
