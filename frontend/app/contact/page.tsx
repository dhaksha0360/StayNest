"use client";
import { Navbar } from "@/components/navbar";
import { api } from "@/lib/api";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await api.post("/contact", form);
      toast.success(data.message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Unable to send your message");
    } finally {
      setSending(false);
    }
  };
  return (
    <>
      <Navbar />
      <main className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-secondary-foreground">
            Contact StayNest
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            How can we help?
          </h1>
          <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
            Questions about a booking, managing a property, or using StayNest?
            Send a message and our support team will respond.
          </p>
          <div className="mt-10 space-y-5">
            {[
              [Mail, "support@staynest.test"],
              [Phone, "+94 11 555 0199"],
              [MapPin, "Colombo, Sri Lanka"],
            ].map(([Icon, text]) => (
              <p
                key={text as string}
                className="flex items-center gap-4 text-sm font-medium"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon size={18} />
                </span>
                {text as string}
              </p>
            ))}
          </div>
        </section>
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit}>
              {[
                ["name", "Your name", "text"],
                ["email", "Email address", "email"],
                ["subject", "Subject", "text"],
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
              <Label className="mt-5 block">
                Message
                <Textarea
                  required
                  minLength={20}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="mt-2 min-h-36"
                />
              </Label>
              <Button disabled={sending} className="mt-6 w-full" size="lg">
                {sending ? "Sending…" : "Send message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
