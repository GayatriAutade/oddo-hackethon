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
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Trash2, Package, CheckSquare, ListTodo, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Clothing", "Electronics", "Documents", "Toiletries", "Medicine", "Money", "Food", "Other"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
      refresh();
    } catch {
      toast({ title: "[ERR]", description: "Failed to requisition asset", variant: "destructive" });
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
  const progress = total > 0 ? (packed / total) * 100 : 0;

  return (
    <AppLayout>
      <div className="p-6 lg:p-12 max-w-4xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8"
        >
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
              Asset <span className="text-secondary">Manifest</span>
            </h1>
          </div>
          <Button 
            onClick={() => setAdding(!adding)}
            className={`rounded-none font-mono uppercase tracking-widest h-12 px-6 gap-3 transition-all ${
              adding 
                ? "bg-white/10 border-white/20 hover:bg-white/20 text-white" 
                : "bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-secondary shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]"
            }`}
          >
            {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {adding ? "Abort Entry" : "Requisition Asset"}
          </Button>
        </motion.div>

        {total > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-panel border-white/10 rounded-none relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-1 bg-white/5" />
              <div 
                className="absolute top-0 left-0 h-1 bg-secondary shadow-[0_0_10px_rgba(255,215,0,0.5)] transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-none border border-secondary/30 bg-secondary/10 flex items-center justify-center">
                    <CheckSquare className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Readiness Level</p>
                    <p className="font-serif text-2xl font-bold text-foreground">
                      {packed} / {total} <span className="text-muted-foreground text-lg">SECURED</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-3xl font-bold text-secondary">{Math.round(progress)}%</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <Card className="glass-panel border-secondary/30 rounded-none relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
                <CardContent className="p-6">
                  <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-3 w-full">
                      <Label className="font-mono text-[10px] uppercase tracking-widest text-secondary">Asset Designation</Label>
                      <Input
                        placeholder="E.g., TACTICAL FLASHLIGHT"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="bg-background/50 border-white/10 rounded-none h-12 font-mono focus-visible:ring-secondary focus-visible:border-secondary transition-all uppercase"
                        autoFocus
                        required
                      />
                    </div>
                    <div className="w-full md:w-64 space-y-3">
                      <Label className="font-mono text-[10px] uppercase tracking-widest text-secondary">Classification</Label>
                      <select
                        value={newItem.category ?? "Other"}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        className="w-full h-12 bg-background/50 border border-white/10 rounded-none font-mono uppercase text-sm px-4 focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all appearance-none"
                      >
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <Button type="submit" disabled={createItem.isPending} className="w-full md:w-auto h-12 rounded-none font-mono uppercase tracking-widest bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8">
                      Append
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-32 bg-white/10 rounded-none" />
                <Skeleton className="h-16 w-full bg-white/5 rounded-none" />
                <Skeleton className="h-16 w-full bg-white/5 rounded-none" />
              </div>
            ))}
          </div>
        ) : total === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 glass-panel border border-white/10 rounded-none relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-secondary/5 pattern-grid-lg opacity-20 pointer-events-none" />
            <Package className="h-16 w-16 text-secondary/40 mx-auto mb-6" />
            <h3 className="font-serif text-2xl uppercase tracking-widest text-foreground mb-2">Manifest Empty</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">No assets requisitioned for this mission.</p>
            <Button onClick={() => setAdding(true)} className="rounded-none font-mono uppercase tracking-widest bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-secondary shadow-[0_0_15px_rgba(255,215,0,0.3)] h-12 px-8">
              Initialize Manifest
            </Button>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            {Object.entries(grouped).map(([category, catItems]) => (
              <motion.div variants={item} key={category}>
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-secondary">{category}</h3>
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="font-mono text-[10px] text-muted-foreground border border-white/10 px-2 py-0.5">
                    {catItems.filter((i) => i.isPacked).length}/{catItems.length} SECURED
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {catItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`group flex items-center justify-between p-4 border transition-all ${
                        item.isPacked 
                          ? "bg-secondary/5 border-secondary/20 text-muted-foreground" 
                          : "bg-background/50 border-white/10 hover:border-white/30 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => handleToggle(item.id, !item.isPacked)}>
                        <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                          item.isPacked ? "border-secondary bg-secondary text-secondary-foreground" : "border-white/30 group-hover:border-secondary/50"
                        }`}>
                          {item.isPacked && <CheckSquare className="h-3.5 w-3.5" />}
                        </div>
                        <span className={`font-mono text-sm uppercase tracking-wide truncate ${item.isPacked ? "line-through opacity-50" : ""}`}>
                          {item.name}
                        </span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/20 hover:text-destructive flex-shrink-0 ml-2"
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
