import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, stopsTable, tripsTable } from "@workspace/db";
import { CreateStopBody, UpdateStopBody, ListStopsParams, CreateStopParams, UpdateStopParams, DeleteStopParams } from "@workspace/api-zod";
import { requireAuth, getUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/trips/:tripId/stops", requireAuth, async (req, res): Promise<void> => {
  const params = ListStopsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid trip ID" });
    return;
  }
  const { userId } = getUser(req);
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const stops = await db.select().from(stopsTable).where(eq(stopsTable.tripId, params.data.tripId)).orderBy(stopsTable.orderIndex);
  res.json(stops);
});

router.post("/trips/:tripId/stops", requireAuth, async (req, res): Promise<void> => {
  const params = CreateStopParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid trip ID" });
    return;
  }
  const { userId } = getUser(req);
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const parsed = CreateStopBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [stop] = await db.insert(stopsTable).values({ ...parsed.data, tripId: params.data.tripId }).returning();
  res.status(201).json(stop);
});

router.patch("/trips/:tripId/stops/:stopId", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateStopParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { userId } = getUser(req);
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const parsed = UpdateStopBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [stop] = await db.update(stopsTable).set(parsed.data)
    .where(and(eq(stopsTable.id, params.data.stopId), eq(stopsTable.tripId, params.data.tripId))).returning();
  if (!stop) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  res.json(stop);
});

router.delete("/trips/:tripId/stops/:stopId", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteStopParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { userId } = getUser(req);
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, params.data.tripId), eq(tripsTable.userId, userId)));
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const [stop] = await db.delete(stopsTable)
    .where(and(eq(stopsTable.id, params.data.stopId), eq(stopsTable.tripId, params.data.tripId))).returning();
  if (!stop) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
