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
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

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
      toast({ title: "Trip updated" });
      setLocation(`/trips/${tripId}`);
    } catch {
      toast({ title: "Error", description: "Failed to update trip", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/trips/${tripId}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold font-sans tracking-tight">Edit Trip</h1>
        </div>

        <Card>
          <CardHeader><CardTitle>Trip Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Trip name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cover photo URL</Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={form.coverPhotoUrl}
                  onChange={(e) => setForm({ ...form, coverPhotoUrl: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Switch
                  checked={form.isPublic}
                  onCheckedChange={(checked) => setForm({ ...form, isPublic: checked })}
                />
                <div>
                  <Label className="cursor-pointer font-medium">Make trip public</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Others can discover and copy this trip</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={updateTrip.isPending} className="flex-1">
                  {updateTrip.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Link href={`/trips/${tripId}`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
