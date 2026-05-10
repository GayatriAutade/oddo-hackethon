import { useListPublicTrips, useCopyTrip, getListTripsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, MapPin, Calendar, Copy, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { format } from "date-fns";

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
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold font-sans tracking-tight">Explore</h1>
          <p className="text-muted-foreground mt-1">Discover trips shared by the Traveloop community</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : trips?.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed rounded-xl">
            <Globe className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No public trips yet</h3>
            <p className="text-muted-foreground">Be the first to share a trip with the community!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips?.map((trip) => (
              <Card key={trip.id} className="overflow-hidden group hover-elevate transition-all">
                <div className="h-48 bg-muted relative overflow-hidden">
                  {trip.coverPhotoUrl ? (
                    <img
                      src={trip.coverPhotoUrl}
                      alt={trip.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <Globe className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground">
                    Community
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg leading-tight line-clamp-1">{trip.name}</h3>
                  {trip.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{trip.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                    {trip.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(trip.startDate), "MMM yyyy")}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {(trip as any).destinationCount ?? 0} cities
                    </span>
                    {(trip as any).ownerName && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {(trip as any).ownerName}
                      </span>
                    )}
                  </div>
                  <Button
                    className="w-full mt-4 gap-2"
                    variant="outline"
                    onClick={() => handleCopy(trip.id, trip.name ?? "Trip")}
                    disabled={copyTrip.isPending}
                  >
                    <Copy className="h-4 w-4" />
                    Copy to my trips
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
