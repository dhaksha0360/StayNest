"use client";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  Heart,
  LogOut,
  Menu,
  MessageSquare,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@/types";
import { Logo } from "@/components/shared/logo";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { ThemeToggle } from "@/components/shared/theme-toggle";

const mainLinks = [
  ["Home", "/"],
  ["Properties", "/properties"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export function Navbar() {
  const router = useRouter();
  const [user] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("staynest_user");
    return raw ? JSON.parse(raw) : null;
  });
  const logout = () => {
    localStorage.clear();
    document.cookie = "staynest_session=; path=/; max-age=0";
    document.cookie = "staynest_role=; path=/; max-age=0";
    router.push("/login");
  };
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {mainLinks.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-1.5 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/dashboard/favourites"
                aria-label="Saved properties"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <Heart size={18} />
              </Link>
              <Link
                href="/dashboard/bookings"
                aria-label="My bookings"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <CalendarDays size={18} />
              </Link>
              <Link
                href="/dashboard/messages"
                aria-label="Messages"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <MessageSquare size={18} />
              </Link>
              <Link
                href="/dashboard/notifications"
                aria-label="Notifications"
                className={buttonVariants({ variant: "ghost", size: "icon" })}
              >
                <Bell size={18} />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-1 h-10 gap-2 px-2">
                    <Avatar src={user.avatar_path} name={user.name} />
                    <span className="max-w-28 truncate">
                      {user.name.split(" ")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push("/dashboard")}>
                    <UserRound size={16} /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={logout}
                    className="text-destructive"
                  >
                    <LogOut size={16} /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                onClick={logout}
                className="ml-1 text-muted-foreground"
              >
                <LogOut size={16} />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost" })}
              >
                Sign in
              </Link>
              <Link href="/register" className={buttonVariants()}>
                Create account
              </Link>
            </>
          )}
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>
                <Logo />
              </SheetTitle>
              <nav className="mt-8 space-y-1">
                {mainLinks.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                  >
                    {label}
                  </Link>
                ))}
                {user &&
                  [
                    ["Saved", "/dashboard/favourites"],
                    ["My bookings", "/dashboard/bookings"],
                    ["Messages", "/dashboard/messages"],
                    ["Dashboard", "/dashboard"],
                  ].map(([label, href]) => (
                    <Link
                      key={label}
                      href={href}
                      className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                    >
                      {label}
                    </Link>
                  ))}
              </nav>
              <div className="mt-8 border-t pt-5">
                {user ? (
                  <Button variant="outline" onClick={logout} className="w-full">
                    <LogOut size={16} /> Sign out
                  </Button>
                ) : (
                  <div className="grid gap-2">
                    <Link
                      href="/login"
                      className={buttonVariants({
                        variant: "outline",
                        className: "w-full",
                      })}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className={buttonVariants({ className: "w-full" })}
                    >
                      Create account
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
