"use client";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/ui/button";
export default function Reviews() {
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("staynest_user") || "{}")
      : {};
  const manager = user.role === "manager" || user.role === "admin";
  const { data, isLoading } = useQuery({
    queryKey: ["reviews", manager],
    queryFn: async () =>
      (
        await api.get(
          manager ? "/management/reviews" : "/bookings?status=checked_out",
        )
      ).data.data,
  });
  if (!manager)
    return (
      <>
        <PageHeader
          eyebrow="Feedback"
          title="Your reviews"
          description="Review eligible completed stays or revisit your published feedback."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {isLoading
            ? [1, 2].map((x) => (
                <Skeleton key={x} className="h-40 rounded-xl" />
              ))
            : data?.data?.map((b: any) => (
                <Card key={b.id}>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold">{b.property.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Stayed {b.check_in} → {b.check_out}
                    </p>
                    <Link
                      href={`/dashboard/bookings/${b.id}`}
                      className={buttonVariants({ className: "mt-5" })}
                    >
                      Write or view review
                    </Link>
                  </CardContent>
                </Card>
              ))}
        </div>
        {!isLoading && !data?.data?.length && (
          <div className="mt-8">
            <EmptyState
              icon={Star}
              title="No stays to review"
              description="Reviews become available after you complete a stay."
            />
          </div>
        )}
      </>
    );
  return (
    <>
      <PageHeader
        eyebrow="Reputation"
        title="Guest reviews"
        description="Feedback from verified completed stays."
      />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {isLoading
          ? [1, 2].map((x) => <Skeleton key={x} className="h-48 rounded-xl" />)
          : data?.data?.map((r: any) => (
              <Card key={r.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.user.name} />
                      <div>
                        <b className="text-sm font-semibold">{r.user.name}</b>
                        <p className="text-xs text-muted-foreground">
                          {r.property.name}
                        </p>
                      </div>
                    </div>
                    <span className="flex gap-1 font-black">
                      <Star
                        className="fill-amber-400 text-amber-400"
                        size={18}
                      />
                      {r.overall}
                    </span>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    {r.review}
                  </p>
                  <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs">
                    <span>
                      Cleanliness
                      <br />
                      <b>{r.cleanliness}/5</b>
                    </span>
                    <span>
                      Location
                      <br />
                      <b>{r.location}/5</b>
                    </span>
                    <span>
                      Communication
                      <br />
                      <b>{r.communication}/5</b>
                    </span>
                    <span>
                      Value
                      <br />
                      <b>{r.value}/5</b>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </>
  );
}
