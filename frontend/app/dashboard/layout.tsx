"use client";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CalendarRange,
  CreditCard,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Star,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@/types";
import { Logo } from "@/components/shared/logo";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/api";
import { ThemeToggle } from "@/components/shared/theme-toggle";
type NavItem = { icon: LucideIcon; name: string; href: string };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [user] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("staynest_user");
    return raw ? JSON.parse(raw) : null;
  });
  useEffect(() => {
    if (!localStorage.getItem("staynest_token")) router.replace("/login");
  }, [router]);
  const manager = user?.role === "manager" || user?.role === "admin";
  const links: NavItem[] = [
    { icon: LayoutDashboard, name: "Overview", href: "/dashboard" },
    { icon: CalendarDays, name: "Bookings", href: "/dashboard/bookings" },
    { icon: Heart, name: "Favourites", href: "/dashboard/favourites" },
    { icon: MessageSquare, name: "Messages", href: "/dashboard/messages" },
    ...(manager
      ? [
          { icon: Home, name: "Properties", href: "/dashboard/properties" },
          {
            icon: CalendarRange,
            name: "Calendar",
            href: "/dashboard/calendar",
          },
          { icon: Users, name: "Guests", href: "/dashboard/guests" },
          { icon: CreditCard, name: "Payments", href: "/dashboard/payments" },
          { icon: BarChart3, name: "Analytics", href: "/dashboard/analytics" },
        ]
      : []),
    { icon: Star, name: "Reviews", href: "/dashboard/reviews" },
    ...(user?.role === "admin"
      ? [
          {
            icon: ShieldCheck,
            name: "Administration",
            href: "/dashboard/admin",
          },
        ]
      : []),
    { icon: Bell, name: "Notifications", href: "/dashboard/notifications" },
    { icon: UserRound, name: "Profile", href: "/dashboard/profile" },
    { icon: Settings, name: "Security", href: "/dashboard/settings" },
  ];
  const logout = () => {
    localStorage.clear();
    document.cookie = "staynest_session=; path=/; max-age=0";
    document.cookie = "staynest_role=; path=/; max-age=0";
    router.push("/login");
  };
  const navigation = (
    <>
      {links.map(({ icon: Icon, name, href }) => {
        const active =
          href === "/dashboard" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium",
              active
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon size={18} />
            {name}
          </Link>
        );
      })}
    </>
  );
  const pageName =
    links.find((item) =>
      item.href === "/dashboard"
        ? path === item.href
        : path.startsWith(item.href),
    )?.name ?? "Dashboard";
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#142638] px-4 py-5 text-white lg:flex">
        <Logo inverse className="px-2" />
        <p className="mb-2 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500">
          Workspace
        </p>
        <nav className="space-y-1 overflow-y-auto">{navigation}</nav>
        <button
          onClick={logout}
          className="mt-auto flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open dashboard navigation"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#142638] text-white">
              <SheetTitle>
                <Logo inverse />
              </SheetTitle>
              <nav className="mt-8 space-y-1">{navigation}</nav>
            </SheetContent>
          </Sheet>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{pageName}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              {manager
                ? "Property management workspace"
                : "Your StayNest account"}
            </p>
          </div>
          <ThemeToggle />
          <Link
            href="/dashboard/notifications"
            className="relative grid size-9 place-items-center rounded-lg hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-1.5">
                <Avatar
                  src={user?.avatar_path}
                  name={user?.name ?? "StayNest user"}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <span className="block text-foreground">{user?.name}</span>
                <span className="font-normal">{user?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => router.push("/dashboard/profile")}
              >
                <UserRound size={16} />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={logout} className="text-destructive">
                <LogOut size={16} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 pb-24 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      {!manager && (
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
          {[
            { icon: Search, name: "Explore", href: "/properties" },
            { icon: Heart, name: "Saved", href: "/dashboard/favourites" },
            { icon: CalendarDays, name: "Trips", href: "/dashboard/bookings" },
            {
              icon: MessageSquare,
              name: "Messages",
              href: "/dashboard/messages",
            },
            { icon: UserRound, name: "Profile", href: "/dashboard/profile" },
          ].map(({ icon: Icon, name, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium",
                path.startsWith(href)
                  ? "text-secondary-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Icon size={19} />
              {name}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
