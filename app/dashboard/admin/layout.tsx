import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const links = [
    ["Users", "users"],
    ["Roles", "roles"],
    ["Properties", "properties"],
    ["Bookings", "bookings"],
    ["Payments", "payments"],
    ["Reviews", "reviews"],
    ["Contact inbox", "contacts"],
    ["Activity logs", "activity-logs"],
    ["Platform settings", "settings"],
  ];
  return (
    <>
      <div className="mb-6">
        <PageHeader
          eyebrow="Administration"
          title="Platform control centre"
          description="Manage people, inventory, transactions, trust, and platform configuration."
        />
        <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl border bg-card p-1.5">
          {links.map(([n, h]) => (
            <Link
              key={h}
              href={`/dashboard/admin/${h}`}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {n}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </>
  );
}
