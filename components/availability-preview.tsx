"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
export function AvailabilityPreview({ propertyId }: { propertyId: number }) {
  const { data } = useQuery({
    queryKey: ["public-availability", propertyId],
    queryFn: async () =>
      (await api.get(`/properties/${propertyId}/availability`)).data.data,
  });
  const events = [
    ...(data?.bookings ?? []).map((b: any) => ({
      title: "Unavailable",
      start: b.check_in,
      end: b.check_out,
      color: "#cbd5e1",
      textColor: "#475569",
    })),
    ...(data?.blocks ?? []).map((b: any) => ({
      title: b.status === "maintenance" ? "Maintenance" : "Unavailable",
      start: b.start_date,
      end: new Date(new Date(b.end_date).getTime() + 86400000)
        .toISOString()
        .slice(0, 10),
      color: "#cbd5e1",
      textColor: "#475569",
    })),
  ];
  return (
    <div className="availability-public mt-5 overflow-hidden rounded-2xl border p-4">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        headerToolbar={{ left: "prev", center: "title", right: "next" }}
        height="auto"
      />
    </div>
  );
}
