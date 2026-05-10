import { useAuth } from "@/hooks/use-auth";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Activity, DollarSign, Calendar, Compass, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetDashboardStats();

  return (
    <AppLayout>
      <motion.div 
        className="space-y-12 p-6 lg:p-12 max-w-7xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
          <div>
            <h1 className="text-5xl font-serif font-bold tracking-tight text-foreground uppercase">
              STATUS <span className="text-primary">ONLINE</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-mono uppercase tracking-widest text-sm">
              OPERATIVE: {user?.name} | WAITING FOR DIRECTIVES
            </p>
          </div>
          <Link href="/trips/new">
            <Button className="rounded-none font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] hover:shadow-[0_0_25px_rgba(0,212,232,0.5)] transition-all h-12 px-6 gap-3">
              <Plus className="h-4 w-4" />
              Initialize Mission
            </Button>
          </Link>
        </motion.div>

        {/* Stats Grid - HUD Style */}
        <motion.div variants={item}>
          <h2 className="font-mono text-primary text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4" /> System Telemetry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-panel border-primary/20 rounded-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-full pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Missions Logged</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16 bg-primary/20 rounded-none" /> : <div className="text-4xl font-serif font-bold text-foreground">{stats?.totalTrips || 0}</div>}
              </CardContent>
            </Card>
            <Card className="glass-panel border-secondary/20 rounded-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-8 h-8 bg-secondary/10 rounded-bl-full pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Zones Breached</CardTitle>
                <MapPin className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16 bg-secondary/20 rounded-none" /> : <div className="text-4xl font-serif font-bold text-foreground">{stats?.totalCitiesVisited || 0}</div>}
              </CardContent>
            </Card>
            <Card className="glass-panel border-primary/20 rounded-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-full pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Objectives</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-16 bg-primary/20 rounded-none" /> : <div className="text-4xl font-serif font-bold text-foreground">{stats?.totalActivities || 0}</div>}
              </CardContent>
            </Card>
            <Card className="glass-panel border-secondary/20 rounded-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-8 h-8 bg-secondary/10 rounded-bl-full pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Capital Allocated</CardTitle>
                <DollarSign className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-24 bg-secondary/20 rounded-none" /> : <div className="text-4xl font-serif font-bold text-foreground">${stats?.totalBudgetPlanned?.toLocaleString() || 0}</div>}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Recent Trips */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-primary text-xs uppercase tracking-widest flex items-center gap-2">
              <Compass className="h-4 w-4" /> Active Directives
            </h2>
            <Link href="/trips" className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              View Database <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="rounded-none border-white/5 bg-transparent overflow-hidden">
                  <Skeleton className="h-64 w-full rounded-none bg-white/5" />
                  <CardContent className="p-6 space-y-3 glass-panel border-t-0">
                    <Skeleton className="h-8 w-3/4 bg-white/10 rounded-none" />
                    <Skeleton className="h-4 w-1/2 bg-white/5 rounded-none" />
                  </CardContent>
                </Card>
              ))
            ) : stats?.recentTrips?.length ? (
              stats.recentTrips.map(trip => (
                <Link key={trip.id} href={`/trips/${trip.id}`}>
                  <Card className="rounded-none border-white/5 bg-transparent overflow-hidden hover-elevate transition-all cursor-pointer h-full group relative">
                    <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/50 transition-colors z-10 pointer-events-none" />
                    <div className="h-64 bg-background relative overflow-hidden">
                      {trip.coverPhotoUrl ? (
                        <img src={trip.coverPhotoUrl} alt={trip.name} className="object-cover w-full h-full group-hover:scale-110 group-hover:opacity-80 transition-all duration-700 opacity-60" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 border border-primary/10">
                          <MapPin className="h-12 w-12 text-primary/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                      {trip.isPublic && (
                        <div className="absolute top-4 right-4 border border-secondary/50 bg-secondary/10 text-secondary font-mono text-[10px] uppercase tracking-widest px-2 py-1 backdrop-blur-md">
                          Public
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6 glass-panel border-t-0 relative z-20 -mt-16 bg-background/80 backdrop-blur-xl">
                      <h3 className="font-serif text-2xl font-bold leading-tight line-clamp-1 uppercase group-hover:text-primary transition-colors">{trip.name}</h3>
                      <div className="flex items-center gap-4 mt-4 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-primary" />
                          {trip.startDate ? format(new Date(trip.startDate), 'MM.dd.yy') : 'TBD'}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-secondary" />
                          {trip.destinationCount} Zones
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-24 text-center glass-panel border border-white/10 rounded-none relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 pattern-grid-lg opacity-20 pointer-events-none" />
                <Compass className="h-16 w-16 mx-auto text-primary/40 mb-6" />
                <h3 className="font-serif text-2xl uppercase tracking-widest text-foreground mb-2">No Directives Found</h3>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">Awaiting input for new mission parameters.</p>
                <Link href="/trips/new" className="inline-flex items-center justify-center font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] transition-all h-12 px-8 gap-3">
                  Initialize Mission
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
