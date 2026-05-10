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
import { ArrowLeft, Plus, Trash2, Edit, BookOpen, Check, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
      toast({ title: "Error", description: "Failed to add note", variant: "destructive" });
    }
  };

  const handleUpdate = async (noteId: number) => {
    if (!editing) return;
    try {
      await updateNote.mutateAsync({ id: tripId, noteId, data: { content: editing.content } });
      setEditing(null);
      refresh();
    } catch {
      toast({ title: "Error", description: "Failed to update note", variant: "destructive" });
    }
  };

  const handleDelete = async (noteId: number) => {
    await deleteNote.mutateAsync({ id: tripId, noteId });
    refresh();
  };

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
              <p className="text-muted-foreground text-sm">Trip Journal</p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />Add Note
          </Button>
        </div>

        {adding && (
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleAdd} className="space-y-3">
                <Textarea
                  autoFocus
                  placeholder="What's on your mind about this trip?"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={createNote.isPending} className="gap-2">
                    <Check className="h-4 w-4" />Save
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setAdding(false); setNewContent(""); }}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : notes?.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-6">Start journaling your travel thoughts and ideas</p>
            <Button onClick={() => setAdding(true)}>Write your first note</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {notes?.map((note) => (
              <Card key={note.id} className="group">
                <CardContent className="p-5">
                  {editing?.id === note.id ? (
                    <div className="space-y-3">
                      <Textarea
                        autoFocus
                        value={editing.content}
                        onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdate(note.id)} disabled={updateNote.isPending} className="gap-1.5">
                          <Check className="h-3.5 w-3.5" />Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)} className="gap-1.5">
                          <X className="h-3.5 w-3.5" />Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.createdAt ?? Date.now()), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 gap-1 text-xs"
                            onClick={() => setEditing({ id: note.id, content: note.content ?? "" })}
                          >
                            <Edit className="h-3.5 w-3.5" />Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(note.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
