import { useListPublicTrips, useCopyTrip, getListTripsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, MapPin, Calendar, Copy, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { format } from "date-fns";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
  "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80",
  "https://images.unsplash.com/photo-1477587458883-47145ed6736c?w=600&q=80",
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80",
];

export default function Explore() {
  const { data: trips, isLoading } = useListPublicTrips();
  const copyTrip = useCopyTrip();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleCopy = async (tripId: number, tripName: string) => {
    try {
      const newTrip = await copyTrip.mutateAsync({ id: tripId });
      queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
      toast({ title: "Trip copied!", description: `"${tripName}" has been added to your trips` });
      setLocation(`/trips/${newTrip.id}`);
    } catch {
      toast({ title: "Error", description: "Failed to copy trip", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
            <p className="text-gray-500 text-sm mt-0.5">Explore trips shared by the Traveloop community</p>
          </div>
          <div className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm font-medium">
            {isLoading ? "—" : `${trips?.length ?? 0} trips available`}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : trips?.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
            <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No public trips yet</h3>
            <p className="text-gray-500 text-sm">Be the first to share a trip with the community!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips?.map((trip, i) => {
              const img = trip.coverPhotoUrl || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
              return (
                <div key={trip.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={img}
                      alt={trip.name ?? "Trip"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Community
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-bold text-white text-base leading-tight line-clamp-1">{trip.name}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {trip.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{trip.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      {trip.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(trip.startDate), "MMM yyyy")}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" />
                        {(trip as any).destinationCount ?? 0} cities
                      </span>
                      {(trip as any).ownerName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {(trip as any).ownerName}
                        </span>
                      )}
                    </div>
                    <button
                      className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-primary hover:text-primary text-gray-600 font-semibold text-xs py-2.5 rounded-lg transition-colors"
                      onClick={() => handleCopy(trip.id, trip.name ?? "Trip")}
                      disabled={copyTrip.isPending}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy to my trips
                    </button>
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
