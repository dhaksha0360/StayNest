"use client";
import { PropertyCard } from "@/components/property-card";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
export default function Favourites() {
  const { data, isLoading } = useQuery({
    queryKey: ["favourites"],
    queryFn: async () => (await api.get("/favourites")).data.data,
  });
  return (
    <>
      <PageHeader
        eyebrow="Saved"
        title="Favourite stays"
        description={`${data?.data?.length ?? 0} ${data?.data?.length === 1 ? "property" : "properties"} saved for later.`}
      />
      <div className="mt-7 grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? [1, 2, 3].map((x) => (
              <div key={x}>
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="mt-3 h-5 w-3/4" />
              </div>
            ))
          : data?.data?.map((p: any) => (
              <PropertyCard key={p.id} property={p} />
            ))}
      </div>
      {!isLoading && !data?.data?.length && (
        <div className="mt-8">
          <EmptyState
            icon={Heart}
            title="Save properties you love"
            description="Tap the heart on any property and find it here when you’re ready to book."
            action="Explore properties"
            href="/properties"
          />
        </div>
      )}
    </>
  );
}
