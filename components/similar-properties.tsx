"use client";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { PropertyCard } from "./property-card";
import { mockProperties } from "@/lib/mock-properties";
export function SimilarProperties({
  city,
  exclude,
}: {
  city: string;
  exclude: number;
}) {
  const { data } = useQuery({
    queryKey: ["similar", city],
    queryFn: async () => {
      try {
        const properties = (await api.get("/properties", { params: { city, per_page: 4 } })).data.data.data;
        return properties.length ? properties : mockProperties;
      } catch {
        return mockProperties;
      }
    },
  });
  const items = data?.filter((p: any) => p.id !== exclude).slice(0, 3) ?? [];
  if (!items.length) return null;
  return (
    <section className="mt-16 border-t pt-12">
      <h2 className="text-2xl font-semibold tracking-tight">
        Similar stays nearby
      </h2>
      <div className="mt-7 grid gap-6 md:grid-cols-3">
        {items.map((p: any) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </section>
  );
}
