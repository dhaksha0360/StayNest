"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg } from "@fullcalendar/core";
import { api, money } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
export default function AvailabilityCalendar() {
  const qc = useQueryClient();
  const [propertyId, setPropertyId] = useState<number>(0);
  const [unblockId, setUnblockId] = useState<string | null>(null);
  const [selection, setSelection] = useState({
    start_date: "",
    end_date: "",
    status: "blocked",
    price: "",
    minimum_stay: "",
    reason: "",
  });
  const { data: properties } = useQuery({
    queryKey: ["managed-properties"],
    queryFn: async () =>
      (await api.get("/properties?managed=1&per_page=50")).data.data.data,
  });
  const active = propertyId || properties?.[0]?.id || 0;
  const { data } = useQuery({
    queryKey: ["availability", active],
    queryFn: async () =>
      (await api.get(`/properties/${active}/availability`)).data.data,
    enabled: !!active,
  });
  const save = useMutation({
    mutationFn: async () => {
      if (selection.status === "blocked" || selection.status === "maintenance")
        return (
          await api.post(`/properties/${active}/blocked-dates`, selection)
        ).data;
      return (
        await api.post(`/properties/${active}/availability`, {
          ...selection,
          price: selection.price ? Number(selection.price) : null,
          minimum_stay: selection.minimum_stay
            ? Number(selection.minimum_stay)
            : null,
        })
      ).data;
    },
    onSuccess: () => {
      toast.success("Calendar updated");
      qc.invalidateQueries({ queryKey: ["availability", active] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Unable to update calendar"),
  });
  const events = useMemo(
    () => [
      ...(data?.bookings ?? []).map((b: any) => ({
        id: `booking-${b.id}`,
        title: `${b.reference} · ${b.status}`,
        start: b.check_in,
        end: b.check_out,
        color: b.status === "pending" ? "#f59e0b" : "#0f766e",
      })),
      ...(data?.blocks ?? []).map((b: any) => ({
        id: `block-${b.id}`,
        title: b.status === "maintenance" ? "Maintenance" : "Blocked",
        start: b.start_date,
        end: new Date(new Date(b.end_date).getTime() + 86400000)
          .toISOString()
          .slice(0, 10),
        color: b.status === "maintenance" ? "#64748b" : "#ef4444",
      })),
      ...(data?.days ?? [])
        .filter((d: any) => d.price)
        .map((d: any) => ({
          id: `day-${d.id}`,
          title: money(d.price),
          start: d.date,
          color: "#8b5cf6",
        })),
    ],
    [data],
  );
  const selected = (x: DateSelectArg) =>
    setSelection({
      ...selection,
      start_date: x.startStr,
      end_date: new Date(x.end.getTime() - 86400000).toISOString().slice(0, 10),
    });
  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Availability calendar"
        description="Select a range to change availability, schedule maintenance, or override pricing."
        action={
          <select
            value={active}
            onChange={(e) => setPropertyId(Number(e.target.value))}
            className="h-10 rounded-lg border bg-card px-3 text-sm font-medium"
          >
            {properties?.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        }
      />
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge variant="success">Confirmed / booked</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="destructive">Blocked</Badge>
        <Badge>Maintenance</Badge>
        <Badge variant="info">Price override</Badge>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable
              select={selected}
              events={events}
              eventClick={async (info) => {
                if (info.event.id.startsWith("block-"))
                  setUnblockId(info.event.id.replace("block-", ""));
              }}
              height="auto"
            />
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Edit selected dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-5 space-y-4">
              <Label className="block">
                From
                <Input
                  type="date"
                  value={selection.start_date}
                  onChange={(e) =>
                    setSelection({ ...selection, start_date: e.target.value })
                  }
                  className="mt-2"
                />
              </Label>
              <Label className="block">
                To
                <Input
                  type="date"
                  value={selection.end_date}
                  onChange={(e) =>
                    setSelection({ ...selection, end_date: e.target.value })
                  }
                  className="mt-2"
                />
              </Label>
              <Label className="block">
                Status
                <select
                  value={selection.status}
                  onChange={(e) =>
                    setSelection({ ...selection, status: e.target.value })
                  }
                  className="mt-2 h-10 w-full rounded-lg border bg-card px-3 text-sm"
                >
                  <option value="available">Available / price override</option>
                  <option value="blocked">Blocked</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </Label>
              {selection.status === "available" && (
                <>
                  <Label className="block">
                    Nightly price (cents)
                    <Input
                      type="number"
                      value={selection.price}
                      onChange={(e) =>
                        setSelection({ ...selection, price: e.target.value })
                      }
                      className="mt-2"
                    />
                  </Label>
                  <Label className="block">
                    Minimum stay
                    <Input
                      type="number"
                      value={selection.minimum_stay}
                      onChange={(e) =>
                        setSelection({
                          ...selection,
                          minimum_stay: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </Label>
                </>
              )}
              <Button
                disabled={!active || !selection.start_date || save.isPending}
                onClick={() => save.mutate()}
                className="w-full"
              >
                {save.isPending ? "Saving…" : "Apply to range"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog
        open={!!unblockId}
        onOpenChange={(open) => !open && setUnblockId(null)}
      >
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">
            Unblock this date range?
          </DialogTitle>
          <DialogDescription className="mt-2">
            Guests will be able to reserve these dates again if no booking
            overlaps them.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Keep blocked</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                onClick={async () => {
                  if (!unblockId) return;
                  await api.delete(
                    `/properties/${active}/blocked-dates/${unblockId}`,
                  );
                  toast.success("Dates unblocked");
                  qc.invalidateQueries({ queryKey: ["availability", active] });
                }}
              >
                Unblock dates
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
