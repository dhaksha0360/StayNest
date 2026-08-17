"use client";
import { api, money } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Database, Mail, MessageSquareReply, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
const endpoints: Record<string, string> = {
  users: "/admin/users",
  roles: "/admin/roles",
  properties: "/admin/properties",
  bookings: "/admin/bookings",
  payments: "/admin/payments",
  reviews: "/admin/reviews",
  contacts: "/admin/contacts",
  "activity-logs": "/admin/activity-logs",
  settings: "/admin/settings",
};
export default function AdminSection() {
  const { section } = useParams<{ section: string }>();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", section],
    queryFn: async () => (await api.get(endpoints[section])).data.data,
    enabled: !!endpoints[section],
  });
  const { data: permissions = [] } = useQuery({
    queryKey: ["admin", "permissions"],
    queryFn: async () => (await api.get("/admin/permissions")).data.data,
    enabled: section === "roles",
  });
  const updateRole = useMutation({
    mutationFn: ({
      id,
      label,
      permissionIds,
    }: {
      id: number;
      label: string;
      permissionIds: number[];
    }) =>
      api.put(`/admin/roles/${id}`, { label, permission_ids: permissionIds }),
    onSuccess: () => {
      toast.success("Role permissions updated");
      qc.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
  });
  const role = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      api.put(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      toast.success("User role updated");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
  const [settings, setSettings] = useState<Record<string, string>>({});
  const save = useMutation({
    mutationFn: () =>
      api.put("/admin/settings", {
        settings: Object.entries(settings).map(([key, value]) => ({
          key,
          value,
          is_public: false,
        })),
      }),
    onSuccess: () => toast.success("Platform settings saved"),
  });
  if (isLoading) return <Skeleton className="h-80 rounded-xl" />;
  if (error)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        <h2 className="font-semibold">Administration unavailable</h2>
        <p className="mt-1 text-sm">
          You may not have administrator access, or the API could not be
          reached.
        </p>
      </div>
    );
  const rows = data?.data ?? data ?? [];
  if (section === "settings")
    return (
      <div className="max-w-2xl rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Platform settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configuration changes apply across the StayNest platform.
        </p>
        {[
          "support_email",
          "default_currency",
          "service_fee_percentage",
          "maintenance_mode",
        ].map((k) => (
          <label key={k} className="mt-5 block text-sm font-bold capitalize">
            {k.replaceAll("_", " ")}
            <input
              value={
                settings[k] ?? rows.find((x: any) => x.key === k)?.value ?? ""
              }
              onChange={(e) =>
                setSettings({ ...settings, [k]: e.target.value })
              }
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </label>
        ))}
        <button
          onClick={() => save.mutate()}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          <Save size={16} />
          Save settings
        </button>
      </div>
    );
  if (section === "users")
    return (
      <DataTable
        headers={["User", "Email", "Phone", "Role", "Joined"]}
        rows={rows.map((u: any) => [
          u.name,
          u.email,
          u.phone ?? "—",
          <select
            key={u.id}
            value={u.role}
            onChange={(e) => role.mutate({ id: u.id, role: e.target.value })}
            className="rounded-lg border px-2 py-1"
          >
            <option value="customer">Customer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>,
          u.created_at.slice(0, 10),
        ])}
      />
    );
  if (section === "contacts") return <ContactInbox rows={rows} />;
  if (section === "roles")
    return (
      <div className="grid gap-5 lg:grid-cols-3">
        {rows.map((r: any) => (
          <RoleEditor
            key={r.id}
            role={r}
            permissions={permissions}
            save={updateRole.mutate}
          />
        ))}
      </div>
    );
  if (section === "properties")
    return (
      <DataTable
        headers={["Property", "Manager", "Location", "Bookings", "Status"]}
        rows={rows.map((p: any) => [
          p.name,
          p.manager.name,
          `${p.city}, ${p.country}`,
          p.bookings_count,
          <StatusBadge key={p.id} status={p.status} />,
        ])}
      />
    );
  if (section === "payments")
    return (
      <DataTable
        headers={[
          "Transaction",
          "Booking",
          "Property",
          "Amount",
          "Status",
          "Date",
        ]}
        rows={rows.map((p: any) => [
          p.stripe_payment_id,
          p.booking.reference,
          p.booking.property.name,
          money(p.amount, p.currency),
          <StatusBadge key={p.id} status={p.status} />,
          p.created_at.slice(0, 10),
        ])}
      />
    );
  if (section === "bookings")
    return (
      <DataTable
        headers={[
          "Reference",
          "Customer",
          "Property",
          "Stay",
          "Amount",
          "Status",
        ]}
        rows={rows.map((b: any) => [
          b.reference,
          b.user.name,
          b.property.name,
          `${b.check_in} → ${b.check_out}`,
          money(b.total, b.currency),
          <StatusBadge key={b.id} status={b.status} />,
        ])}
      />
    );
  if (section === "reviews")
    return (
      <DataTable
        headers={["Guest", "Property", "Rating", "Review", "Date"]}
        rows={rows.map((r: any) => [
          r.user.name,
          r.property.name,
          `${r.overall}/5`,
          r.review,
          r.created_at.slice(0, 10),
        ])}
      />
    );
  return (
    <DataTable
      headers={["Actor", "Action", "Entity", "Changes", "Timestamp"]}
      rows={rows.map((l: any) => [
        l.user?.name ?? "System",
        l.action,
        l.entity_type
          ? `${l.entity_type.split("\\").pop()} #${l.entity_id}`
          : "—",
        JSON.stringify(l.changes ?? {}),
        l.created_at.replace("T", " ").slice(0, 16),
      ])}
    />
  );
}

