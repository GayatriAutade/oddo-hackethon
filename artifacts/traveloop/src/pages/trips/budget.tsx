import { useParams, Link } from "wouter";
import { useGetTrip, useGetTripBudget, getGetTripQueryKey, getGetTripBudgetQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, DollarSign, TrendingUp, MapPin } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#c2643f", "#2d4a3e", "#b8975a", "#4a7c6e", "#d4a853", "#8b5e52", "#6b9080", "#c9a96e"];

export default function Budget() {
  const { id } = useParams<{ id: string }>();
  const tripId = parseInt(id, 10);
  const { data: trip } = useGetTrip(tripId, { query: { queryKey: getGetTripQueryKey(tripId), enabled: !!tripId } });
  const { data: budget, isLoading } = useGetTripBudget(tripId, { query: { queryKey: getGetTripBudgetQueryKey(tripId), enabled: !!tripId } });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-72" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/trips/${tripId}`}>
            <Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-sans tracking-tight">{trip?.name}</h1>
            <p className="text-muted-foreground text-sm">Budget Breakdown</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Budget</p>
                <p className="text-2xl font-bold">${budget?.total?.toLocaleString() ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Per Day</p>
                <p className="text-2xl font-bold">{budget?.perDay ? `$${budget.perDay.toFixed(0)}` : "—"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Cities</p>
                <p className="text-2xl font-bold">{budget?.byCity?.length ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {budget && (budget.byCity.length > 0 || budget.byCategory.length > 0) ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By City Bar Chart */}
            {budget.byCity.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Budget by City</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={budget.byCity} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="cityName" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Budget"]} />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* By Category Pie Chart */}
            {budget.byCategory.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Budget by Category</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={budget.byCategory}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {budget.byCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Amount"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* City Breakdown Table */}
            {budget.byCity.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-base">City Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {budget.byCity.map((city) => (
                      <div key={city.cityName} className="flex items-center gap-4">
                        <span className="text-sm font-medium w-32 truncate">{city.cityName}</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${budget.total > 0 ? (city.amount / budget.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-right w-20">${city.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <DollarSign className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No budget data yet</h3>
            <p className="text-muted-foreground mb-4">Add activities with costs to see your budget breakdown</p>
            <Link href={`/trips/${tripId}/itinerary`}>
              <Button>Build your itinerary</Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
