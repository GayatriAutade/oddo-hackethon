import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateTrip } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListTripsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function NewTrip() {
  const [, setLocation] = useLocation();
  const createTrip = useCreateTrip();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    coverPhotoUrl: "",
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const trip = await createTrip.mutateAsync({
        data: {
          name: form.name,
          description: form.description || undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          coverPhotoUrl: form.coverPhotoUrl || undefined,
          isPublic: form.isPublic,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListTripsQueryKey() });
      setLocation(`/trips/${trip.id}/itinerary`);
    } catch {
      toast({ title: "Error", description: "Failed to create trip", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/trips">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold font-sans tracking-tight">New Trip</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Trip name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. European Summer 2026"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What's this trip about?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverPhotoUrl">Cover photo URL</Label>
                <Input
                  id="coverPhotoUrl"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={form.coverPhotoUrl}
                  onChange={(e) => setForm({ ...form, coverPhotoUrl: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Switch
                  id="isPublic"
                  checked={form.isPublic}
                  onCheckedChange={(checked) => setForm({ ...form, isPublic: checked })}
                />
                <div>
                  <Label htmlFor="isPublic" className="cursor-pointer font-medium">Make trip public</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Others can discover and copy this trip</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={createTrip.isPending} className="flex-1">
                  {createTrip.isPending ? "Creating..." : "Create Trip"}
                </Button>
                <Link href="/trips">
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
