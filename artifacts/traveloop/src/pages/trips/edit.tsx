import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetTrip, useUpdateTrip, getGetTripQueryKey, getListTripsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Terminal, Edit2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function EditTrip() {
  const { id } = useParams<{ id: string }>();
  const tripId = parseInt(id, 10);
  const { data: trip, isLoading } = useGetTrip(tripId, { query: { queryKey: getGetTripQueryKey(tripId), enabled: !!tripId } });
  const updateTrip = useUpdateTrip();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    coverPhotoUrl: "",
    isPublic: false,
  });

  useEffect(() => {
    if (trip) {
      setForm({
        name: trip.name ?? "",
        description: trip.description ?? "",
        startDate: trip.startDate ?? "",
        endDate: trip.endDate ?? "",
        coverPhotoUrl: trip.coverPhotoUrl ?? "",
        isPublic: trip.isPublic ?? false,
      });
    }
  }, [trip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTrip.mutateAsync({
        id: tripId,
        data: {
          name: form.name,
          description: form.description || undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          coverPhotoUrl: form.coverPhotoUrl || undefined,
          isPublic: form.isPublic,
        },
      });
      queryClient.invalidateQueries({ queryKey: getGetTripQueryKey(tripId) });
      queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
      toast({ title: "[SYS]", description: "Parameters updated successfully." });
      setLocation(`/trips/${tripId}`);
    } catch {
      toast({ title: "[ERR]", description: "Modification failed.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64 bg-white/5 rounded-none" />
          <Skeleton className="h-[600px] w-full bg-white/5 rounded-none" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Link href={`/trips/${tripId}`}>
            <Button variant="outline" size="icon" className="rounded-none border-white/20 hover:bg-white/10 hover:border-white/40 transition-all h-10 w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold font-serif uppercase tracking-tight text-foreground">Modify <span className="text-primary">Parameters</span></h1>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-1">FILE ID: {tripId.toString().padStart(6, '0')}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-panel border-white/10 rounded-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-transparent" />
            
            <CardHeader className="pb-4">
              <CardTitle className="font-mono text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                <Edit2 className="h-4 w-4" /> Override Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Designation *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="bg-background/50 border-white/10 rounded-none h-12 font-mono text-lg focus-visible:ring-primary focus-visible:border-primary transition-all uppercase"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="description" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Objective Summary</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="bg-background/50 border-white/10 rounded-none font-mono focus-visible:ring-primary focus-visible:border-primary transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="startDate" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Infiltration Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="bg-background/50 border-white/10 rounded-none h-12 font-mono focus-visible:ring-primary focus-visible:border-primary transition-all uppercase [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="endDate" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Extraction Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="bg-background/50 border-white/10 rounded-none h-12 font-mono focus-visible:ring-primary focus-visible:border-primary transition-all uppercase [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="coverPhotoUrl" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Visual Asset (URL)</Label>
                  <Input
                    id="coverPhotoUrl"
                    type="url"
                    placeholder="https://..."
                    value={form.coverPhotoUrl}
                    onChange={(e) => setForm({ ...form, coverPhotoUrl: e.target.value })}
                    className="bg-background/50 border-white/10 rounded-none h-12 font-mono focus-visible:ring-primary focus-visible:border-primary transition-all"
                  />
                </div>

                <div className="flex items-center gap-4 p-4 border border-white/10 bg-background/50 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary group-hover:w-2 transition-all" />
                  <Switch
                    id="isPublic"
                    checked={form.isPublic}
                    onCheckedChange={(checked) => setForm({ ...form, isPublic: checked })}
                    className="data-[state=checked]:bg-secondary ml-4"
                  />
                  <div>
                    <Label htmlFor="isPublic" className="cursor-pointer font-mono text-sm uppercase tracking-wider text-foreground">Declassify Record</Label>
                    <p className="font-mono text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Permit global operative access to this file</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <Button type="submit" disabled={updateTrip.isPending} className="flex-1 rounded-none font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] hover:shadow-[0_0_25px_rgba(0,212,232,0.5)] transition-all h-14">
                    {updateTrip.isPending ? "PROCESSING..." : "Apply Overrides"}
                  </Button>
                  <Link href={`/trips/${tripId}`} className="w-1/3">
                    <Button variant="outline" type="button" className="w-full rounded-none font-mono uppercase tracking-widest border-white/20 hover:bg-white/10 hover:border-white/40 transition-all h-14">
                      Abort
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
