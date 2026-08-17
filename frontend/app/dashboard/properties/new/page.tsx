"use client";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  DollarSign,
  FileText,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
const initial = {
  name: "",
  description: "",
  type: "villa",
  address: "",
  city: "",
  country: "LK",
  max_guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  base_price: 10000,
  cleaning_fee: 0,
  service_fee: 0,
  tax_percentage: 0,
  minimum_nights: 1,
  maximum_nights: 30,
  check_in_time: "15:00",
  check_out_time: "11:00",
  cancellation_policy: "moderate",
  booking_type: "instant",
  status: "published",
};
export default function NewProperty() {
  const [form, setForm] = useState<any>(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post("/properties", form);
      toast.success("Property created");
      router.push(`/dashboard/properties/${data.data.id}/edit`);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Check all property details");
    } finally {
      setSaving(false);
    }
  };
  const fields = [
    ["name", "Property name", "text"],
    ["type", "Property type", "text"],
    ["address", "Address", "text"],
    ["city", "City", "text"],
    ["country", "Country code", "text"],
    ["max_guests", "Maximum guests", "number"],
    ["bedrooms", "Bedrooms", "number"],
    ["beds", "Beds", "number"],
    ["bathrooms", "Bathrooms", "number"],
    ["base_price", "Base price (cents)", "number"],
    ["cleaning_fee", "Cleaning fee (cents)", "number"],
    ["service_fee", "Service fee (cents)", "number"],
    ["tax_percentage", "Tax percentage", "number"],
    ["minimum_nights", "Minimum nights", "number"],
    ["maximum_nights", "Maximum nights", "number"],
  ];
  return (
    <>
      <PageHeader
        eyebrow="Properties / New"
        title="Add a property"
        description="Create the listing first, then add photography, amenities, rules, and availability."
      />
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {[
          "Basic information",
          "Location",
          "Details",
          "Pricing",
          "Policies",
          "Photos & amenities",
        ].map((step, i) => (
          <span
            key={step}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium ${i === 0 ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground"}`}
          >
            {i + 1}. {step}
          </span>
        ))}
      </div>
      <form onSubmit={submit} className="mt-4 max-w-5xl space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 size={18} />
              Property information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.slice(0, 2).map(([k, l, t]) => (
                <Label key={k}>
                  {l}
                  <Input
                    required
                    type={t}
                    value={form[k]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [k]:
                          t === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                      })
                    }
                    className="mt-2"
                  />
                </Label>
              ))}
              <Label className="sm:col-span-2">
                Description
                <Textarea
                  required
                  minLength={80}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="mt-2 min-h-36"
                />
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  Describe the experience, setting, and what makes this property
                  distinctive.
                </span>
              </Label>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={18} />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-3">
              {fields.slice(2, 5).map(([k, l, t]) => (
                <Label key={k}>
                  {l}
                  <Input
                    required
                    type={t}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="mt-2"
                  />
                </Label>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal size={18} />
              Capacity and rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-4">
              {fields.slice(5, 9).map(([k, l, t]) => (
                <Label key={k}>
                  {l}
                  <Input
                    required
                    type={t}
                    value={form[k]}
                    onChange={(e) =>
                      setForm({ ...form, [k]: Number(e.target.value) })
                    }
                    className="mt-2"
                  />
                </Label>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={18} />
              Pricing and stay requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-3">
              {fields.slice(9).map(([k, l, t]) => (
                <Label key={k}>
                  {l}
                  <Input
                    required
                    type={t}
                    value={form[k]}
                    onChange={(e) =>
                      setForm({ ...form, [k]: Number(e.target.value) })
                    }
                    className="mt-2"
                  />
                </Label>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={18} />
              Booking policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <Label>
                Cancellation policy
                <select
                  value={form.cancellation_policy}
                  onChange={(e) =>
                    setForm({ ...form, cancellation_policy: e.target.value })
                  }
                  className="mt-2 h-10 w-full rounded-lg border bg-card px-3 text-sm"
                >
                  <option value="flexible">Flexible</option>
                  <option value="moderate">Moderate</option>
                  <option value="strict">Strict</option>
                  <option value="non_refundable">Non-refundable</option>
                </select>
              </Label>
              <Label>
                Booking type
                <select
                  value={form.booking_type}
                  onChange={(e) =>
                    setForm({ ...form, booking_type: e.target.value })
                  }
                  className="mt-2 h-10 w-full rounded-lg border bg-card px-3 text-sm"
                >
                  <option value="instant">Instant booking</option>
                  <option value="request">Request to book</option>
                </select>
              </Label>
            </div>
          </CardContent>
        </Card>
        <div className="sticky bottom-4 flex justify-end rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur">
          <Button disabled={saving} size="lg">
            {saving ? "Publishing…" : "Publish property"}
          </Button>
        </div>
      </form>
    </>
  );
}
