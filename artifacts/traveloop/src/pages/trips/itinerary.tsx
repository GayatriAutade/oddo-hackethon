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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, MapPin, Clock, DollarSign, Search, X, Map } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";

const ACTIVITY_TYPES = ["Sightseeing", "Food", "Adventure", "Culture", "Shopping", "Transport", "Accommodation", "Other"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
      toast({ title: "[ERR]", description: "Failed to allocate waypoint", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-none font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] hover:shadow-[0_0_25px_rgba(0,212,232,0.5)] transition-all h-12 px-6 gap-3">
          <Plus className="h-4 w-4" /> Append Waypoint
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg glass-panel border-white/10 rounded-none bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl uppercase tracking-widest text-primary flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Target Coordinates
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Search Database</Label>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="QUERY SECTOR..." 
                value={cityQuery} 
                onChange={(e) => setCityQuery(e.target.value)} 
                className="pl-12 bg-background/50 border-white/10 rounded-none h-12 font-mono uppercase text-sm focus-visible:ring-primary focus-visible:border-primary transition-all" 
              />
            </div>
            {cities && cities.length > 0 && (
              <div className="border border-white/10 rounded-none overflow-hidden shadow-sm max-h-40 overflow-y-auto bg-background/80 backdrop-blur-md">
                {cities.slice(0, 5).map((city) => (
                  <button
                    key={`${city.name}-${city.country}`}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-primary/10 flex items-center gap-3 text-sm transition-colors border-b border-white/5 last:border-0"
                    onClick={() => {
                      setForm({ ...form, cityName: city.name, country: city.country ?? "", imageUrl: city.imageUrl ?? undefined });
                      setCityQuery(city.name);
                    }}
                  >
                    {city.imageUrl ? (
                      <img src={city.imageUrl} alt={city.name} className="w-10 h-10 rounded-none object-cover border border-white/10" />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <span className="font-mono text-xs uppercase tracking-wide"><span className="font-bold text-foreground">{city.name}</span> <span className="text-muted-foreground opacity-50">/</span> <span className="text-muted-foreground">{city.country}</span></span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Designation *</Label>
              <Input 
                value={form.cityName} 
                onChange={(e) => setForm({ ...form, cityName: e.target.value })} 
                required 
                className="bg-background/50 border-white/10 rounded-none h-12 font-mono uppercase text-sm focus-visible:ring-primary focus-visible:border-primary transition-all" 
              />
            </div>
            <div className="space-y-3">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Territory</Label>
              <Input 
                value={form.country ?? ""} 
                onChange={(e) => setForm({ ...form, country: e.target.value })} 
                className="bg-background/50 border-white/10 rounded-none h-12 font-mono uppercase text-sm focus-visible:ring-primary focus-visible:border-primary transition-all" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Infiltration</Label>
              <Input 
                type="date" 
                value={form.arrivalDate ?? ""} 
                onChange={(e) => setForm({ ...form, arrivalDate: e.target.value || undefined })} 
                className="bg-background/50 border-white/10 rounded-none h-12 font-mono uppercase text-sm focus-visible:ring-primary focus-visible:border-primary transition-all [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]" 
              />
            </div>
            <div className="space-y-3">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Extraction</Label>
              <Input 
                type="date" 
                value={form.departureDate ?? ""} 
                onChange={(e) => setForm({ ...form, departureDate: e.target.value || undefined })} 
                className="bg-background/50 border-white/10 rounded-none h-12 font-mono uppercase text-sm focus-visible:ring-primary focus-visible:border-primary transition-all [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]" 
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full h-14 rounded-none font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] transition-all" disabled={createStop.isPending}>
            {createStop.isPending ? "PROCESSING..." : "Initialize Waypoint"}
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
      toast({ title: "[ERR]", description: "Failed to inject objective", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-none border-primary/30 text-primary hover:bg-primary/10 hover:border-primary font-mono uppercase tracking-widest text-[10px] h-9 px-4 gap-2">
          <Plus className="h-3.5 w-3.5" /> Inject Objective
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg glass-panel border-white/10 rounded-none bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl uppercase tracking-widest text-primary flex items-center gap-2">
            <Activity className="h-5 w-5" /> Mission Objective
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Objective Designation *</Label>
            <Input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
              placeholder="E.g., SECURE EIFFEL TOWER" 
              className="bg-background/50 border-white/10 rounded-none h-12 font-mono uppercase text-sm focus-visible:ring-primary focus-visible:border-primary transition-all" 
            />
          </div>
          
          <div className="space-y-3">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Classification</Label>
            <Select value={form.type ?? "Sightseeing"} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="bg-background/50 border-white/10 rounded-none h-12 font-mono uppercase text-sm focus:ring-primary focus:border-primary transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-white/10 bg-background font-mono uppercase text-xs">
                {ACTIVITY_TYPES.map((t) => <SelectItem key={t} value={t} className="focus:bg-primary/20 focus:text-primary">{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Capital Required (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="number" 
                  min={0} 
                  step={0.01} 
                  placeholder="0.00" 
                  value={form.cost ?? ""} 
                  onChange={(e) => setForm({ ...form, cost: e.target.value ? parseFloat(e.target.value) : undefined })} 
                  className="pl-12 bg-background/50 border-white/10 rounded-none h-12 font-mono uppercase text-sm focus-visible:ring-primary focus-visible:border-primary transition-all" 
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Duration (MIN)</Label>
              <div className="relative">
                <Clock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="number" 
                  min={0} 
                  placeholder="60" 
                  value={form.durationMinutes ?? ""} 
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value ? parseInt(e.target.value) : undefined })} 
                  className="pl-12 bg-background/50 border-white/10 rounded-none h-12 font-mono uppercase text-sm focus-visible:ring-primary focus-visible:border-primary transition-all" 
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Operational Notes</Label>
            <Textarea 
              value={form.description ?? ""} 
              onChange={(e) => setForm({ ...form, description: e.target.value || undefined })} 
              rows={3} 
              className="bg-background/50 border-white/10 rounded-none font-mono uppercase text-sm focus-visible:ring-primary focus-visible:border-primary transition-all resize-none" 
            />
          </div>
          
          <Button type="submit" className="w-full h-14 rounded-none font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] transition-all" disabled={createActivity.isPending}>
            {createActivity.isPending ? "PROCESSING..." : "Confirm Injection"}
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

  const refresh = () => queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(tripId) });

  const handleDeleteStop = async (stopId: number, cityName: string) => {
    if (!confirm(`[WARNING] Erase ${cityName} from itinerary?`)) return;
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
        <div className="p-6 lg:p-12 max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64 bg-white/5 rounded-none" />
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full bg-white/5 rounded-none" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div 
        className="p-6 lg:p-12 max-w-5xl mx-auto space-y-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link href={`/trips/${tripId}`}>
                <Button variant="outline" size="sm" className="rounded-none border-white/20 hover:bg-white/10 font-mono uppercase tracking-widest text-[10px] h-8 gap-2">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
              </Link>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest border border-white/10 px-2 py-1">
                {trip?.name || "LOADING..."}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground uppercase">
              Route <span className="text-primary">Vectors</span>
            </h1>
          </div>
          <AddStopDialog tripId={tripId} stopCount={trip?.stops?.length ?? 0} onAdded={refresh} />
        </motion.div>

        {!trip?.stops || trip.stops.length === 0 ? (
          <motion.div variants={item} className="flex flex-col items-center justify-center py-32 text-center glass-panel border border-white/10 rounded-none relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pattern-grid-lg opacity-20 pointer-events-none" />
            <Map className="h-16 w-16 text-primary/40 mb-6" />
            <h3 className="font-serif text-2xl uppercase tracking-widest mb-2">No Waypoints Established</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8 max-w-md">
              The route is undefined. Append coordinates to construct operational path.
            </p>
            <AddStopDialog tripId={tripId} stopCount={0} onAdded={refresh} />
          </motion.div>
        ) : (
          <div className="space-y-12">
            {trip.stops.map((stop, index) => (
              <motion.div variants={item} key={stop.id} className="relative">
                {/* Timeline connector */}
                {index !== trip.stops!.length - 1 && (
                  <div className="absolute left-6 top-24 bottom-[-3rem] w-px bg-gradient-to-b from-primary/50 via-white/10 to-primary/50 z-0 hidden md:block" />
                )}

                <Card className="glass-panel border-white/10 rounded-none relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row border-b border-white/10 bg-background/50 relative z-10">
                    {/* Number block */}
                    <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-auto bg-primary/10 border-r border-b md:border-b-0 border-white/10 font-mono text-2xl text-primary font-bold">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    
                    {/* Header info */}
                    <div className="flex flex-1 flex-col md:flex-row md:items-center justify-between p-4 md:p-6 gap-4">
                      <div className="flex items-center gap-4">
                        {stop.imageUrl && (
                          <div className="w-16 h-16 rounded-none border border-white/10 overflow-hidden flex-shrink-0 relative">
                            <img src={stop.imageUrl} alt={stop.cityName} className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-serif text-2xl font-bold uppercase tracking-tight">{stop.cityName}</h3>
                          <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                            <span className="text-foreground/70">{stop.country}</span>
                            {stop.arrivalDate && (
                              <span className="flex items-center gap-1.5 border border-white/10 bg-white/5 px-1.5 py-0.5">
                                <Clock className="h-3 w-3 text-primary" />
                                {format(new Date(stop.arrivalDate), "MM.dd")}
                                {stop.departureDate && ` – ${format(new Date(stop.departureDate), "MM.dd")}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-none border-destructive/30 text-destructive hover:bg-destructive/20 hover:text-destructive hover:border-destructive transition-all h-10 w-10 md:opacity-0 md:group-hover:opacity-100 self-end md:self-auto"
                        onClick={() => handleDeleteStop(stop.id, stop.cityName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6 md:pl-24 relative z-10 bg-background/30 backdrop-blur-sm">
                    {stop.activities && stop.activities.length > 0 ? (
                      <div className="space-y-3 mb-6">
                        {stop.activities.map((activity) => (
                          <div key={activity.id} className="group/item flex items-stretch border border-white/5 bg-background/50 hover:bg-background/80 hover:border-primary/30 transition-all">
                            <div className="w-1 bg-white/10 group-hover/item:bg-primary transition-colors" />
                            <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-sm font-bold uppercase tracking-widest text-foreground">{activity.name}</span>
                                  <Badge variant="outline" className="rounded-none font-mono text-[8px] uppercase tracking-widest border-primary/30 text-primary bg-primary/10 px-1 py-0 h-4">
                                    {activity.type}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                                  {activity.cost != null && (
                                    <span className="flex items-center gap-1.5">
                                      <DollarSign className="h-3 w-3" /> {activity.cost.toFixed(2)}
                                    </span>
                                  )}
                                  {activity.durationMinutes && (
                                    <span className="flex items-center gap-1.5">
                                      <Clock className="h-3 w-3" /> {activity.durationMinutes} MIN
                                    </span>
                                  )}
                                </div>
                                {activity.description && (
                                  <p className="font-mono text-xs text-muted-foreground mt-2 border-l border-white/10 pl-3">
                                    {activity.description}
                                  </p>
                                )}
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none md:opacity-0 md:group-hover/item:opacity-100 transition-opacity text-destructive hover:bg-destructive/20 hover:text-destructive self-end md:self-auto"
                                onClick={() => handleDeleteActivity(stop.id, activity.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-white/5 bg-background/50 p-4 mb-6">
                        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">No objectives defined for this sector.</p>
                      </div>
                    )}
                    
                    <AddActivityDialog tripId={tripId} stopId={stop.id} onAdded={refresh} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
