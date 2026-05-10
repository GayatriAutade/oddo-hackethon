import { useListTrips, useDeleteTrip, getListTripsQueryKey, Trip } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MapPin, Calendar, Trash2, Edit, Compass } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80",
  "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80",
];

export default function Trips() {
  const { data: trips, isLoading } = useListTrips();
  const deleteTrip = useDeleteTrip();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (trip: Trip) => {
    if (!confirm(`Delete "${trip.name}"? This cannot be undone.`)) return;
    setDeleting(trip.id);
    try {
      await deleteTrip.mutateAsync({ id: trip.id });
      queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isLoading ? "" : `${trips?.length ?? 0} trip${trips?.length === 1 ? "" : "s"} planned`}
            </p>
          </div>
          <Link href="/trips/new">
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors">
              <Plus className="h-4 w-4" />
              New Trip
            </button>
          </Link>
        </div>

        {/* Trip grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : trips?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
            <Compass className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No trips yet</h3>
            <p className="text-gray-500 text-sm mb-5 max-w-xs">
              Start planning your first adventure. The world is waiting.
            </p>
            <Link href="/trips/new">
              <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors">
                <Plus className="h-4 w-4" />
                Create your first trip
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips?.map((trip, i) => {
              const img = trip.coverPhotoUrl || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
              return (
                <div key={trip.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div
                    className="relative h-44 cursor-pointer overflow-hidden"
                    onClick={() => setLocation(`/trips/${trip.id}`)}
                  >
                    <img
                      src={img}
                      alt={trip.name ?? "Trip"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {trip.isPublic && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 px-2 py-0.5 rounded-md">
                        Public
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-bold text-white text-base leading-tight line-clamp-1">{trip.name}</h3>
                      {trip.startDate && (
                        <p className="text-white/70 text-xs mt-0.5">
                          {format(new Date(trip.startDate), "MMM d, yyyy")}
                          {trip.endDate ? ` → ${format(new Date(trip.endDate), "MMM d")}` : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" />
                        {trip.destinationCount ?? 0} cities
                      </span>
                      {trip.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(trip.startDate), "MMM yyyy")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setLocation(`/trips/${trip.id}`)}
                        className="text-xs font-semibold text-primary hover:underline px-2 py-1"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setLocation(`/trips/${trip.id}/edit`)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(trip)}
                        disabled={deleting === trip.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
