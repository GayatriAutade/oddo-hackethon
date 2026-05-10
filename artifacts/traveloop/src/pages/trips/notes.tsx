import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetTrip, useListNotes, useCreateNote, useUpdateNote, useDeleteNote,
  getListNotesQueryKey, getGetTripQueryKey,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Trash2, Edit, BookOpen, Check, X, Terminal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Notes() {
  const { id } = useParams<{ id: string }>();
  const tripId = parseInt(id, 10);
  const { data: trip } = useGetTrip(tripId, { query: { queryKey: getGetTripQueryKey(tripId), enabled: !!tripId } });
  const { data: notes, isLoading } = useListNotes(tripId, { query: { queryKey: getListNotesQueryKey(tripId), enabled: !!tripId } });
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newContent, setNewContent] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<{ id: number; content: string } | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: getListNotesQueryKey(tripId) });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    try {
      await createNote.mutateAsync({ id: tripId, data: { content: newContent } });
      setNewContent("");
      setAdding(false);
      refresh();
    } catch {
      toast({ title: "[ERR]", description: "Failed to record log", variant: "destructive" });
    }
  };

  const handleUpdate = async (noteId: number) => {
    if (!editing) return;
    try {
      await updateNote.mutateAsync({ id: tripId, noteId, data: { content: editing.content } });
      setEditing(null);
      refresh();
    } catch {
      toast({ title: "[ERR]", description: "Failed to update log", variant: "destructive" });
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!confirm("[WARNING] Purge this log entry?")) return;
    await deleteNote.mutateAsync({ id: tripId, noteId });
    refresh();
  };

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
              Field <span className="text-primary">Journal</span>
            </h1>
          </div>
          <Button 
            onClick={() => setAdding(!adding)}
            className={`rounded-none font-mono uppercase tracking-widest h-12 px-6 gap-3 transition-all ${
              adding 
                ? "bg-white/10 border-white/20 hover:bg-white/20 text-white" 
                : "bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] hover:shadow-[0_0_25px_rgba(0,212,232,0.5)]"
            }`}
          >
            {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {adding ? "Abort Entry" : "New Log Entry"}
          </Button>
        </motion.div>

        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <Card className="glass-panel border-primary/30 rounded-none relative">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                <CardContent className="p-6">
                  <form onSubmit={handleAdd} className="space-y-4">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-primary uppercase tracking-widest mb-2">
                      <Terminal className="h-3 w-3" /> New Log
                    </div>
                    <Textarea
                      autoFocus
                      placeholder="Enter field observations, intel, or notes..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={6}
                      required
                      className="bg-background/50 border-white/10 rounded-none font-mono text-sm focus-visible:ring-primary focus-visible:border-primary transition-all resize-y"
                    />
                    <div className="flex gap-3 pt-2 border-t border-white/10 mt-4">
                      <Button type="submit" disabled={createNote.isPending} className="flex-1 rounded-none font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground h-12">
                        {createNote.isPending ? "PROCESSING..." : "Record Entry"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => { setAdding(false); setNewContent(""); }} className="w-1/3 rounded-none font-mono uppercase tracking-widest border-white/20 h-12">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full bg-white/5 rounded-none" />)}
          </div>
        ) : notes?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 glass-panel border border-white/10 rounded-none relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5 pattern-grid-lg opacity-20 pointer-events-none" />
            <BookOpen className="h-16 w-16 text-primary/40 mx-auto mb-6" />
            <h3 className="font-serif text-2xl uppercase tracking-widest text-foreground mb-2">No Intel Found</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">No field notes have been recorded for this mission.</p>
            <Button onClick={() => setAdding(true)} className="rounded-none font-mono uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[0_0_15px_rgba(0,212,232,0.3)] h-12 px-8">
              Initialize Log
            </Button>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {notes?.map((note) => (
              <motion.div variants={item} key={note.id}>
                <Card className="glass-panel border-white/10 hover:border-white/20 transition-all rounded-none relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 group-hover:bg-primary/50 transition-colors" />
                  <CardContent className="p-6 md:p-8">
                    {editing?.id === note.id ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 font-mono text-[10px] text-secondary uppercase tracking-widest mb-2">
                          <Edit className="h-3 w-3" /> Modifying Record
                        </div>
                        <Textarea
                          autoFocus
                          value={editing.content}
                          onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                          rows={6}
                          className="bg-background/50 border-secondary/50 rounded-none font-mono text-sm focus-visible:ring-secondary focus-visible:border-secondary transition-all"
                        />
                        <div className="flex gap-3 pt-2">
                          <Button onClick={() => handleUpdate(note.id)} disabled={updateNote.isPending} className="flex-1 rounded-none font-mono uppercase tracking-widest bg-secondary text-secondary-foreground hover:bg-secondary/90 h-10">
                            Apply Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditing(null)} className="w-1/3 rounded-none font-mono uppercase tracking-widest border-white/20 h-10">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            LOGGED: {format(new Date(note.createdAt ?? Date.now()), "MM.dd.yy @ HH:mm")}
                          </span>
                          <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-none border-white/10 hover:bg-white/10 hover:text-primary font-mono text-[10px] uppercase tracking-widest gap-2"
                              onClick={() => setEditing({ id: note.id, content: note.content ?? "" })}
                            >
                              <Edit className="h-3 w-3" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-none border-destructive/30 text-destructive hover:bg-destructive/20 hover:text-destructive hover:border-destructive flex-shrink-0"
                              onClick={() => handleDelete(note.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="prose prose-invert max-w-none">
                          <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{note.content}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
