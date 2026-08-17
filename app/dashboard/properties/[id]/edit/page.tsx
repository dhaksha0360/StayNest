"use client";
import { api, imageUrl } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GripVertical, ImagePlus, Star, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Skeleton } from "@/components/ui/skeleton";
export default function EditProperty() {
  const { id } = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const { data: p, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const x = (await api.get(`/properties/${id}`)).data.data;
      setForm({
        ...x,
        amenity_ids: x.amenities.map((a: any) => a.id),
        rules: x.rules.map((r: any) => r.rule),
      });
      return x;
    },
  });
  const { data: amenities } = useQuery({
    queryKey: ["amenities"],
    queryFn: async () => (await api.get("/amenities")).data.data,
  });
  if (isLoading || !form) return <Skeleton className="h-96 rounded-xl" />;
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/properties/${id}`, form);
      toast.success("Property updated");
      qc.invalidateQueries({ queryKey: ["property", id] });
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? "Unable to save property");
    }
  };
  const upload = async (files: FileList) => {
    const body = new FormData();
    Array.from(files).forEach((f) => body.append("images[]", f));
    try {
      await api.post(`/properties/${id}/images`, body);
      toast.success("Images uploaded");
      location.reload();
    } catch {
      toast.error("Use JPG, PNG, or WebP images under 5 MB");
    }
  };
  const reorder = async (images: any[], coverId: number) => {
    await api.put(`/properties/${id}/images/reorder`, {
      images: images.map((x, i) => ({ id: x.id, sort_order: i })),
      cover_id: coverId,
    });
    location.reload();
  };
  const drop = (target: number) => {
    if (drag === null) return;
    const images = [...form.images];
    const [item] = images.splice(drag, 1);
    images.splice(target, 0, item);
    setForm({ ...form, images });
    reorder(images, images.find((x: any) => x.is_cover)?.id ?? images[0].id);
  };
  const archive = async () => {
    await api.delete(`/properties/${id}`);
    toast.success("Property archived");
    router.push("/dashboard/properties");
  };
  const fields = [
    ["name", "Property name", "text"],
    ["type", "Property type", "text"],
    ["address", "Address", "text"],
    ["city", "City", "text"],
    ["country", "Country", "text"],
    ["max_guests", "Maximum guests", "number"],
    ["bedrooms", "Bedrooms", "number"],
    ["beds", "Beds", "number"],
    ["bathrooms", "Bathrooms", "number"],
    ["base_price", "Base price in cents", "number"],
    ["cleaning_fee", "Cleaning fee", "number"],
    ["service_fee", "Service fee", "number"],
    ["tax_percentage", "Tax %", "number"],
    ["minimum_nights", "Minimum nights", "number"],
    ["maximum_nights", "Maximum nights", "number"],
    ["check_in_time", "Check-in time", "time"],
    ["check_out_time", "Check-out time", "time"],
  ];
  return (
    <>
      <PageHeader
        eyebrow="Properties / Edit"
        title={p.name}
        description="Update listing details, gallery, amenities, rules, and publishing status."
        action={
          <ConfirmationDialog
            trigger={
              <Button variant="outline" className="text-destructive">
                <Trash2 size={16} />
                Archive property
              </Button>
            }
            title="Archive this property?"
            description="The listing will be removed from search. Existing booking and payment records remain available."
            confirmLabel="Archive property"
            destructive
            onConfirm={archive}
          />
        }
      />
      <form onSubmit={save} className="mt-8 space-y-7">
        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Property details</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map(([k, l, t]) => (
              <label key={k} className="text-sm font-bold">
                {l}
                <input
                  required
                  type={t}
                  value={form[k] ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [k]:
                        t === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                  className="mt-2 h-10 w-full rounded-lg border px-3 text-sm"
                />
              </label>
            ))}
            <label className="sm:col-span-2 lg:col-span-3 text-sm font-bold">
              Description
              <textarea
                minLength={80}
                required
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="mt-2 min-h-36 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </label>
          </div>
        </section>
        <section className="rounded-xl border bg-card p-6">
          <div className="flex justify-between">
            <div>
              <h2 className="text-lg font-semibold">Photo gallery</h2>
              <p className="text-sm text-muted-foreground">
                Drag to reorder and choose a cover.
              </p>
            </div>
            <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
              <ImagePlus size={17} />
              Upload
              <input
                multiple
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => e.target.files && upload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {form.images.map((img: any, i: number) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => setDrag(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => drop(i)}
                className="relative overflow-hidden rounded-xl border bg-slate-100"
              >
                <Image
                  src={imageUrl(img.path)}
                  width={320}
                  height={144}
                  className="h-36 w-full object-cover"
                  alt={img.alt_text}
                />
                <div className="flex justify-between p-2">
                  <GripVertical className="text-slate-400" />
                  <button
                    type="button"
                    onClick={() => reorder(form.images, img.id)}
                    className={
                      img.is_cover ? "text-amber-500" : "text-slate-400"
                    }
                    title="Set cover"
                  >
                    <Star
                      fill={img.is_cover ? "currentColor" : "none"}
                      size={18}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await api.delete(`/properties/${id}/images/${img.id}`);
                      location.reload();
                    }}
                    className="text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Amenities and rules</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {amenities?.map((a: any) => (
              <label
                key={a.id}
                className="flex gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={form.amenity_ids.includes(a.id)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amenity_ids: e.target.checked
                        ? [...form.amenity_ids, a.id]
                        : form.amenity_ids.filter((x: number) => x !== a.id),
                    })
                  }
                />
                {a.name}
              </label>
            ))}
          </div>
          <label className="mt-5 block text-sm font-bold">
            House rules (one per line)
            <textarea
              value={form.rules.join("\n")}
              onChange={(e) =>
                setForm({
                  ...form,
                  rules: e.target.value.split("\n").filter(Boolean),
                })
              }
              className="mt-2 min-h-28 w-full rounded-xl border px-4 py-3"
            />
          </label>
        </section>
        <Button size="lg">Save all changes</Button>
      </form>
    </>
  );
}
