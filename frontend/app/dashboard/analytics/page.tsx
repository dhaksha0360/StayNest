"use client";
import { api, money } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => (await api.get("/management/analytics")).data.data,
  });
  return (
    <>
      <PageHeader
        eyebrow="Performance"
        title="Analytics"
        description="Revenue, reservation volume, and occupied nights from real records."
      />
      {isLoading ? (
        <Skeleton className="mt-6 h-96 rounded-xl" />
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#0d9488"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0d9488"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(x) => money(x).replace(".00", "")} />
                    <Tooltip formatter={(x) => money(Number(x))} />
                    <Area
                      dataKey="revenue"
                      stroke="#0d9488"
                      fill="url(#revenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Bookings and occupied nights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="bookings"
                      fill="#0f172a"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="occupancy_nights"
                      fill="#2dd4bf"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
