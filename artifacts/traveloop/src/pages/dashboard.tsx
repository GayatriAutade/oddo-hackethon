import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardStats, useListTrips } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Calendar, Search, ArrowRight, Globe, TrendingUp, Wallet, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";
import { useState } from "react";

const DESTINATION_IMAGES: Record<string, string> = {
  "Paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
  "Tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
  "Bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
  "Barcelona": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80",
  "Rajasthan": "https://images.unsplash.com/photo-1477587458883-47145ed6736c?w=600&q=80",
  "Kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80",
  "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80",
  "Rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
  "default": "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80",
};

function getTripImage(trip: { coverPhotoUrl?: string | null; name?: string }) {
  if (trip.coverPhotoUrl) return trip.coverPhotoUrl;
  const key = Object.keys(DESTINATION_IMAGES).find(k => trip.name?.toLowerCase().includes(k.toLowerCase()));
  return key ? DESTINATION_IMAGES[key] : DESTINATION_IMAGES.default;
}

function getBudgetLabel(cost: number) {
  if (cost <= 60) return { label: "Low", symbol: "₹", color: "text-green-600" };
  if (cost <= 150) return { label: "Mid", symbol: "₹₹", color: "text-amber-600" };
  return { label: "Expensive", symbol: "₹₹₹", color: "text-red-500" };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetDashboardStats();
  const [recPage, setRecPage] = useState(0);

  const popular = stats?.popularDestinations ?? [];
  const visibleRec = popular.slice(recPage * 3, recPage * 3 + 3);
  const canPrev = recPage > 0;
  const canNext = (recPage + 1) * 3 < popular.length;

  const recentTrips = stats?.recentTrips ?? [];

  return (
    <AppLayout>
      <div className="flex h-full min-h-screen">
        {/* Main content */}
        <div className="flex-1 min-w-0 p-6 overflow-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(" ")[0] || "Traveler"}!
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Ready for your next adventure?</p>
            </div>
            {/* Search */}
            <div className="relative ml-4 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Where to next?"
                className="pl-9 pr-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-52"
              />
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Trips", value: stats?.totalTrips ?? 0, icon: Globe, color: "bg-blue-50 text-blue-600" },
              { label: "Upcoming", value: stats?.upcomingTrips ?? 0, icon: Calendar, color: "bg-amber-50 text-amber-600" },
              { label: "Cities", value: stats?.totalCitiesVisited ?? 0, icon: MapPin, color: "bg-green-50 text-green-600" },
              { label: "Activities", value: stats?.totalActivities ?? 0, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  {isLoading ? <Skeleton className="h-5 w-8 mb-1" /> : <div className="font-bold text-gray-900 text-lg leading-tight">{value}</div>}
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming Trips */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-base">Upcoming Trips</h2>
              <Link href="/trips" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[0, 1].map(i => <Skeleton key={i} className="h-44 rounded-2xl" />)}
              </div>
            ) : recentTrips.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 flex flex-col items-center text-center shadow-sm">
                <Compass className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium text-sm mb-1">No trips yet</p>
                <p className="text-gray-400 text-xs mb-4">Start planning your first adventure</p>
                <Link href="/trips/new">
                  <button className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Plan a Trip
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {recentTrips.slice(0, 4).map((trip) => {
                  const img = getTripImage(trip);
                  const nights = trip.startDate && trip.endDate
                    ? differenceInDays(new Date(trip.endDate), new Date(trip.startDate))
                    : null;
                  return (
                    <Link key={trip.id} href={`/trips/${trip.id}`}>
                      <div className="relative rounded-2xl overflow-hidden h-44 group cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={img}
                          alt={trip.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        {trip.startDate && (
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-md px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                            {format(new Date(trip.startDate), "MMM d")}
                            {trip.endDate ? ` - ${format(new Date(trip.endDate), "MMM d")}` : ""}
                          </div>
                        )}
                        {trip.destinationCount > 0 && (
                          <div className="absolute top-3 right-3 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow">
                            +{trip.destinationCount}
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="font-bold text-white text-base leading-tight line-clamp-1">{trip.name}</h3>
                          {nights !== null && (
                            <p className="text-white/70 text-[11px] mt-0.5">{nights} nights</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommended for You */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-base">Recommended for You</h2>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setRecPage(p => Math.max(0, p - 1))}
                  disabled={!canPrev}
                  className="w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
                </button>
                <button
                  onClick={() => setRecPage(p => p + 1)}
                  disabled={!canNext}
                  className="w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {(visibleRec.length > 0 ? visibleRec : popular.slice(0, 3)).map((dest) => {
                  const img = DESTINATION_IMAGES[dest.name as keyof typeof DESTINATION_IMAGES] || dest.imageUrl || DESTINATION_IMAGES.default;
                  const budget = getBudgetLabel(dest.avgDailyCostUsd ?? 100);
                  return (
                    <Link key={dest.name} href="/explore">
                      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="h-28 overflow-hidden">
                          <img src={img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-2.5">
                          <div className="font-semibold text-gray-900 text-sm leading-tight">{dest.name}, {dest.country}</div>
                          <div className={`text-xs mt-0.5 flex items-center gap-1 ${budget.color} font-medium`}>
                            <Wallet className="h-3 w-3" />
                            {budget.symbol} - {budget.label}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-56 flex-shrink-0 p-4 space-y-4 overflow-auto border-l border-gray-100 bg-white/50">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/trips/new">
                <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                  Plan New Trip
                </button>
              </Link>
              <Link href="/explore">
                <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs py-2.5 rounded-lg border border-gray-200 shadow-sm transition-colors">
                  <Globe className="h-3.5 w-3.5" />
                  Browse Community
                </button>
              </Link>
            </div>
          </div>

          {/* Budget Overview */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Budget Overview</h3>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-3" />
            ) : (
              <div className="text-2xl font-bold text-gray-900 mb-3">
                ₹{((stats?.totalBudgetPlanned ?? 0) * 84).toLocaleString("en-IN") || "0"}
              </div>
            )}
            <div className="space-y-2.5">
              {[
                { label: "Low Budget", sub: "(Backpacker)", range: "₹15,000 – 25,000", pct: 35, color: "bg-green-400" },
                { label: "Mid-Range", sub: "(Comfort)", range: "₹40,000 – 60,000", pct: 65, color: "bg-primary" },
                { label: "Luxury", sub: "(Palatial)", range: "₹1,00,000+", pct: 100, color: "bg-purple-400" },
              ].map(({ label, sub, range, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <span className="text-[11px] font-semibold text-gray-700">{label}</span>
                      <span className="text-[10px] text-gray-400 ml-0.5">{sub}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">{range}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Stats */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Your Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Countries visited</span>
                <span className="font-bold text-gray-900">{isLoading ? "—" : stats?.totalCitiesVisited ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Activities planned</span>
                <span className="font-bold text-gray-900">{isLoading ? "—" : stats?.totalActivities ?? 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Trips upcoming</span>
                <span className="font-bold text-primary">{isLoading ? "—" : stats?.upcomingTrips ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
