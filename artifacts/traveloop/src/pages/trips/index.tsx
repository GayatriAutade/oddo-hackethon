import { useListTrips, useDeleteTrip, Trip } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Calendar, Globe, Trash2, Edit } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getListTripsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { useState } from "react";

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-sans tracking-tight">My Trips</h1>
            <p className="text-muted-foreground mt-1">
              {isLoading ? "" : `${trips?.length ?? 0} trip${trips?.length === 1 ? "" : "s"} planned`}
            </p>
          </div>
          <Link href="/trips/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Trip
            </Button>
          </Link>
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
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-lg">
            <MapPin className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Start planning your first adventure. The world is waiting.
            </p>
            <Link href="/trips/new">
              <Button>Create your first trip</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips?.map((trip) => (
              <Card key={trip.id} className="overflow-hidden group hover-elevate transition-all cursor-pointer relative">
                <div
                  className="h-48 bg-muted relative overflow-hidden"
                  onClick={() => setLocation(`/trips/${trip.id}`)}
                >
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
                  {trip.isPublic && (
                    <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground">
                      Public
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3
                    className="font-bold text-lg leading-tight line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setLocation(`/trips/${trip.id}`)}
                  >
                    {trip.name}
                  </h3>
                  {trip.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{trip.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    {trip.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(trip.startDate), "MMM d, yyyy")}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {trip.destinationCount ?? 0} cities
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-4 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation(`/trips/${trip.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/trips/${trip.id}/edit`)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(trip)}
                      disabled={deleting === trip.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
