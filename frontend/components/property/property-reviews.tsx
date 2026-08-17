"use client";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
export function PropertyReviews({
  propertyId,
  rating,
  count,
}: {
  propertyId: number;
  rating: number;
  count: number;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["property-reviews", propertyId],
    queryFn: async () =>
      (await api.get(`/properties/${propertyId}/reviews`)).data.data,
  });
  const reviews = data?.data ?? [];
  const dimensions = ["cleanliness", "location", "communication", "value"];
  return (
    <section className="border-t py-8">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <Star size={19} className="fill-amber-400 text-amber-400" />
        {rating.toFixed(1)} · {count} reviews
      </h2>
      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {dimensions.map((key) => {
              const average = reviews.length
                ? reviews.reduce(
                    (sum: number, r: any) => sum + Number(r[key] ?? 0),
                    0,
                  ) / reviews.length
                : rating;
              return (
                <div
                  key={key}
                  className="grid grid-cols-[120px_1fr_32px] items-center gap-3 text-sm"
                >
                  <span className="capitalize text-muted-foreground">
                    {key}
                  </span>
                  <Progress value={average * 20} />
                  <span className="text-xs font-medium">
                    {average.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {reviews.slice(0, 6).map((review: any) => (
              <article key={review.id}>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={review.user?.avatar_path}
                    name={review.user?.name ?? "Guest"}
                  />
                  <div>
                    <p className="text-sm font-semibold">{review.user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Verified StayNest guest
                    </p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-4 text-sm leading-6 text-muted-foreground">
                  {review.review}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
