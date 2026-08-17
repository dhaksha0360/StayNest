"use client";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Bell, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatDistanceToNow } from "date-fns";
export default function Notifications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data.data,
    refetchInterval: 30000,
  });
  const read = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const all = useMutation({
    mutationFn: () => api.post("/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description={`${data?.unread_count ?? 0} unread updates`}
        action={
          <Button variant="outline" onClick={() => all.mutate()}>
            <CheckCheck size={16} />
            Mark all read
          </Button>
        }
      />
      <div className="mt-6 overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((x) => (
              <Skeleton key={x} className="h-20" />
            ))}
          </div>
        ) : data?.items?.data?.length ? (
          data.items.data.map((n: any) => (
            <button
              key={n.id}
              onClick={() => {
                read.mutate(n.id);
                if (n.data.action_url)
                  window.location.assign(n.data.action_url);
              }}
              className={`relative flex w-full gap-4 border-b p-5 text-left hover:bg-muted/50 ${n.read_at ? "bg-card" : "bg-secondary/35"}`}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <Bell size={19} />
              </span>
              <span>
                <span className="flex items-center gap-2">
                  <b className="text-sm font-semibold">{n.data.title}</b>
                  {!n.read_at && <Badge variant="info">New</Badge>}
                </span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {n.data.message}
                </p>
                <small className="mt-2 block text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), {
                    addSuffix: true,
                  })}
                </small>
                {n.data.action_url && (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-secondary-foreground">
                    {n.data.action_label ?? "View details"}
                    <ArrowUpRight size={13} />
                  </span>
                )}
              </span>
            </button>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title="You’re all caught up"
            description="Booking, payment, and message updates will appear here."
          />
        )}
      </div>
    </>
  );
}
