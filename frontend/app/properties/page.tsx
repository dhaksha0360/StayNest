"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/layout/footer";
import { PropertyCard } from "@/components/property-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { ApiResponse, Paginated, Property } from "@/types";

type Amenity = { id: number; name: string };
function FilterPanel({
  amenities,
  values,
}: {
  amenities: Amenity[];
  values: URLSearchParams;
}) {
  return (
    <form className="space-y-6">
      <div>
        <Label htmlFor="search">Destination or property</Label>
        <Input
          id="search"
          name="search"
          defaultValue={values.get("search") ?? ""}
          placeholder="e.g. Galle"
          className="mt-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="check_in">Check in</Label>
          <Input
            id="check_in"
            type="date"
            name="check_in"
            defaultValue={values.get("check_in") ?? ""}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="check_out">Check out</Label>
          <Input
            id="check_out"
            type="date"
            name="check_out"
            defaultValue={values.get("check_out") ?? ""}
            className="mt-2"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="guests">Guests</Label>
          <Input
            id="guests"
            type="number"
            min="1"
            name="guests"
            defaultValue={values.get("guests") ?? ""}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min="0"
            name="bedrooms"
            defaultValue={values.get("bedrooms") ?? ""}
            className="mt-2"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="type">Property type</Label>
        <select
          id="type"
          name="type"
          defaultValue={values.get("type") ?? ""}
          className="mt-2 h-10 w-full rounded-lg border bg-card px-3 text-sm"
        >
          <option value="">Any type</option>
          {["apartment", "house", "villa", "cottage", "lodge", "townhouse"].map(
            (x) => (
              <option key={x} value={x}>
                {x[0].toUpperCase() + x.slice(1)}
              </option>
            ),
          )}
        </select>
      </div>
      <div>
        <Label>Price per night</Label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Input
            type="number"
            name="min_price"
            placeholder="Minimum"
            defaultValue={values.get("min_price") ?? ""}
          />
          <Input
            type="number"
            name="max_price"
            placeholder="Maximum"
            defaultValue={values.get("max_price") ?? ""}
          />
        </div>
      </div>
      <fieldset>
        <legend className="text-sm font-medium">Amenities</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {amenities.map((a) => (
            <label
              key={a.id}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <input
                type="checkbox"
                name="amenities[]"
                value={a.id}
                defaultChecked={values
                  .getAll("amenities[]")
                  .includes(String(a.id))}
                className="size-4 rounded border-input accent-teal-700"
              />
              {a.name}
            </label>
          ))}
        </div>
      </fieldset>
      <Button className="w-full">
        <SlidersHorizontal size={16} />
        Apply filters
      </Button>
    </form>
  );
}

function Results() {
  const sp = useSearchParams();
  const router = useRouter();
  const [sort, setSort] = useState(sp.get("sort") ?? "recommended");
  const query = new URLSearchParams(sp);
  query.set("sort", sort);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["properties", query.toString()],
    queryFn: async () =>
      (await api.get<ApiResponse<Paginated<Property>>>(`/properties?${query}`))
        .data.data,
  });
  const { data: amenities = [] } = useQuery<Amenity[]>({
    queryKey: ["amenities"],
    queryFn: async () => (await api.get("/amenities")).data.data,
  });
  const active = Array.from(sp.entries()).filter(
    ([key, value]) => value && !["page", "sort"].includes(key),
  );
  const remove = (key: string, value: string) => {
    const q = new URLSearchParams(sp);
    if (key === "amenities[]") q.delete(key, value);
    else q.delete(key);
    router.push(`/properties?${q}`);
  };
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 border-b pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-secondary-foreground">
              Explore stays
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Properties you’ll love
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data?.total ?? "—"} verified homes available to explore
            </p>
          </div>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal size={16} />
                  Filters
                  {active.length > 0 && (
                    <Badge variant="secondary">{active.length}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetTitle className="text-lg font-semibold">
                  Filter properties
                </SheetTitle>
                <div className="mt-7">
                  <FilterPanel amenities={amenities} values={sp} />
                </div>
              </SheetContent>
            </Sheet>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-lg border bg-card px-3 text-sm font-medium"
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
        {active.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-4">
            <span className="text-xs font-medium text-muted-foreground">
              Active filters
            </span>
            {active.map(([key, value]) => (
              <button
                key={`${key}-${value}`}
                onClick={() => remove(key, value)}
              >
                <Badge variant="outline" className="gap-1 py-1">
                  {key.replaceAll("_", " ")}: {value}
                  <X size={12} />
                </Badge>
              </button>
            ))}
            <button
              onClick={() => router.push("/properties")}
              className="text-xs font-medium text-secondary-foreground"
            >
              Clear all
            </button>
          </div>
        )}
        <div className="mt-6 grid gap-8 lg:grid-cols-[250px_1fr]">
          <aside className="hidden h-fit rounded-xl border bg-card p-5 lg:block">
            <div className="mb-5 flex items-center gap-2 font-semibold">
              <SlidersHorizontal size={17} />
              Filters
            </div>
            <FilterPanel amenities={amenities} values={sp} />
          </aside>
          <section>
            {isLoading ? (
              <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((x) => (
                  <div key={x}>
                    <Skeleton className="aspect-[4/3] rounded-xl" />
                    <Skeleton className="mt-3 h-5 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                <h2 className="font-semibold text-red-800">
                  We couldn’t load these properties
                </h2>
                <p className="mt-1 text-sm text-red-700">
                  Please check your connection and try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="mt-4"
                >
                  Try again
                </Button>
              </div>
            ) : data?.data.length ? (
              <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {data.data.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title="No stays match those filters"
                description="Try changing your dates, destination, or price range."
                action="Clear filters"
                href="/properties"
              />
            )}
            {data && data.last_page > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  disabled={data.current_page === 1}
                  onClick={() => {
                    const q = new URLSearchParams(sp);
                    q.set("page", String(data.current_page - 1));
                    router.push(`/properties?${q}`);
                  }}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page{" "}
                  <strong className="text-foreground">
                    {data.current_page}
                  </strong>{" "}
                  of {data.last_page}
                </span>
                <Button
                  variant="outline"
                  disabled={data.current_page === data.last_page}
                  onClick={() => {
                    const q = new URLSearchParams(sp);
                    q.set("page", String(data.current_page + 1));
                    router.push(`/properties?${q}`);
                  }}
                >
                  Next
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
export default function Page() {
  return (
    <Suspense>
      <Results />
    </Suspense>
  );
}
