import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetTrip, useListPackingItems, useCreatePackingItem, useUpdatePackingItem, useDeletePackingItem,
  getListPackingItemsQueryKey, getGetTripQueryKey, PackingItemInput,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Trash2, Package } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["Clothing", "Electronics", "Documents", "Toiletries", "Medicine", "Money", "Food", "Other"];

export default function Packing() {
  const { id } = useParams<{ id: string }>();
  const tripId = parseInt(id, 10);
  const { data: trip } = useGetTrip(tripId, { query: { queryKey: getGetTripQueryKey(tripId), enabled: !!tripId } });
  const { data: items, isLoading } = useListPackingItems(tripId, { query: { queryKey: getListPackingItemsQueryKey(tripId), enabled: !!tripId } });
  const createItem = useCreatePackingItem();
  const updateItem = useUpdatePackingItem();
  const deleteItem = useDeletePackingItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newItem, setNewItem] = useState<PackingItemInput>({ name: "", category: "Other" });
  const [adding, setAdding] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: getListPackingItemsQueryKey(tripId) });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    try {
      await createItem.mutateAsync({ id: tripId, data: newItem });
      setNewItem({ name: "", category: newItem.category });
      setAdding(false);
      refresh();
    } catch {
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
    }
  };

  const handleToggle = async (itemId: number, isPacked: boolean) => {
    await updateItem.mutateAsync({ id: tripId, itemId, data: { isPacked } });
    refresh();
  };

  const handleDelete = async (itemId: number) => {
    await deleteItem.mutateAsync({ id: tripId, itemId });
    refresh();
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = items?.filter((i) => i.category === cat) ?? [];
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {} as Record<string, NonNullable<typeof items>>);

  const packed = items?.filter((i) => i.isPacked).length ?? 0;
  const total = items?.length ?? 0;

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
              <p className="text-muted-foreground text-sm">Packing Checklist</p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />Add Item
          </Button>
        </div>

        {total > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{packed} of {total} items packed</span>
                <span className="text-sm text-muted-foreground">{total > 0 ? Math.round((packed / total) * 100) : 0}%</span>
              </div>
              <div className="bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${total > 0 ? (packed / total) * 100 : 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {adding && (
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
                <Input
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="flex-1 min-w-40"
                  autoFocus
                  required
                />
                <select
                  value={newItem.category ?? "Other"}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="border rounded-md px-3 py-2 text-sm bg-background"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Button type="submit" disabled={createItem.isPending}>Add</Button>
                <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : total === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nothing packed yet</h3>
            <p className="text-muted-foreground mb-6">Start adding items to your packing list</p>
            <Button onClick={() => setAdding(true)}>Add your first item</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([category, catItems]) => (
              <Card key={category}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <Badge variant="secondary">{category}</Badge>
                    <span className="font-normal">{catItems.filter((i) => i.isPacked).length}/{catItems.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 group py-1.5">
                      <Checkbox
                        checked={item.isPacked ?? false}
                        onCheckedChange={(checked) => handleToggle(item.id, !!checked)}
                      />
                      <span className={`flex-1 text-sm ${item.isPacked ? "line-through text-muted-foreground" : ""}`}>
                        {item.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
