"use client";
import { api, money } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  ChartNoAxesCombined,
  CircleDollarSign,
  Home,
  MessageSquare,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ArrowUpRight } from "lucide-react";
export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/dashboard")).data.data,
  });
  const items = data ? Object.entries(data) : [];
  const { data: bookings } = useQuery({
    queryKey: ["dashboard-bookings"],
    queryFn: async () => (await api.get("/bookings?per_page=5")).data.data.data,
  });
  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => (await api.get("/conversations")).data.data.data,
  });
  const icons = [
    Home,
    CalendarCheck,
    CircleDollarSign,
    Users,
    ChartNoAxesCombined,
    MessageSquare,
  ];
  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Welcome back"
        description="Here’s what’s happening across your StayNest account today."
      />
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? [1, 2, 3, 4].map((x) => (
              <Skeleton key={x} className="h-32 rounded-xl" />
            ))
          : items.map(([key, value], i) => {
              const Icon = icons[i % icons.length];
              return (
                <MetricCard
                  key={key}
                  label={key.replaceAll("_", " ")}
                  value={
                    key.includes("revenue")
                      ? money(Number(value))
                      : String(value)
                  }
                  icon={Icon}
                />
              );
            })}
      </section>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent bookings</CardTitle>
            <Link
              href="/dashboard/bookings"
              className="flex items-center gap-1 text-sm font-medium text-secondary-foreground"
            >
              View all <ArrowUpRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            {bookings?.map((b: any) => (
              <Link
                key={b.id}
                href={`/dashboard/bookings/${b.id}`}
                className="flex flex-col justify-between gap-2 border-t py-4 first:border-t-0 sm:flex-row sm:items-center"
              >
                <span>
                  <b className="text-sm font-semibold">{b.property.name}</b>
                  <small className="block text-xs text-muted-foreground">
                    {b.reference} · {b.check_in} → {b.check_out}
                  </small>
                </span>
                <StatusBadge status={b.status} />
              </Link>
            ))}
            {!bookings?.length && (
              <EmptyState
                icon={CalendarCheck}
                title="Your next stay starts here"
                description="Bookings and reservation activity will appear here."
                action="Explore properties"
                href="/properties"
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent messages</CardTitle>
            <Link
              href="/dashboard/messages"
              className="flex items-center gap-1 text-sm font-medium text-secondary-foreground"
            >
              Inbox <ArrowUpRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            {conversations?.slice(0, 4).map((c: any) => (
              <Link
                key={c.id}
                href="/dashboard/messages"
                className="block border-t py-4 first:border-t-0"
              >
                <b className="text-sm font-semibold">{c.subject}</b>
                <p className="truncate text-xs text-muted-foreground">
                  {c.messages?.[0]?.body}
                </p>
              </Link>
            ))}
            {!conversations?.length && (
              <EmptyState
                icon={MessageSquare}
                title="No conversations yet"
                description="Messages from guests and property managers will appear here."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
