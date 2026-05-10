import { useListTrips, useDeleteTrip, Trip } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MapPin, Calendar, Globe, Trash2, Edit, Terminal } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getListTripsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { useState } from "react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Trips() {
  const { data: trips, isLoading } = useListTrips();
  const deleteTrip = useDeleteTrip();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (trip: Trip) => {
    if (!confirm(`[WARNING] Erase "${trip.name}" from database? This cannot be undone.`)) return;
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
      <motion.div 
        className="p-6 lg:p-12 max-w-7xl mx-auto space-y-12"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
          <div>
            <h1 className="text-5xl font-serif font-bold tracking-tight text-foreground uppercase">
              MISSION <span className="text-primary">DATABASE</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-mono uppercase tracking-widest text-sm">
              {isLoading ? "SCANNING ARCHIVES..." : `[${trips?.length ?? 0}] RECORDS FOUND`}
            </p>
          </div>
          <Link href="/trips/new">
            <Button className="rounded-none font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] hover:shadow-[0_0_25px_rgba(0,212,232,0.5)] transition-all h-12 px-6 gap-3">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-none border border-white/5 bg-transparent overflow-hidden">
                <Skeleton className="h-56 w-full rounded-none bg-white/5" />
                <div className="p-6 space-y-3 glass-panel border-t-0">
                  <Skeleton className="h-8 w-3/4 bg-white/10 rounded-none" />
                  <Skeleton className="h-4 w-1/2 bg-white/5 rounded-none" />
                </div>
              </div>
            ))}
          </div>
        ) : trips?.length === 0 ? (
          <motion.div variants={item} className="flex flex-col items-center justify-center py-32 text-center glass-panel border border-white/10 rounded-none relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pattern-grid-lg opacity-20 pointer-events-none" />
            <Terminal className="h-16 w-16 text-primary/40 mb-6" />
            <h3 className="font-serif text-2xl uppercase tracking-widest mb-2">No Records Found</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8 max-w-md">
              The database is empty. Initialize a new mission parameter to begin tracking.
            </p>
            <Link href="/trips/new">
              <Button className="rounded-none font-mono uppercase tracking-widest bg-primary text-primary-foreground h-12 px-8 shadow-[0_0_15px_rgba(0,212,232,0.3)]">
                Initialize
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips?.map((trip) => (
              <motion.div variants={item} key={trip.id}>
                <Card className="rounded-none border-white/10 bg-transparent overflow-hidden hover-elevate transition-all h-full group relative flex flex-col">
                  <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/50 transition-colors z-10 pointer-events-none" />
                  
                  <div
                    className="h-56 bg-background relative overflow-hidden cursor-pointer"
                    onClick={() => setLocation(`/trips/${trip.id}`)}
                  >
                    {trip.coverPhotoUrl ? (
                      <img
                        src={trip.coverPhotoUrl}
                        alt={trip.name}
                        className="object-cover w-full h-full group-hover:scale-110 group-hover:opacity-80 transition-all duration-700 opacity-60"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 border-b border-primary/10">
                        <Globe className="h-16 w-16 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    
                    {trip.isPublic && (
                      <div className="absolute top-4 right-4 border border-secondary/50 bg-secondary/10 text-secondary font-mono text-[10px] uppercase tracking-widest px-2 py-1 backdrop-blur-md">
                        Public
                      </div>
                    )}
                    <div className="absolute top-4 left-4 border border-primary/30 bg-primary/10 text-primary font-mono text-[10px] uppercase tracking-widest px-2 py-1 backdrop-blur-md">
                      ID: {trip.id.toString().padStart(4, '0')}
                    </div>
                  </div>

                  <CardContent className="p-6 glass-panel border-t-0 flex-1 flex flex-col relative z-20 -mt-10 bg-background/90 backdrop-blur-xl">
                    <h3
                      className="font-serif text-2xl font-bold leading-tight line-clamp-1 uppercase cursor-pointer group-hover:text-primary transition-colors"
                      onClick={() => setLocation(`/trips/${trip.id}`)}
                    >
                      {trip.name}
                    </h3>
                    
                    {trip.description && (
                      <p className="font-mono text-xs text-muted-foreground line-clamp-2 mt-3 leading-relaxed">
                        {trip.description}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-6 flex flex-col gap-4">
                      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        {trip.startDate && (
                          <span className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-primary" />
                            {format(new Date(trip.startDate), "MM.dd.yy")}
                          </span>
                        )}
                        <span className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-secondary" />
                          {trip.destinationCount ?? 0} Zones
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 border-t border-white/10 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1 rounded-none border-white/20 font-mono uppercase text-[10px] tracking-widest hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all h-9"
                          onClick={() => setLocation(`/trips/${trip.id}`)}
                        >
                          Access
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-none border-white/20 hover:bg-white/10 transition-all h-9 w-9 flex-shrink-0"
                          onClick={() => setLocation(`/trips/${trip.id}/edit`)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-none border-destructive/30 text-destructive hover:bg-destructive/20 hover:text-destructive hover:border-destructive transition-all h-9 w-9 flex-shrink-0"
                          onClick={() => handleDelete(trip)}
                          disabled={deleting === trip.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
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
