import { useListPublicTrips, useCopyTrip, getListTripsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, MapPin, Calendar, Copy, User, Database, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
      toast({ title: "[SYS]", description: `Directive "${tripName}" copied to local storage.` });
      setLocation(`/trips/${newTrip.id}`);
    } catch {
      toast({ title: "[ERR]", description: "Cloning protocol failed.", variant: "destructive" });
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
              Global <span className="text-secondary">Network</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-mono uppercase tracking-widest text-sm">
              {isLoading ? "ACCESSING PUBLIC ARCHIVES..." : `[${trips?.length ?? 0}] DECLASSIFIED RECORDS FOUND`}
            </p>
          </div>
          <div className="font-mono text-[10px] text-secondary uppercase tracking-widest border border-secondary/30 bg-secondary/10 px-4 py-2 flex items-center gap-2">
            <Globe className="h-3 w-3" /> Connection Secure
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-none border border-white/5 bg-transparent overflow-hidden">
                <Skeleton className="h-64 w-full rounded-none bg-white/5" />
                <div className="p-6 space-y-3 glass-panel border-t-0">
                  <Skeleton className="h-8 w-3/4 bg-white/10 rounded-none" />
                  <Skeleton className="h-4 w-1/2 bg-white/5 rounded-none" />
                  <Skeleton className="h-12 w-full mt-4 bg-white/5 rounded-none" />
                </div>
              </div>
            ))}
          </div>
        ) : trips?.length === 0 ? (
          <motion.div variants={item} className="flex flex-col items-center justify-center py-32 text-center glass-panel border border-white/10 rounded-none relative overflow-hidden">
            <div className="absolute inset-0 bg-secondary/5 pattern-grid-lg opacity-20 pointer-events-none" />
            <Database className="h-16 w-16 text-secondary/40 mb-6" />
            <h3 className="font-serif text-2xl uppercase tracking-widest mb-2">No Public Records</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8 max-w-md">
              The global database is currently empty. Declassify your own missions to contribute.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips?.map((trip) => (
              <motion.div variants={item} key={trip.id}>
                <Card className="rounded-none border-white/10 bg-transparent overflow-hidden hover-elevate transition-all h-full group relative flex flex-col">
                  <div className="absolute inset-0 border border-secondary/0 group-hover:border-secondary/50 transition-colors z-10 pointer-events-none" />
                  
                  <div className="h-64 bg-background relative overflow-hidden">
                    {trip.coverPhotoUrl ? (
                      <img
                        src={trip.coverPhotoUrl}
                        alt={trip.name}
                        className="object-cover w-full h-full group-hover:scale-110 group-hover:opacity-80 transition-all duration-700 opacity-60 mix-blend-luminosity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/5 border-b border-secondary/10">
                        <Globe className="h-16 w-16 text-secondary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    
                    <div className="absolute top-4 left-4 border border-secondary/30 bg-secondary/10 text-secondary font-mono text-[10px] uppercase tracking-widest px-2 py-1 backdrop-blur-md flex items-center gap-1.5">
                      <Globe className="h-3 w-3" /> Declassified
                    </div>
                  </div>

                  <CardContent className="p-6 glass-panel border-t-0 flex-1 flex flex-col relative z-20 -mt-16 bg-background/80 backdrop-blur-xl">
                    <h3 className="font-serif text-2xl font-bold leading-tight line-clamp-1 uppercase group-hover:text-secondary transition-colors">
                      {trip.name}
                    </h3>
                    
                    {trip.description && (
                      <p className="font-mono text-xs text-muted-foreground line-clamp-2 mt-3 leading-relaxed border-l border-white/10 pl-3">
                        {trip.description}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-6 flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        {trip.startDate && (
                          <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 border border-white/5">
                            <Calendar className="h-3 w-3 text-primary" />
                            {format(new Date(trip.startDate), "MM.dd.yy")}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 border border-white/5">
                          <MapPin className="h-3 w-3 text-secondary" />
                          {(trip as any).destinationCount ?? 0} Zones
                        </span>
                        {(trip as any).ownerName && (
                          <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 border border-white/5 ml-auto text-primary">
                            <User className="h-3 w-3" />
                            {(trip as any).ownerName}
                          </span>
                        )}
                      </div>
                      
                      <Button
                        className="w-full mt-2 rounded-none border border-secondary/50 bg-secondary/10 text-secondary hover:bg-secondary hover:text-secondary-foreground font-mono uppercase text-[10px] tracking-widest transition-all h-12 gap-2"
                        onClick={() => handleCopy(trip.id, trip.name ?? "Trip")}
                        disabled={copyTrip.isPending}
                      >
                        <Copy className="h-4 w-4" />
                        Clone to Local Storage
                      </Button>
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
