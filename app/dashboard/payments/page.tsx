"use client";
import { api, money } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export default function Payments() {
  const qc = useQueryClient();
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("staynest_user") || "{}")
      : {};
  const { data, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => (await api.get("/payments")).data.data,
  });
  const refund = useMutation({
    mutationFn: (id: number) => api.post(`/payments/${id}/refund`, {}),
    onSuccess: () => {
      toast.success("Refund submitted to Stripe");
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Refund could not be processed"),
  });
  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        description="Verified transaction history and eligible refund operations."
      />
      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((x) => (
              <Skeleton key={x} className="h-14" />
            ))}
          </div>
        ) : (
          <Table className="min-w-[900px]">
            <TableHeader>
              <tr>
                {[
                  "Transaction",
                  "Booking",
                  "Customer",
                  "Property",
                  "Amount",
                  "Method",
                  "Status",
                  "Date",
                  "",
                ].map((x) => (
                  <TableHead key={x}>{x}</TableHead>
                ))}
              </tr>
            </TableHeader>
            <TableBody>
              {data?.data?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">
                    {p.stripe_payment_id}
                  </TableCell>
                  <TableCell>{p.booking.reference}</TableCell>
                  <TableCell>{p.booking.user.name}</TableCell>
                  <TableCell>{p.booking.property.name}</TableCell>
                  <TableCell className="font-medium">
                    {money(p.amount, p.currency)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {p.payment_method_type ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>{p.created_at.slice(0, 10)}</TableCell>
                  <TableCell>
                    {user.role === "admin" &&
                      ["paid", "partially_refunded"].includes(p.status) &&
                      p.booking.status === "cancelled" && (
                        <ConfirmationDialog
                          trigger={
                            <Button variant="outline" size="sm">
                              Refund
                            </Button>
                          }
                          title="Process this refund?"
                          description={`The eligible amount for ${p.booking.reference} will be submitted to Stripe. This action cannot be reversed from StayNest.`}
                          confirmLabel="Process refund"
                          destructive
                          onConfirm={() => refund.mutate(p.id)}
                        />
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {!isLoading && !data?.data?.length && (
        <div className="mt-6">
          <EmptyState
            icon={CreditCard}
            title="No transactions yet"
            description="Completed and pending booking payments will appear here."
          />
        </div>
      )}
    </>
  );
}
