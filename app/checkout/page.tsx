"use client";
import { Navbar } from "@/components/navbar";
import { api, money } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, CheckCircle2, ExternalLink, LockKeyhole } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/layout/footer";
import { imageUrl } from "@/lib/api";
function Checkout() {
  const sp = useSearchParams();
  const router = useRouter();
  const [guest, setGuest] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    special_requests: "",
  });
  const [booking, setBooking] = useState<any>(null);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const propertyId = Number(sp.get("property_id"));
  const bookingData = {
    property_id: propertyId,
    check_in: sp.get("check_in"),
    check_out: sp.get("check_out"),
    adults: Number(sp.get("adults") || 1),
    children: Number(sp.get("children") || 0),
  };
  const { data } = useQuery({
    queryKey: ["checkout-quote", bookingData],
    queryFn: async () =>
      (await api.post("/bookings/quote", bookingData)).data.data,
    enabled: !!propertyId,
  });
  const { data: property } = useQuery({
    queryKey: ["checkout-property", propertyId],
    queryFn: async () => (await api.get(`/properties/${propertyId}`)).data.data,
    enabled: !!propertyId,
  });
  const create = useMutation({
    mutationFn: async () => {
      const b = (
        await api.post("/bookings", {
          ...bookingData,
          special_requests: guest.special_requests,
          guests: [guest],
        })
      ).data.data;
      setBooking(b);
      try {
        const session = (
          await api.post("/payments/create-checkout-session", {
            booking_id: b.id,
          })
        ).data.data;
        setCheckoutUrl(session.checkout_url);
        window.location.assign(session.checkout_url);
      } catch (e: any) {
        toast.error(e.response?.data?.message ?? "Payment is not configured");
      }
      return b;
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Unable to create booking"),
  });
  if (!propertyId)
    return <div className="p-20 text-center">Missing booking details.</div>;
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-9">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-secondary-foreground">
            Secure checkout
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Complete your reservation
          </h1>
          <div className="mt-6 flex max-w-xl items-center">
            <span className="grid size-7 place-items-center rounded-full bg-primary text-xs text-white">
              1
            </span>
            <span className="h-px flex-1 bg-primary" />
            <span
              className={`grid size-7 place-items-center rounded-full text-xs ${booking ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
            >
              {booking ? <Check size={14} /> : "2"}
            </span>
            <span
              className={`h-px flex-1 ${booking ? "bg-primary" : "bg-border"}`}
            />
            <span className="grid size-7 place-items-center rounded-full bg-muted text-xs text-muted-foreground">
              3
            </span>
          </div>
          <div className="mt-2 flex max-w-xl justify-between text-[11px] text-muted-foreground">
            <span>Guest details</span>
            <span>Payment</span>
            <span>Confirmation</span>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardContent className="p-6 sm:p-8">
              {!booking ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    create.mutate();
                  }}
                >
                  <h2 className="text-xl font-semibold">Who&apos;s staying?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Enter the primary guest&apos;s contact information.
                  </p>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {[
                      ["first_name", "First name", "text"],
                      ["last_name", "Last name", "text"],
                      ["email", "Email", "email"],
                      ["phone", "Phone", "tel"],
                    ].map(([k, l, t]) => (
                      <Label key={k}>
                        {l}
                        <Input
                          required
                          type={t}
                          value={(guest as any)[k]}
                          onChange={(e) =>
                            setGuest({ ...guest, [k]: e.target.value })
                          }
                          className="mt-2"
                        />
                      </Label>
                    ))}
                    <Label className="sm:col-span-2">
                      Special requests
                      <Textarea
                        value={guest.special_requests}
                        onChange={(e) =>
                          setGuest({
                            ...guest,
                            special_requests: e.target.value,
                          })
                        }
                        className="mt-2"
                      />
                    </Label>
                  </div>
                  <Button
                    disabled={create.isPending}
                    className="mt-6 w-full"
                    size="lg"
                  >
                    {create.isPending
                      ? "Securing dates…"
                      : "Create booking and continue to payment"}
                  </Button>
                </form>
              ) : checkoutUrl ? (
                <>
                  <div className="mb-7 flex items-center gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
                    <CheckCircle2 />
                    Dates secured under {booking.reference}
                  </div>
                  <div className="py-10 text-center">
                    <LockKeyhole className="mx-auto size-10 text-primary" />
                    <h2 className="mt-4 text-xl font-semibold">
                      Continue to Stripe
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                      Your booking is secured. Complete the card payment on
                      Stripe&apos;s hosted checkout page.
                    </p>
                    <Button
                      className="mt-6"
                      size="lg"
                      onClick={() => window.location.assign(checkoutUrl)}
                    >
                      Pay {money(booking.total)} on Stripe
                      <ExternalLink size={16} />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <h2 className="text-xl font-bold">Booking created</h2>
                  <p className="mt-2 text-slate-500">
                    Configure Stripe test keys to accept payment.
                  </p>
                  <Button
                    onClick={() =>
                      router.push(`/dashboard/bookings/${booking.id}`)
                    }
                  >
                    View booking and retry payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <aside className="h-fit lg:sticky lg:top-24">
            <Card>
              {property && (
                <div className="flex gap-4 border-b p-5">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={imageUrl(property.images?.[0]?.path)}
                      alt={property.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs capitalize text-muted-foreground">
                      {property.type} · {property.city}
                    </p>
                    <h2 className="mt-1 truncate font-semibold">
                      {property.name}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {bookingData.adults + bookingData.children} guests
                    </p>
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle>Price details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-5 space-y-3 text-sm">
                  {data && (
                    <>
                      {[
                        ["Accommodation", data.accommodation_subtotal],
                        ["Cleaning fee", data.cleaning_fee],
                        ["Service fee", data.service_fee],
                        ["Taxes", data.taxes],
                      ].map((x) => (
                        <div key={x[0]} className="flex justify-between">
                          <span>{x[0]}</span>
                          <span>{money(Number(x[1]))}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between pt-1 text-base font-semibold">
                        <span>Total</span>
                        <span>{money(data.total)}</span>
                      </div>
                    </>
                  )}
                </div>
                <p className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  {bookingData.check_in} → {bookingData.check_out}
                  <br />
                  {bookingData.adults + bookingData.children} guests
                </p>
              </CardContent>
            </Card>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole size={14} />
              Encrypted payment through Stripe
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
export default function Page() {
  return (
    <Suspense>
      <Checkout />
    </Suspense>
  );
}
