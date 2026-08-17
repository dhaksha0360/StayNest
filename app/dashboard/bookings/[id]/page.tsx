"use client";
import { api, money } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Download,
  Home,
  LoaderCircle,
  MessageSquare,
  Star,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
export default function BookingDetail() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentResult = searchParams.get("payment");
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("staynest_user") || "{}")
      : {};
  const manager = user.role === "manager" || user.role === "admin";
  const [review, setReview] = useState({
    overall: 5,
    cleanliness: 5,
    location: 5,
    communication: 5,
    value: 5,
    review: "",
  });
  const {
    data: b,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => (await api.get(`/bookings/${id}`)).data.data,
  });
  const submit = useMutation({
    mutationFn: () =>
      api.post("/reviews", { booking_id: Number(id), ...review }),
    onSuccess: () => toast.success("Review published"),
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Review could not be published"),
  });
  const pay = useMutation({
    mutationFn: async () =>
      (
        await api.post("/payments/create-checkout-session", {
          booking_id: Number(id),
        })
      ).data.data,
    onSuccess: (session) => window.location.assign(session.checkout_url),
    onError: (e: any) =>
      toast.error(
        e.response?.data?.message ?? "Unable to open Stripe checkout",
      ),
  });
  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (isError || !b)
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <AlertCircle className="mx-auto text-destructive" />
        <h1 className="mt-4 text-xl font-semibold">Booking unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not load this booking. Refresh the page or return to your
          bookings.
        </p>
        <Button
          className="mt-5"
          onClick={() => router.push("/dashboard/bookings")}
        >
          Back to bookings
        </Button>
      </Card>
    );
  const download = async () => {
    const r = await api.get(`/bookings/${id}/confirmation`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(r.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${b.reference}-confirmation.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const message = async () => {
    try {
      await api.post("/conversations", {
        participant_id: b.property.manager.id,
        property_id: b.property_id,
        booking_id: b.id,
        subject: `${b.reference} · ${b.property.name}`,
        message: "Hello, I would like to discuss my booking.",
      });
      router.push("/dashboard/messages");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? "Unable to open conversation",
      );
    }
  };
  return (
    <>
      {paymentResult === "success" && (
        <div className="mb-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
          <CheckCircle2 className="shrink-0" />
          <div>
            <h2 className="font-semibold">Payment completed</h2>
            <p className="mt-1 text-sm">
              Stripe verified your payment. Your payment status is paid
              {b.property.booking_type === "instant"
                ? " and your booking is confirmed."
                : ". Your request is awaiting manager approval."}
            </p>
          </div>
        </div>
      )}
      {paymentResult === "cancelled" && (
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <AlertCircle className="shrink-0" />
            <div>
              <h2 className="font-semibold">Payment was not completed</h2>
              <p className="mt-1 text-sm">
                Your booking is saved. Return to Stripe whenever you are ready.
              </p>
            </div>
          </div>
          <Button onClick={() => pay.mutate()} disabled={pay.isPending}>
            <CreditCard size={16} />
            Pay now
          </Button>
        </div>
      )}
      <Link
        href="/dashboard/bookings"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to bookings
      </Link>
      <PageHeader
        eyebrow={`Bookings / ${b.reference}`}
        title={b.property.name}
        description={`${b.check_in} → ${b.check_out} · ${b.nights} nights`}
        action={
          <div className="flex flex-wrap gap-2">
            {!manager &&
              b.payment_status !== "paid" &&
              !["cancelled", "rejected"].includes(b.status) && (
                <Button onClick={() => pay.mutate()} disabled={pay.isPending}>
                  {pay.isPending ? (
                    <LoaderCircle className="animate-spin" size={16} />
                  ) : (
                    <CreditCard size={16} />
                  )}
                  {pay.isPending
                    ? "Opening Stripe…"
                    : `Pay ${money(b.total, b.currency)}`}
                </Button>
              )}
            <Button variant="outline" onClick={download}>
              <Download size={16} />
              Confirmation PDF
            </Button>
            <Button onClick={message}>
              <MessageSquare size={16} />
              Message manager
            </Button>
          </div>
        }
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reservation details</CardTitle>
          </CardHeader>
          <CardContent>
            {!manager && b.payment_status !== "paid" && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Payment required</p>
                <p className="mt-1">
                  Complete payment on Stripe to secure this reservation.
                </p>
              </div>
            )}
            {[
              ["Status", b.status.replace("_", " ")],
              ["Payment", b.payment_status],
              ["Guests", `${b.adults} adults · ${b.children} children`],
              ["Total", money(b.total, b.currency)],
              [
                "Cancellation policy",
                b.property.cancellation_policy.replace("_", " "),
              ],
            ].map((x) => (
              <div key={x[0]} className="flex justify-between border-b py-4">
                <span className="text-sm text-muted-foreground">{x[0]}</span>
                {x[0] === "Status" || x[0] === "Payment" ? (
                  <StatusBadge status={String(x[1]).replace(" ", "_")} />
                ) : (
                  <b className="text-sm font-medium capitalize">{x[1]}</b>
                )}
              </div>
            ))}
            <h3 className="mt-6 text-sm font-semibold">Guest list</h3>
            {b.guests.map((g: any) => (
              <p key={g.id} className="mt-2 text-sm">
                {g.first_name} {g.last_name}{" "}
                {g.is_primary && (
                  <span className="text-secondary-foreground">· Primary</span>
                )}
              </p>
            ))}
            <div className="mt-6 flex gap-2">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 text-sm font-medium text-secondary-foreground"
              >
                <Home size={15} />
                Explore more stays
              </Link>
            </div>
          </CardContent>
        </Card>
        {b.status === "checked_out" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
            className="rounded-xl border bg-card p-6"
          >
            <h2 className="flex gap-2 text-lg font-semibold">
              <Star className="text-amber-400" />
              Review your stay
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {[
                "overall",
                "cleanliness",
                "location",
                "communication",
                "value",
              ].map((k) => (
                <Label key={k} className="capitalize">
                  {k}
                  <select
                    value={(review as any)[k]}
                    onChange={(e) =>
                      setReview({ ...review, [k]: Number(e.target.value) })
                    }
                    className="mt-2 h-10 w-full rounded-lg border bg-card px-3 text-sm"
                  >
                    {[5, 4, 3, 2, 1].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Label>
              ))}
            </div>
            <Textarea
              required
              minLength={20}
              value={review.review}
              onChange={(e) => setReview({ ...review, review: e.target.value })}
              placeholder="Tell future guests about your stay…"
              className="mt-5 min-h-32"
            />
            <Button className="mt-4">Publish review</Button>
          </form>
        )}
      </div>
    </>
  );
}
