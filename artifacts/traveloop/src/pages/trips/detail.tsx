import { useParams, Link } from "wouter";
import { useGetTrip, useDeleteTrip, getListTripsQueryKey, getGetTripQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft, Edit, Map, DollarSign, Package, BookOpen,
  MapPin, Calendar, Globe, Trash2, Clock, Activity, Terminal
} from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const tripId = parseInt(id, 10);
  const { data: trip, isLoading } = useGetTrip(tripId, { query: { queryKey: getGetTripQueryKey(tripId), enabled: !!tripId } });
  const deleteTrip = useDeleteTrip();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleDelete = async () => {
    if (!confirm(`[WARNING] Erase "${trip?.name}" from database? This cannot be undone.`)) return;
    await deleteTrip.mutateAsync({ id: tripId });
    queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
    setLocation("/trips");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-12 space-y-8 max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 bg-white/5 rounded-none" />
          <Skeleton className="h-[400px] w-full bg-white/5 rounded-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 bg-white/5 rounded-none" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!trip) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <Terminal className="h-16 w-16 text-destructive/50 mb-6" />
          <h2 className="text-3xl font-serif uppercase tracking-widest text-foreground mb-2">[ERR 404] FILE NOT FOUND</h2>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">The requested database record does not exist or has been purged.</p>
          <Link href="/trips">
            <Button className="rounded-none font-mono uppercase tracking-widest bg-primary text-primary-foreground h-12 px-8 border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)]">
              Return to Database
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const navTabs = [
    { label: "Itinerary", desc: "Route & Timing", href: `/trips/${tripId}/itinerary`, icon: Map },
    { label: "Budget", desc: "Capital Allocation", href: `/trips/${tripId}/budget`, icon: DollarSign },
    { label: "Packing", desc: "Asset Manifest", href: `/trips/${tripId}/packing`, icon: Package },
    { label: "Notes", desc: "Field Journal", href: `/trips/${tripId}/notes`, icon: BookOpen },
  ];

  return (
    <AppLayout>
      <motion.div 
        className="p-6 lg:p-12 max-w-7xl mx-auto space-y-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="flex items-center justify-between">
          <Link href="/trips">
            <Button variant="outline" size="sm" className="rounded-none border-white/20 hover:bg-white/10 font-mono uppercase tracking-widest text-[10px] h-9 gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Database
            </Button>
          </Link>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            FILE ID: {trip.id.toString().padStart(6, '0')}
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div variants={item} className="relative h-[400px] border border-white/10 overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[100px] pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 blur-[100px] pointer-events-none z-10" />
          
          {trip.coverPhotoUrl ? (
            <img src={trip.coverPhotoUrl} alt={trip.name} className="object-cover w-full h-full opacity-50 mix-blend-luminosity" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <Globe className="h-32 w-32 text-primary/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,232,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,232,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          <div className="absolute bottom-0 left-0 p-8 w-full z-20">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-primary text-xs uppercase tracking-widest px-2 py-1 border border-primary/30 bg-primary/10">
                  {trip.isPublic ? "DECLASSIFIED" : "CLASSIFIED"}
                </span>
                <span className="font-mono text-muted-foreground text-[10px] uppercase tracking-widest">
                  STATUS: ACTIVE
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground tracking-tighter uppercase leading-none mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                {trip.name}
              </h1>
              {trip.description && (
                <p className="text-muted-foreground font-mono text-sm max-w-2xl leading-relaxed border-l-2 border-primary/50 pl-4 py-1 bg-gradient-to-r from-primary/5 to-transparent">
                  {trip.description}
                </p>
              )}
            </div>
          </div>

          <div className="absolute top-6 right-6 flex flex-col sm:flex-row gap-3 z-20">
            <Link href={`/trips/${tripId}/edit`}>
              <Button variant="outline" className="rounded-none border-white/20 hover:bg-white/10 hover:border-white/40 font-mono uppercase tracking-widest text-[10px] h-10 gap-2 w-full sm:w-auto bg-background/50 backdrop-blur-md">
                <Edit className="h-3.5 w-3.5" /> Edit Record
              </Button>
            </Link>
            <Button
              variant="outline"
              className="rounded-none border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive font-mono uppercase tracking-widest text-[10px] h-10 gap-2 w-full sm:w-auto bg-background/50 backdrop-blur-md transition-all shadow-[0_0_10px_rgba(220,38,38,0)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"
              onClick={handleDelete}
              disabled={deleteTrip.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" /> Purge
            </Button>
          </div>
        </motion.div>

        {/* Telemetry Grid */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-1">
          <div className="glass-panel border-white/5 p-6 flex flex-col justify-between min-h-[120px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><MapPin className="h-12 w-12 text-primary" /></div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Target Zones</p>
            <p className="font-serif text-4xl text-primary font-bold">{trip.stops?.length ?? 0}</p>
          </div>
          <div className="glass-panel border-white/5 p-6 flex flex-col justify-between min-h-[120px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity className="h-12 w-12 text-secondary" /></div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Objectives</p>
            <p className="font-serif text-4xl text-secondary font-bold">{trip.stops?.reduce((sum, s) => sum + (s.activities?.length ?? 0), 0) ?? 0}</p>
          </div>
          <div className="glass-panel border-white/5 p-6 flex flex-col justify-between min-h-[120px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Calendar className="h-12 w-12 text-white" /></div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Infiltration</p>
            <p className="font-mono text-lg font-medium">{trip.startDate ? format(new Date(trip.startDate), "MM.dd.yy") : "TBD"}</p>
          </div>
          <div className="glass-panel border-white/5 p-6 flex flex-col justify-between min-h-[120px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Clock className="h-12 w-12 text-white" /></div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Extraction</p>
            <p className="font-mono text-lg font-medium">{trip.endDate ? format(new Date(trip.endDate), "MM.dd.yy") : "TBD"}</p>
          </div>
        </motion.div>

        {/* Action Modules */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {navTabs.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              <Card className="glass-panel border-white/10 rounded-none cursor-pointer group hover:border-primary/50 transition-all overflow-hidden relative min-h-[140px] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                  <tab.icon className="h-32 w-32" />
                </div>
                <CardContent className="p-6 flex flex-col h-full z-10">
                  <div className="flex items-center justify-between mb-auto">
                    <tab.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    <ArrowLeft className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all text-primary rotate-180" />
                  </div>
                  <div className="mt-6">
                    <h3 className="font-mono font-bold uppercase tracking-widest text-sm group-hover:text-primary transition-colors">{tab.label}</h3>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{tab.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>

        {/* Stops Preview (Timeline Style) */}
        {trip.stops && trip.stops.length > 0 && (
          <motion.div variants={item} className="pt-8 border-t border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
                  <Map className="h-6 w-6 text-primary" /> Route Path
                </h2>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Confirmed Waypoints</p>
              </div>
              <Link href={`/trips/${tripId}/itinerary`}>
                <Button variant="outline" className="rounded-none border-primary/30 text-primary hover:bg-primary/10 hover:border-primary font-mono uppercase tracking-widest text-[10px] h-10 px-6">
                  Modify Route
                </Button>
              </Link>
            </div>
            
            <div className="relative pl-6 space-y-12 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {trip.stops.map((stop, i) => (
                <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Node */}
                  <div className="flex items-center justify-center w-6 h-6 rounded-none border border-primary bg-background shadow-[0_0_10px_rgba(0,212,232,0.5)] absolute left-0 md:left-1/2 -translate-x-1/2 md:-translate-x-1/2 z-10 group-hover:scale-125 transition-transform duration-300">
                    <div className="w-2 h-2 bg-primary" />
                  </div>
                  
                  {/* Content */}
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] glass-panel border border-white/5 p-6 hover:border-primary/30 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none" />
                    
                    {stop.imageUrl && (
                      <div className="h-32 -mx-6 -mt-6 mb-4 relative overflow-hidden border-b border-white/5">
                        <img src={stop.imageUrl} alt={stop.cityName} className="object-cover w-full h-full opacity-60 mix-blend-luminosity group-hover:opacity-80 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-mono text-[10px] text-primary uppercase tracking-widest mb-1 border border-primary/30 bg-primary/10 inline-block px-2 py-0.5">
                          Waypoint 0{i + 1}
                        </div>
                        <h3 className="font-serif text-2xl font-bold uppercase mt-2">{stop.cityName}</h3>
                        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">{stop.country}</p>
                      </div>
                      
                      <div className="text-right">
                        {(stop.arrivalDate || stop.departureDate) && (
                          <div className="font-mono text-[10px] uppercase tracking-widest border border-white/10 bg-white/5 px-2 py-1 mb-2 inline-block">
                            {stop.arrivalDate ? format(new Date(stop.arrivalDate), "MM.dd") : "TBD"}
                            {stop.arrivalDate && stop.departureDate && " / "}
                            {stop.departureDate ? format(new Date(stop.departureDate), "MM.dd") : ""}
                          </div>
                        )}
                        {stop.activities && stop.activities.length > 0 && (
                          <p className="font-mono text-[10px] text-secondary uppercase tracking-widest">
                            {stop.activities.length} Objectives
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}
