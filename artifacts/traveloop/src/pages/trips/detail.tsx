import { useParams, Link } from "wouter";
import { useGetTrip, useDeleteTrip, getListTripsQueryKey, getGetTripQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Edit, Map, DollarSign, Package, BookOpen,
  MapPin, Calendar, Globe, Trash2, Copy, Clock, Activity
} from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
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
    setLocation("/trips");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!trip) {
    return (
      <AppLayout>
        <div className="text-center py-24">
          <h2 className="text-2xl font-bold">Trip not found</h2>
          <Link href="/trips"><Button className="mt-4">Back to trips</Button></Link>
        </div>
      </AppLayout>
    );
  }

  const navTabs = [
    { label: "Itinerary", href: `/trips/${tripId}/itinerary`, icon: Map },
    { label: "Budget", href: `/trips/${tripId}/budget`, icon: DollarSign },
    { label: "Packing", href: `/trips/${tripId}/packing`, icon: Package },
    { label: "Notes", href: `/trips/${tripId}/notes`, icon: BookOpen },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/trips">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Hero */}
        <div className="relative rounded-xl overflow-hidden h-64 bg-muted">
          {trip.coverPhotoUrl ? (
            <img src={trip.coverPhotoUrl} alt={trip.name} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <Globe className="h-16 w-16 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              {trip.isPublic && <Badge className="bg-white/20 text-white backdrop-blur-sm">Public</Badge>}
            </div>
            <h1 className="text-4xl font-bold text-white font-sans tracking-tight">{trip.name}</h1>
            {trip.description && <p className="text-white/80 mt-1">{trip.description}</p>}
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Link href={`/trips/${tripId}/edit`}>
              <Button size="sm" variant="secondary" className="gap-1.5 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/20">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5"
              onClick={handleDelete}
              disabled={deleteTrip.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Cities</p>
                <p className="text-xl font-bold">{trip.stops?.length ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Activities</p>
                <p className="text-xl font-bold">{trip.stops?.reduce((sum, s) => sum + (s.activities?.length ?? 0), 0) ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Start date</p>
                <p className="text-sm font-semibold">{trip.startDate ? format(new Date(trip.startDate), "MMM d, yyyy") : "—"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">End date</p>
                <p className="text-sm font-semibold">{trip.endDate ? format(new Date(trip.endDate), "MMM d, yyyy") : "—"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {navTabs.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              <Card className="cursor-pointer hover-elevate transition-all hover:border-primary/50 group">
                <CardContent className="p-4 flex items-center gap-3">
                  <tab.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium group-hover:text-primary transition-colors">{tab.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Stops preview */}
        {trip.stops && trip.stops.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold font-sans">Stops</h2>
              <Link href={`/trips/${tripId}/itinerary`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Map className="h-3.5 w-3.5" />
                  Edit Itinerary
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {trip.stops.map((stop, i) => (
                <Card key={stop.id} className="overflow-hidden">
                  <CardContent className="p-4 flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>
                    {stop.imageUrl && (
                      <img src={stop.imageUrl} alt={stop.cityName} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg">{stop.cityName}</h3>
                      <p className="text-sm text-muted-foreground">{stop.country}</p>
                      {(stop.arrivalDate || stop.departureDate) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {stop.arrivalDate && format(new Date(stop.arrivalDate), "MMM d")}
                          {stop.arrivalDate && stop.departureDate && " — "}
                          {stop.departureDate && format(new Date(stop.departureDate), "MMM d, yyyy")}
                        </p>
                      )}
                      {stop.activities && stop.activities.length > 0 && (
                        <p className="text-xs text-primary mt-1 font-medium">{stop.activities.length} activities</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
