import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, notesTable, tripsTable } from "@workspace/db";
import {
  CreateNoteBody, UpdateNoteBody,
  ListNotesParams, CreateNoteParams,
  UpdateNoteParams, DeleteNoteParams,
} from "@workspace/api-zod";
import { requireAuth, getUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/trips/:id/notes", requireAuth, async (req, res): Promise<void> => {
  const params = ListNotesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid trip ID" });
    return;
  }
  const { userId } = getUser(req);
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.id), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const notes = await db.select().from(notesTable).where(eq(notesTable.tripId, params.data.id)).orderBy(notesTable.createdAt);
  res.json(notes);
});

router.post("/trips/:id/notes", requireAuth, async (req, res): Promise<void> => {
  const params = CreateNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid trip ID" });
    return;
  }
  const { userId } = getUser(req);
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.id), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const parsed = CreateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [note] = await db.insert(notesTable).values({ ...parsed.data, tripId: params.data.id }).returning();
  res.status(201).json(note);
});

router.patch("/trips/:id/notes/:noteId", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { userId } = getUser(req);
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.id), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const parsed = UpdateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [note] = await db.update(notesTable).set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(notesTable.id, params.data.noteId), eq(notesTable.tripId, params.data.id))).returning();
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json(note);
});

router.delete("/trips/:id/notes/:noteId", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { userId } = getUser(req);
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.id), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const [note] = await db.delete(notesTable)
    .where(and(eq(notesTable.id, params.data.noteId), eq(notesTable.tripId, params.data.id))).returning();
  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
