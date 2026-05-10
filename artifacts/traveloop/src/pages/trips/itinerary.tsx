import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetTrip, useCreateStop, useDeleteStop,
  useCreateActivity, useDeleteActivity,
  useSearchCities,
  getGetTripQueryKey, getSearchCitiesQueryKey,
  StopInput, ActivityInput,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, MapPin, Clock, DollarSign, Search, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const ACTIVITY_TYPES = ["Sightseeing", "Food", "Adventure", "Culture", "Shopping", "Transport", "Accommodation", "Other"];

function AddStopDialog({ tripId, stopCount, onAdded }: { tripId: number; stopCount: number; onAdded: () => void }) {
  const createStop = useCreateStop();
  const [open, setOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [form, setForm] = useState<StopInput>({ cityName: "", country: "", arrivalDate: undefined, departureDate: undefined, orderIndex: stopCount, imageUrl: undefined });
  const { data: cities } = useSearchCities({ q: cityQuery }, { query: { queryKey: getSearchCitiesQueryKey({ q: cityQuery }), enabled: cityQuery.length > 1 } });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cityName) return;
    try {
      await createStop.mutateAsync({ tripId, data: { ...form, orderIndex: stopCount } });
      onAdded();
      setOpen(false);
      setForm({ cityName: "", country: "", arrivalDate: undefined, departureDate: undefined, orderIndex: stopCount, imageUrl: undefined });
    } catch {
      toast({ title: "Error", description: "Failed to add stop", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" />Add Stop</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add City Stop</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Search city</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Paris, Tokyo..." value={cityQuery} onChange={(e) => setCityQuery(e.target.value)} className="pl-9" />
            </div>
            {cities && cities.length > 0 && (
              <div className="border rounded-lg overflow-hidden shadow-sm max-h-40 overflow-y-auto">
                {cities.slice(0, 5).map((city) => (
                  <button
                    key={`${city.name}-${city.country}`}
                    type="button"
                    className="w-full px-4 py-2.5 text-left hover:bg-muted flex items-center gap-3 text-sm transition-colors"
                    onClick={() => {
                      setForm({ ...form, cityName: city.name, country: city.country ?? "", imageUrl: city.imageUrl ?? undefined });
                      setCityQuery(city.name);
                    }}
                  >
                    {city.imageUrl && <img src={city.imageUrl} alt={city.name} className="w-8 h-8 rounded object-cover" />}
                    <span><span className="font-medium">{city.name}</span>, <span className="text-muted-foreground">{city.country}</span></span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>City name *</Label>
              <Input value={form.cityName} onChange={(e) => setForm({ ...form, cityName: e.target.value })} required placeholder="City name" />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={form.country ?? ""} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Arrival</Label>
              <Input type="date" value={form.arrivalDate ?? ""} onChange={(e) => setForm({ ...form, arrivalDate: e.target.value || undefined })} />
            </div>
            <div className="space-y-2">
              <Label>Departure</Label>
              <Input type="date" value={form.departureDate ?? ""} onChange={(e) => setForm({ ...form, departureDate: e.target.value || undefined })} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createStop.isPending}>
            {createStop.isPending ? "Adding..." : "Add Stop"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddActivityDialog({ tripId, stopId, onAdded }: { tripId: number; stopId: number; onAdded: () => void }) {
  const createActivity = useCreateActivity();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ActivityInput>({ name: "", type: "Sightseeing", cost: undefined, durationMinutes: undefined, description: undefined });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createActivity.mutateAsync({ tripId, stopId, data: form });
      onAdded();
      setOpen(false);
      setForm({ name: "", type: "Sightseeing", cost: undefined, durationMinutes: undefined, description: undefined });
    } catch {
      toast({ title: "Error", description: "Failed to add activity", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />Add Activity</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Activity</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Activity name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Eiffel Tower visit" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type ?? "Sightseeing"} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Cost (USD)</Label>
              <Input type="number" min={0} step={0.01} placeholder="0" value={form.cost ?? ""} onChange={(e) => setForm({ ...form, cost: e.target.value ? parseFloat(e.target.value) : undefined })} />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input type="number" min={0} placeholder="90" value={form.durationMinutes ?? ""} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value ? parseInt(e.target.value) : undefined })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value || undefined })} rows={2} placeholder="Optional notes..." />
          </div>
          <Button type="submit" className="w-full" disabled={createActivity.isPending}>
            {createActivity.isPending ? "Adding..." : "Add Activity"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Itinerary() {
  const { id } = useParams<{ id: string }>();
  const tripId = parseInt(id, 10);
  const { data: trip, isLoading } = useGetTrip(tripId, { query: { queryKey: getGetTripQueryKey(tripId), enabled: !!tripId } });
  const deleteStop = useDeleteStop();
  const deleteActivity = useDeleteActivity();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const refresh = () => queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(tripId) });

  const handleDeleteStop = async (stopId: number, cityName: string) => {
    if (!confirm(`Remove ${cityName} from the itinerary?`)) return;
    await deleteStop.mutateAsync({ tripId, stopId });
    refresh();
  };

  const handleDeleteActivity = async (stopId: number, activityId: number) => {
    await deleteActivity.mutateAsync({ tripId, stopId, activityId });
    refresh();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4 max-w-3xl mx-auto">
          <Skeleton className="h-10 w-48" />
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/trips/${tripId}`}>
              <Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-sans tracking-tight">{trip?.name}</h1>
              <p className="text-muted-foreground text-sm">Itinerary Builder</p>
            </div>
          </div>
          <AddStopDialog tripId={tripId} stopCount={trip?.stops?.length ?? 0} onAdded={refresh} />
        </div>

        {!trip?.stops || trip.stops.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <MapPin className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No stops yet</h3>
            <p className="text-muted-foreground mb-6">Add cities to start building your itinerary</p>
            <AddStopDialog tripId={tripId} stopCount={0} onAdded={refresh} />
          </div>
        ) : (
          <div className="space-y-4">
            {trip.stops.map((stop, index) => (
              <Card key={stop.id} className="overflow-hidden">
                <div className="flex items-center gap-4 p-4 border-b bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  {stop.imageUrl && (
                    <img src={stop.imageUrl} alt={stop.cityName} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg">{stop.cityName}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{stop.country}</span>
                      {stop.arrivalDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(stop.arrivalDate), "MMM d")}
                          {stop.departureDate && ` – ${format(new Date(stop.departureDate), "MMM d")}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteStop(stop.id, stop.cityName)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4 space-y-3">
                  {stop.activities && stop.activities.length > 0 ? (
                    <div className="space-y-2">
                      {stop.activities.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{activity.name}</span>
                              <Badge variant="secondary" className="text-xs">{activity.type}</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              {activity.cost != null && (
                                <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${activity.cost}</span>
                              )}
                              {activity.durationMinutes && (
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{activity.durationMinutes}min</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive h-7 w-7 p-0"
                            onClick={() => handleDeleteActivity(stop.id, activity.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No activities yet</p>
                  )}
                  <AddActivityDialog tripId={tripId} stopId={stop.id} onAdded={refresh} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
