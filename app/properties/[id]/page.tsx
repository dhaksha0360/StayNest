"use client";
import { Navbar } from "@/components/navbar";
import { api, money } from "@/lib/api";
import type { ApiResponse, Property } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Bath,
  BedDouble,
  Check,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AvailabilityPreview } from "@/components/availability-preview";
import { SimilarProperties } from "@/components/similar-properties";
import { PropertyGallery } from "@/components/property/property-gallery";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/layout/footer";
import { PropertyReviews } from "@/components/property/property-reviews";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { findMockProperty, isMockProperty } from "@/lib/mock-properties";
export default function PropertyDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [dates, setDates] = useState({
    check_in: "",
    check_out: "",
    adults: 2,
    children: 0,
  });
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const { data: p, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const fallback = findMockProperty(String(id));
      if (fallback) return fallback;
      try {
        return (await api.get<ApiResponse<Property>>(`/properties/${id}`)).data.data;
      } catch (error) {
        if (fallback) return fallback;
        throw error;
      }
    },
  });
  const quote = useMutation({
    mutationFn: async () =>
      (await api.post("/bookings/quote", { property_id: Number(id), ...dates }))
        .data.data,
  });
  if (isLoading || !p)
    return (
      <>
        <Navbar />
        <Skeleton className="mx-auto mt-12 h-[600px] max-w-7xl rounded-xl" />
      </>
    );
  const book = () => {
    if (isMockProperty(p))
      return toast.info("This is a demo listing. Add it to the backend before accepting bookings.");
    if (!localStorage.getItem("staynest_token"))
      return router.push(`/login?next=/properties/${id}`);
    if (!dates.check_in || !dates.check_out)
      return toast.error("Choose check-in and check-out dates");
    if (quote.data) {
      const params = new URLSearchParams({
        property_id: String(id),
        check_in: dates.check_in,
        check_out: dates.check_out,
        adults: String(dates.adults),
        children: String(dates.children),
      });
      return router.push(`/checkout?${params}`);
    }
    quote.mutate();
  };
  const contactManager = async () => {
    if (isMockProperty(p))
      return toast.info("Messaging is unavailable for demonstration listings");
    if (!localStorage.getItem("staynest_token"))
      return router.push(`/login?next=/properties/${id}`);
    if (!contactMessage.trim() || !p.manager) return;
    setContactSending(true);
    try {
      await api.post("/conversations", {
        participant_id: p.manager.id,
        property_id: p.id,
        subject: `Question about ${p.name}`,
        message: contactMessage,
      });
      toast.success("Conversation started");
      setContactOpen(false);
      router.push("/dashboard/messages");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? "Unable to start conversation",
      );
    } finally {
      setContactSending(false);
    }
  };
  const favourite = async () => {
    if (isMockProperty(p))
      return toast.info("Demo properties cannot be saved until the live catalogue is available");
    if (!localStorage.getItem("staynest_token"))
      return router.push(`/login?next=/properties/${id}`);
    await api.post(`/favourites/${id}`);
    toast.success("Property saved to favourites");
  };
  const share = async () => {
    if (navigator.share)
      await navigator.share({ title: p.name, url: location.href });
    else {
      await navigator.clipboard.writeText(location.href);
      toast.success("Property link copied");
    }
  };
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7">
          <div className="flex gap-2 text-xs font-medium text-muted-foreground">
            Properties <span>/</span> {p.city}
          </div>
          {isMockProperty(p) && (
            <div className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
              Demonstration listing — browsing only
            </div>
          )}
          <div className="mt-3 flex flex-col justify-between gap-3 md:flex-row">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {p.name}
              </h1>
              <p className="mt-2 flex gap-2 text-sm text-muted-foreground">
                <MapPin size={18} />
                {p.address}, {p.city}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="mr-2 flex items-center gap-1 text-sm font-medium">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                {Number(p.rating).toFixed(1)}{" "}
                <span className="text-muted-foreground">
                  ({p.review_count})
                </span>
              </span>
              <Button variant="ghost" size="sm" onClick={share}>
                <Share2 size={16} />
                Share
              </Button>
              <Button variant="ghost" size="sm" onClick={favourite}>
                <Heart size={16} />
                Save
              </Button>
            </div>
          </div>
        </div>
        <PropertyGallery images={p.images} name={p.name} />
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_390px]">
          <div>
            <div className="grid grid-cols-2 gap-3 border-b pb-7 sm:grid-cols-4">
              <span className="flex items-center gap-3 rounded-lg bg-muted/60 p-3 text-sm font-medium">
                <Users size={19} />
                {p.max_guests} guests
              </span>
              <span className="flex items-center gap-3 rounded-lg bg-muted/60 p-3 text-sm font-medium">
                <BedDouble size={19} />
                {p.bedrooms} bedrooms
              </span>
              <span className="flex items-center gap-3 rounded-lg bg-muted/60 p-3 text-sm font-medium">
                <BedDouble size={19} />
                {p.beds} beds
              </span>
              <span className="flex items-center gap-3 rounded-lg bg-muted/60 p-3 text-sm font-medium">
                <Bath size={19} />
                {p.bathrooms} baths
              </span>
            </div>
            <section className="py-8">
              <h2 className="text-xl font-semibold">About this place</h2>
              <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">
                {p.description}
              </p>
            </section>
            <section className="border-t py-8">
              <h2 className="text-xl font-semibold">Availability</h2>
              <p className="mt-2 text-slate-500">
                Unavailable dates are shaded. Choose exact dates in the booking
                panel.
              </p>
              {isMockProperty(p) ? (
                <p className="mt-5 rounded-xl border bg-muted/40 p-5 text-sm text-muted-foreground">
                  Live availability will appear when this property is added to the StayNest catalogue.
                </p>
              ) : (
                <AvailabilityPreview propertyId={p.id} />
              )}
            </section>
            <section className="border-t py-8">
              <h2 className="text-xl font-semibold">What this place offers</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {p.amenities?.map((a) => (
                  <span key={a.id} className="flex gap-3">
                    <span className="grid size-8 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                      <Check size={16} />
                    </span>
                    {a.name}
                  </span>
                ))}
              </div>
            </section>
            <section className="border-t py-8">
              <h2 className="text-xl font-semibold">Good to know</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <div>
                  <b>Check in</b>
                  <p className="text-slate-500">After {p.check_in_time}</p>
                </div>
                <div>
                  <b>Check out</b>
                  <p className="text-slate-500">Before {p.check_out_time}</p>
                </div>
                <div>
                  <b>Cancellation</b>
                  <p className="capitalize text-slate-500">
                    {p.cancellation_policy.replace("_", " ")}
                  </p>
                </div>
              </div>
              {!!p.rules?.length && (
                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <b>House rules</b>
                  <ul className="mt-3 space-y-2 text-slate-600">
                    {p.rules.map((r: any) => (
                      <li key={r.id}>• {r.rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
            <section className="border-t py-8">
              <h2 className="text-xl font-semibold">
                Meet your property manager
              </h2>
              <div className="mt-5 flex items-center gap-4 rounded-2xl border p-5">
                <span className="grid size-14 place-items-center rounded-full bg-teal-100 text-xl font-black text-teal-700">
                  {p.manager?.name?.[0]}
                </span>
                <div className="flex-1">
                  <b>{p.manager?.name}</b>
                  <p className="text-sm text-slate-500">
                    Verified StayNest property manager
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (!localStorage.getItem("staynest_token"))
                      return router.push(`/login?next=/properties/${id}`);
                    setContactOpen(true);
                  }}
                  variant="outline"
                >
                  Send message
                </Button>
              </div>
            </section>
            <section className="border-t py-8">
              <h2 className="text-xl font-semibold">Location</h2>
              <p className="mt-2 text-slate-500">
                {p.address}, {p.city}, {p.country}
              </p>
              <iframe
                title={`${p.name} map`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${p.address}, ${p.city}, ${p.country}`)}&output=embed`}
                className="mt-5 h-72 w-full rounded-2xl border"
                loading="lazy"
              />
            </section>
            {!isMockProperty(p) && (
              <PropertyReviews
                propertyId={p.id}
                rating={Number(p.rating)}
                count={p.review_count}
              />
            )}
          </div>
          <aside className="h-fit rounded-xl border bg-card p-6 shadow-[0_12px_30px_rgba(15,23,42,.08)] lg:sticky lg:top-24">
            <div>
              <strong className="text-2xl font-semibold">
                {money(p.base_price)}
              </strong>
              <span className="text-slate-500"> / night</span>
            </div>
            <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border">
              <label className="p-3 text-xs font-bold">
                CHECK IN
                <input
                  type="date"
                  value={dates.check_in}
                  onChange={(e) =>
                    setDates({ ...dates, check_in: e.target.value })
                  }
                  className="mt-1 w-full text-sm font-medium"
                />
              </label>
              <label className="border-l p-3 text-xs font-bold">
                CHECK OUT
                <input
                  type="date"
                  value={dates.check_out}
                  onChange={(e) =>
                    setDates({ ...dates, check_out: e.target.value })
                  }
                  className="mt-1 w-full text-sm font-medium"
                />
              </label>
              <label className="col-span-2 border-t p-3 text-xs font-bold">
                GUESTS
                <input
                  type="number"
                  min="1"
                  max={p.max_guests}
                  value={dates.adults}
                  onChange={(e) =>
                    setDates({ ...dates, adults: Number(e.target.value) })
                  }
                  className="ml-3 font-medium"
                />
              </label>
            </div>
            <Button
              onClick={book}
              disabled={quote.isPending}
              className="mt-5 w-full"
              size="lg"
            >
              {quote.isPending
                ? "Checking availability…"
                : quote.data
                  ? "Continue to checkout"
                  : "Check availability"}
            </Button>
            {quote.data && (
              <div className="mt-5 space-y-3 border-t pt-5 text-sm">
                {[
                  ["Accommodation", quote.data.accommodation_subtotal],
                  ["Cleaning fee", quote.data.cleaning_fee],
                  ["Service fee", quote.data.service_fee],
                  ["Taxes", quote.data.taxes],
                ].map((x) => (
                  <div className="flex justify-between" key={x[0]}>
                    <span>{x[0]}</span>
                    <span>{money(Number(x[1]))}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between pt-1 text-base font-semibold">
                  <span>Total</span>
                  <span>{money(quote.data.total)}</span>
                </div>
              </div>
            )}
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={15} />
              You won&apos;t be charged yet
            </p>
          </aside>
        </div>
        <SimilarProperties city={p.city} exclude={p.id} />
      </main>
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">
            Message {p.manager?.name}
          </DialogTitle>
          <DialogDescription className="mt-1">
            Ask a question about {p.name}. Your conversation will be saved in
            Messages.
          </DialogDescription>
          <Textarea
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder="What would you like to know?"
            className="mt-5 min-h-28"
          />
          <div className="mt-5 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={contactManager}
              disabled={!contactMessage.trim() || contactSending}
            >
              {contactSending ? "Sending…" : "Send message"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t bg-card p-3 lg:hidden">
        <div>
          <strong>{money(p.base_price)}</strong>
          <span className="text-xs text-muted-foreground"> / night</span>
        </div>
        <Button onClick={book}>Check availability</Button>
      </div>
      <Footer />
    </>
  );
}
