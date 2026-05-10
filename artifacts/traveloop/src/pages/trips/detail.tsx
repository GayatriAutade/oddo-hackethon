import { useParams, Link } from "wouter";
import { useGetTrip, useDeleteTrip, getListTripsQueryKey, getGetTripQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Edit, Map, DollarSign, Package, BookOpen,
  MapPin, Calendar, Globe, Trash2, Activity, Clock
} from "lucide-react";
import { useLocation } from "wouter";
import { format, differenceInDays } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const tripId = parseInt(id, 10);
  const { data: trip, isLoading } = useGetTrip(tripId, { query: { queryKey: getGetTripQueryKey(tripId), enabled: !!tripId } });
  const deleteTrip = useDeleteTrip();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm(`Delete "${trip?.name}"? This cannot be undone.`)) return;
    await deleteTrip.mutateAsync({ id: tripId });
    queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
    toast({ title: "Trip deleted" });
    setLocation("/trips");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-56 w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!trip) {
    return (
      <AppLayout>
        <div className="p-6 text-center py-24">
          <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Trip not found</h2>
          <Link href="/trips">
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold">Back to trips</button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const nights = trip.startDate && trip.endDate
    ? differenceInDays(new Date(trip.endDate), new Date(trip.startDate))
    : null;

  const navTabs = [
    { label: "Itinerary", href: `/trips/${tripId}/itinerary`, icon: Map, color: "text-blue-600 bg-blue-50" },
    { label: "Budget", href: `/trips/${tripId}/budget`, icon: DollarSign, color: "text-green-600 bg-green-50" },
    { label: "Packing", href: `/trips/${tripId}/packing`, icon: Package, color: "text-amber-600 bg-amber-50" },
    { label: "Notes", href: `/trips/${tripId}/notes`, icon: BookOpen, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-5 max-w-3xl">
        {/* Back */}
        <div className="flex items-center gap-2">
          <Link href="/trips">
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">
              <ArrowLeft className="h-4 w-4" />
              My Trips
            </button>
          </Link>
        </div>

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden h-56 bg-gray-200">
          {trip.coverPhotoUrl ? (
            <img src={trip.coverPhotoUrl} alt={trip.name ?? "Trip"} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-orange-100">
              <Globe className="h-16 w-16 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            {trip.isPublic && (
              <span className="text-[10px] font-bold text-white bg-primary/80 px-2 py-0.5 rounded-md mb-2 inline-block">Public</span>
            )}
            <h1 className="text-3xl font-bold text-white leading-tight">{trip.name}</h1>
            {trip.description && <p className="text-white/75 text-sm mt-0.5 line-clamp-1">{trip.description}</p>}
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Link href={`/trips/${tripId}/edit`}>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </button>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteTrip.isPending}
              className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Cities", value: trip.stops?.length ?? 0, icon: MapPin },
            { label: "Activities", value: trip.stops?.reduce((sum, s) => sum + (s.activities?.length ?? 0), 0) ?? 0, icon: Activity },
            { label: "Start", value: trip.startDate ? format(new Date(trip.startDate), "MMM d") : "—", icon: Calendar },
            { label: nights !== null ? `${nights} nights` : "Duration", value: trip.endDate ? format(new Date(trip.endDate), "MMM d") : "—", icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 text-center">
              <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <div className="font-bold text-gray-900 text-lg leading-tight">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Navigation tabs */}
        <div className="grid grid-cols-4 gap-3">
          {navTabs.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group text-center">
                <div className={`w-10 h-10 rounded-lg ${tab.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform`}>
                  <tab.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">{tab.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Stops */}
        {trip.stops && trip.stops.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-base">Stops</h2>
              <Link href={`/trips/${tripId}/itinerary`}>
                <button className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                  <Map className="h-3 w-3" /> Edit Itinerary
                </button>
              </Link>
            </div>
            <div className="space-y-2.5">
              {trip.stops.map((stop, i) => (
                <div key={stop.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4 items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm">
                    {i + 1}
                  </div>
                  {stop.imageUrl && (
                    <img src={stop.imageUrl} alt={stop.cityName ?? "City"} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900">{stop.cityName}</div>
                    <div className="text-sm text-gray-500">{stop.country}</div>
                    {(stop.arrivalDate || stop.departureDate) && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {stop.arrivalDate && format(new Date(stop.arrivalDate), "MMM d")}
                        {stop.arrivalDate && stop.departureDate && " — "}
                        {stop.departureDate && format(new Date(stop.departureDate), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                  {stop.activities && stop.activities.length > 0 && (
                    <div className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex-shrink-0">
                      {stop.activities.length} activities
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