function ContactInbox({ rows }: { rows: any[] }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any | null>(null);
  const [reply, setReply] = useState("");
  const status = useMutation({
    mutationFn: ({ id, value }: { id: number; value: string }) =>
      api.put(`/admin/contacts/${id}/status`, { status: value }),
    onSuccess: () => {
      toast.success("Contact status updated");
      qc.invalidateQueries({ queryKey: ["admin", "contacts"] });
    },
    onError: () => toast.error("Unable to update contact status"),
  });
  const sendReply = useMutation({
    mutationFn: () =>
      api.post(`/admin/contacts/${selected.id}/reply`, { message: reply }),
    onSuccess: () => {
      toast.success("Reply sent by email");
      setSelected(null);
      setReply("");
      qc.invalidateQueries({ queryKey: ["admin", "contacts"] });
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message ?? "Unable to send reply"),
  });

  if (!rows.length)
    return (
      <EmptyState
        icon={Mail}
        title="No support enquiries"
        description="Messages submitted through the public contact form appear here."
      />
    );

  return (
    <>
      <div className="space-y-4">
        {rows.map((contact) => (
          <article key={contact.id} className="rounded-xl border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{contact.subject}</h2>
                  <StatusBadge status={contact.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {contact.name} · {contact.email} ·{" "}
                  {contact.created_at.slice(0, 10)}
                </p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
                  {contact.message}
                </p>
                {contact.response && (
                  <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
                    <p className="font-semibold">Your response</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {contact.response}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <select
                  value={contact.status}
                  onChange={(event) =>
                    status.mutate({ id: contact.id, value: event.target.value })
                  }
                  className="h-9 rounded-lg border bg-card px-3 text-sm"
                  aria-label={`Status for ${contact.subject}`}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="spam">Spam</option>
                </select>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelected(contact);
                    setReply("");
                  }}
                >
                  <MessageSquareReply size={15} />
                  Reply
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent>
          <DialogTitle>Reply to {selected?.name}</DialogTitle>
          <DialogDescription>
            Your response will be emailed to {selected?.email} through the
            configured mail service.
          </DialogDescription>
          <Textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Write a helpful response…"
            className="mt-4 min-h-40"
          />
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              disabled={reply.trim().length < 10 || sendReply.isPending}
              onClick={() => sendReply.mutate()}
            >
              {sendReply.isPending ? "Sending…" : "Send email reply"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
function RoleEditor({
  role,
  permissions,
  save,
}: {
  role: any;
  permissions: any[];
  save: (value: { id: number; label: string; permissionIds: number[] }) => void;
}) {
  const [label, setLabel] = useState(role.label);
  const [selected, setSelected] = useState<number[]>(
    role.permissions.map((p: any) => p.id),
  );
  const toggle = (id: number) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  return (
    <section className="rounded-2xl border bg-white p-6">
      <p className="text-xs font-black uppercase tracking-widest text-teal-700">
        {role.name} · {role.users_count} users
      </p>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="mt-3 w-full rounded-xl border px-3 py-2 font-bold"
        aria-label={`${role.name} label`}
      />
      <div className="mt-4 space-y-2">
        {permissions.map((permission: any) => (
          <label
            key={permission.id}
            className="flex items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              checked={selected.includes(permission.id)}
              onChange={() => toggle(permission.id)}
            />
            {permission.label}
          </label>
        ))}
      </div>
      <button
        onClick={() => save({ id: role.id, label, permissionIds: selected })}
        className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-2 font-bold text-white"
      >
        Save role
      </button>
    </section>
  );
}
function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <ShadTable className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            {headers.map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j} className="max-w-xs">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </ShadTable>
      {!rows.length && (
        <EmptyState
          icon={Database}
          title="No records found"
          description="Records will appear here when they are created."
        />
      )}
    </div>
  );
}
