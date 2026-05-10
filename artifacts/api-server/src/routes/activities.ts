import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, activitiesTable, stopsTable, tripsTable } from "@workspace/db";
import {
  CreateActivityBody, UpdateActivityBody,
  ListActivitiesParams, CreateActivityParams,
  UpdateActivityParams, DeleteActivityParams,
} from "@workspace/api-zod";
import { requireAuth, getUser } from "../lib/auth";

const router: IRouter = Router();

async function verifyAccess(tripId: number, stopId: number, userId: number) {
  const [trip] = await db.select().from(tripsTable).where(and(eq(tripsTable.id, tripId), eq(tripsTable.userId, userId)));
  if (!trip) return false;
  const [stop] = await db.select().from(stopsTable).where(and(eq(stopsTable.id, stopId), eq(stopsTable.tripId, tripId)));
  return !!stop;
}

function formatActivity(a: typeof activitiesTable.$inferSelect) {
  return { ...a, cost: a.cost ? Number(a.cost) : null };
}

router.get("/trips/:tripId/stops/:stopId/activities", requireAuth, async (req, res): Promise<void> => {
  const params = ListActivitiesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { userId } = getUser(req);
  const ok = await verifyAccess(params.data.tripId, params.data.stopId, userId);
  if (!ok) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  const activities = await db.select().from(activitiesTable).where(eq(activitiesTable.stopId, params.data.stopId));
  res.json(activities.map(formatActivity));
});

router.post("/trips/:tripId/stops/:stopId/activities", requireAuth, async (req, res): Promise<void> => {
  const params = CreateActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { userId } = getUser(req);
  const ok = await verifyAccess(params.data.tripId, params.data.stopId, userId);
  if (!ok) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  const parsed = CreateActivityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { cost, ...rest } = parsed.data;
  const [activity] = await db.insert(activitiesTable).values({
    ...rest,
    stopId: params.data.stopId,
    cost: cost?.toString(),
  }).returning();
  res.status(201).json(formatActivity(activity));
});

router.patch("/trips/:tripId/stops/:stopId/activities/:activityId", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { userId } = getUser(req);
  const ok = await verifyAccess(params.data.tripId, params.data.stopId, userId);
  if (!ok) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  const parsed = UpdateActivityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { cost, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (cost !== undefined) updateData.cost = cost?.toString() ?? null;
  const [activity] = await db.update(activitiesTable).set(updateData)
    .where(and(eq(activitiesTable.id, params.data.activityId), eq(activitiesTable.stopId, params.data.stopId))).returning();
  if (!activity) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.json(formatActivity(activity));
});

router.delete("/trips/:tripId/stops/:stopId/activities/:activityId", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { userId } = getUser(req);
  const ok = await verifyAccess(params.data.tripId, params.data.stopId, userId);
  if (!ok) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  const [act] = await db.delete(activitiesTable)
    .where(and(eq(activitiesTable.id, params.data.activityId), eq(activitiesTable.stopId, params.data.stopId))).returning();
  if (!act) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
