"use client";
import { api, money } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  Search,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
export default function Bookings() {
  const qc = useQueryClient();
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("staynest_user") || "{}")
      : {};
  const manager = user.role === "manager" || user.role === "admin";
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [page, setPage] = useState(1);
  const [cancelDetails, setCancelDetails] = useState<{
    booking: any;
    quote: any;
  } | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["bookings", filters, page],
    queryFn: async () =>
      (await api.get("/bookings", { params: { ...filters, page } })).data.data,
  });
  const pay = useMutation({
    mutationFn: async (bookingId: number) =>
      (
        await api.post("/payments/create-checkout-session", {
          booking_id: bookingId,
        })
      ).data.data,
    onSuccess: (session) => window.location.assign(session.checkout_url),
    onError: (e: any) =>
      toast.error(
        e.response?.data?.message ?? "Unable to open Stripe checkout",
      ),
  });
  const cancel = useMutation({
    mutationFn: (id: number) => api.post(`/bookings/${id}/cancel`),
    onSuccess: () => {
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Unable to cancel"),
  });
  const status = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.post(`/bookings/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("Booking status updated");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Status could not be updated"),
  });
  const requestCancel = async (b: any) => {
    const quote = (await api.get(`/bookings/${b.id}/cancellation-quote`)).data
      .data;
    setCancelDetails({ booking: b, quote });
  };
  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="Bookings"
        description="Track every reservation, payment, and upcoming arrival."
      />
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-3 text-muted-foreground"
          />
          <Input
            value={filters.search}
            onChange={(e) => {
              setPage(1);
              setFilters({ ...filters, search: e.target.value });
            }}
            placeholder="Search booking reference"
            className="pl-9"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => {
            setPage(1);
            setFilters({ ...filters, status: e.target.value });
          }}
          className="h-10 rounded-lg border bg-card px-3 text-sm"
        >
          <option value="">All statuses</option>
          {[
            "pending",
            "confirmed",
            "checked_in",
            "checked_out",
            "cancelled",
            "rejected",
          ].map((x) => (
            <option key={x} value={x}>
              {x.replace("_", " ")}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={() => {
            const rows = data?.data ?? [];
            const csv = [
              "Reference,Property,Check-in,Check-out,Guests,Amount,Payment,Status",
              ...rows.map((b: any) =>
                [
                  b.reference,
                  b.property.name,
                  b.check_in,
                  b.check_out,
                  b.adults + b.children,
                  b.total,
                  b.payment_status,
                  b.status,
                ].join(","),
              ),
            ].join("\n");
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
            a.download = "staynest-bookings.csv";
            a.click();
          }}
        >
          <Download size={16} />
          Export CSV
        </Button>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((x) => (
              <Skeleton key={x} className="h-14" />
            ))}
          </div>
        ) : data?.data?.length ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <tr>
                  {[
                    "Reference",
                    "Property",
                    "Stay",
                    "Guests",
                    "Amount",
                    "Payment",
                    "Status",
                    "Actions",
                  ].map((x) => (
                    <TableHead key={x}>{x}</TableHead>
                  ))}
                </tr>
              </TableHeader>
              <TableBody>
                {data.data.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-semibold">
                      {b.reference}
                    </TableCell>
                    <TableCell>{b.property.name}</TableCell>
                    <TableCell>
                      {b.check_in} → {b.check_out}
                    </TableCell>
                    <TableCell>{b.adults + b.children}</TableCell>
                    <TableCell className="font-medium">
                      {money(b.total, b.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.payment_status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-max items-center gap-2">
                        <Link
                          href={`/dashboard/bookings/${b.id}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-colors hover:bg-muted"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                        {!manager &&
                          b.payment_status !== "paid" &&
                          !["cancelled", "rejected"].includes(b.status) && (
                            <Button
                              size="sm"
                              onClick={() => pay.mutate(b.id)}
                              disabled={pay.isPending}
                            >
                              <CreditCard size={14} />
                              Pay now
                            </Button>
                          )}
                        {manager &&
                          b.status === "pending" &&
                          b.payment_status === "paid" && (
                            <span className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  status.mutate({
                                    id: b.id,
                                    status: "confirmed",
                                  })
                                }
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  status.mutate({
                                    id: b.id,
                                    status: "rejected",
                                  })
                                }
                              >
                                Reject
                              </Button>
                            </span>
                          )}
                        {manager &&
                          b.status === "pending" &&
                          b.payment_status !== "paid" && (
                            <span className="text-xs font-medium text-muted-foreground">
                              Awaiting payment
                            </span>
                          )}
                        {manager && b.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              status.mutate({ id: b.id, status: "checked_in" })
                            }
                          >
                            Check in
                          </Button>
                        )}
                        {manager && b.status === "checked_in" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              status.mutate({ id: b.id, status: "checked_out" })
                            }
                          >
                            Check out
                          </Button>
                        )}
                        {!manager &&
                          ["pending", "confirmed"].includes(b.status) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => requestCancel(b)}
                              className="text-destructive"
                            >
                              Cancel
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="Your next stay starts here"
            description="Reservations and future stays will appear here."
            action="Explore properties"
            href="/properties"
          />
        )}
      </div>
      {data?.last_page > 1 && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            Showing {data.from}–{data.to} of {data.total} bookings
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft size={15} />
              Previous
            </Button>
            <span className="px-2 font-medium">
              Page {data.current_page} of {data.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.last_page}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}
      <Dialog
        open={!!cancelDetails}
        onOpenChange={(open) => !open && setCancelDetails(null)}
      >
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">
            Cancel {cancelDetails?.booking.reference}?
          </DialogTitle>
          <DialogDescription className="mt-2 leading-6">
            This action releases the reserved dates. Based on the cancellation
            policy, your estimated refund is{" "}
            <strong className="text-foreground">
              {money(cancelDetails?.quote.refundable_amount ?? 0)}
            </strong>{" "}
            and the cancellation fee is{" "}
            <strong className="text-foreground">
              {money(cancelDetails?.quote.cancellation_fee ?? 0)}
            </strong>
            .
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Keep booking</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                variant="destructive"
                onClick={() =>
                  cancelDetails && cancel.mutate(cancelDetails.booking.id)
                }
              >
                Cancel booking
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
