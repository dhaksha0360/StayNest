"use client";
import Link from "next/link";
import { api, money } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Building2, Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button";
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
export default function ManagedProperties() {
  const { data, isLoading } = useQuery({
    queryKey: ["manager-properties"],
    queryFn: async () =>
      (await api.get("/properties?managed=1&per_page=50")).data.data,
  });
  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Properties"
        description="Manage inventory, pricing, availability, and publishing."
        action={
          <Link href="/dashboard/properties/new" className={buttonVariants()}>
            <Plus size={16} />
            Add property
          </Link>
        }
      />
      <div className="mt-6 overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((x) => (
              <Skeleton key={x} className="h-14" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Property</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {data?.data?.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold">{p.name}</TableCell>
                  <TableCell>
                    {p.city}, {p.country}
                  </TableCell>
                  <TableCell className="font-medium">
                    {money(p.base_price)}
                  </TableCell>
                  <TableCell>{p.rating}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status ?? "published"} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/properties/${p.id}/edit`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-secondary-foreground"
                    >
                      <Pencil size={14} />
                      Edit
                    </Link>
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
            icon={Building2}
            title="Create your first property"
            description="Add a property to start managing availability and accepting bookings."
            action="Add property"
            href="/dashboard/properties/new"
          />
        </div>
      )}
    </>
  );
}
