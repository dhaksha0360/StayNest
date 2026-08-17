"use client";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  Headphones,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/layout/footer";
import { PropertyCard } from "@/components/property-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { api, cn } from "@/lib/api";
import type { ApiResponse, Paginated, Property } from "@/types";
import { mockProperties } from "@/lib/mock-properties";

const destinations = [
  [
    "Galle",
    "Coastal heritage",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  ],
  [
    "Colombo",
    "City escapes",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  ],
  [
    "Nuwara Eliya",
    "Highland calm",
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80",
  ],
];

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => {
      try {
        const properties = (
        await api.get<ApiResponse<Paginated<Property>>>(
          "/properties?per_page=6",
        )
        ).data.data.data;
        return properties.length ? properties : mockProperties;
      } catch {
        return mockProperties;
      }
    },
  });
  return (
    <>
      <Navbar />
      <main>
        <section className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto min-h-[650px] max-w-[1500px] overflow-hidden rounded-2xl bg-primary text-white sm:min-h-[680px]">
            <Image
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=88"
              alt="Oceanfront StayNest villa"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c2034]/95 via-[#0c2034]/65 to-transparent" />
            <div className="relative flex min-h-[650px] max-w-3xl flex-col justify-center px-6 py-16 sm:min-h-[680px] sm:px-12 lg:px-20">
              <span className="flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur">
                <Sparkles size={14} className="text-teal-300" /> Curated homes.
                Genuine hospitality.
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-.04em] sm:text-6xl lg:text-7xl">
                Find a place that feels like home.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                Discover carefully selected stays, transparent pricing, and
                attentive hosts for journeys worth remembering.
              </p>
              <form
                action="/properties"
                className="mt-9 grid overflow-hidden rounded-xl bg-white p-2 text-foreground shadow-xl sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_.7fr_auto]"
              >
                <label className="flex min-w-0 items-center gap-3 px-3 py-2">
                  <MapPin
                    size={18}
                    className="shrink-0 text-secondary-foreground"
                  />
                  <span className="min-w-0">
                    <small className="block text-[11px] font-semibold text-muted-foreground">
                      Where
                    </small>
                    <input
                      name="search"
                      placeholder="Search destinations"
                      className="w-full truncate bg-transparent text-sm font-medium"
                    />
                  </span>
                </label>
                <label className="border-t px-3 py-2 sm:border-l sm:border-t-0">
                  <small className="block text-[11px] font-semibold text-muted-foreground">
                    Check in
                  </small>
                  <input
                    type="date"
                    name="check_in"
                    className="w-full bg-transparent text-sm font-medium"
                  />
                </label>
                <label className="border-t px-3 py-2 sm:border-l sm:border-t-0">
                  <small className="block text-[11px] font-semibold text-muted-foreground">
                    Check out
                  </small>
                  <input
                    type="date"
                    name="check_out"
                    className="w-full bg-transparent text-sm font-medium"
                  />
                </label>
                <label className="flex items-center gap-2 border-t px-3 py-2 sm:border-l sm:border-t-0">
                  <Users size={16} className="text-muted-foreground" />
                  <span>
                    <small className="block text-[11px] font-semibold text-muted-foreground">
                      Guests
                    </small>
                    <input
                      type="number"
                      min="1"
                      defaultValue="2"
                      name="guests"
                      className="w-14 bg-transparent text-sm font-medium"
                    />
                  </span>
                </label>
                <Button size="lg" className="h-full min-h-12">
                  <Search size={17} />
                  Search
                </Button>
              </form>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-200">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} />
                  Secure payments
                </span>
                <span className="flex items-center gap-2">
                  <Star size={15} />
                  Verified stays
                </span>
                <span className="flex items-center gap-2">
                  <Headphones size={15} />
                  Guest support
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-secondary-foreground">
                Handpicked stays
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Places worth travelling for
              </h2>
              <p className="mt-2 text-muted-foreground">
                Distinctive homes selected for comfort, character, and trusted
                hosting.
              </p>
            </div>
            <Link
              href="/properties"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "hidden sm:inline-flex",
              )}
            >
              Explore all <ArrowRight size={16} />
            </Link>
          </div>
          {isLoading ? (
            <div className="mt-9 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((x) => (
                <div key={x}>
                  <Skeleton className="aspect-[4/3] rounded-xl" />
                  <Skeleton className="mt-3 h-5 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : data?.length ? (
            <div className="mt-9 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="mt-9">
              <EmptyState
                icon={CalendarDays}
                title="New stays are on the way"
                description="Our managers are preparing fresh properties for your next trip."
                action="Browse all properties"
                href="/properties"
              />
            </div>
          )}
        </section>
        <section className="border-y bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-secondary-foreground">
                  Explore Sri Lanka
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Popular destinations
                </h2>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {destinations.map(([name, subtitle, src]) => (
                <Link
                  href={`/properties?search=${encodeURIComponent(name)}`}
                  key={name}
                  className="group relative aspect-[5/3] overflow-hidden rounded-xl"
                >
                  <Image
                    src={src}
                    alt={name}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  <div className="absolute bottom-0 p-5 text-white">
                    <h3 className="text-xl font-semibold">{name}</h3>
                    <p className="text-sm text-slate-200">{subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8 lg:py-24">
          {[
            [
              ShieldCheck,
              "Book with confidence",
              "Server-verified availability, secure payments, and clear policies before you reserve.",
            ],
            [
              Star,
              "Quality stays",
              "Homes with thoughtful details, trusted managers, and honest guest feedback.",
            ],
            [
              Headphones,
              "Here when it matters",
              "Direct host messaging and responsive support throughout your journey.",
            ],
          ].map(([Icon, title, text]) => (
            <article key={title as string} className="p-4">
              <span className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <Icon size={19} />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{title as string}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {text as string}
              </p>
            </article>
          ))}
        </section>
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl bg-primary px-7 py-10 text-white sm:flex-row sm:items-center sm:px-10">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Your next stay is closer than you think.
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Browse verified homes and book with confidence.
              </p>
            </div>
            <Link
              href="/properties"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              Find your stay <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
