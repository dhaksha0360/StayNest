"use client";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export default function Guests() {
  const { data, isLoading } = useQuery({
    queryKey: ["guests"],
    queryFn: async () => (await api.get("/management/guests")).data.data,
  });
  return (
    <>
      <PageHeader
        eyebrow="Guests"
        title="Guest directory"
        description="Primary contacts and party details for every reservation."
      />
      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((x) => (
              <Skeleton key={x} className="h-14" />
            ))}
          </div>
        ) : (
          <Table className="min-w-[850px]">
            <TableHeader>
              <tr>
                {[
                  "Booking",
                  "Property",
                  "Primary customer",
                  "Contact",
                  "Stay",
                  "Party",
                  "Guest list",
                ].map((x) => (
                  <TableHead key={x}>{x}</TableHead>
                ))}
              </tr>
            </TableHeader>
            <TableBody>
              {data?.data?.map((b: any) => (
                <TableRow key={b.id}>
                  <TableCell className="font-semibold">{b.reference}</TableCell>
                  <TableCell>{b.property.name}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <Avatar name={b.user.name} />
                      {b.user.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    {b.user.email}
                    <br />
                    {b.user.phone}
                  </TableCell>
                  <TableCell>
                    {b.check_in} → {b.check_out}
                  </TableCell>
                  <TableCell>
                    {b.adults} adults · {b.children} children
                  </TableCell>
                  <TableCell>
                    {b.guests
                      .map((g: any) => `${g.first_name} ${g.last_name}`)
                      .join(", ")}
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
            icon={Users}
            title="No guest records yet"
            description="Guest details appear here as reservations are created."
          />
        </div>
      )}
    </>
  );
}
