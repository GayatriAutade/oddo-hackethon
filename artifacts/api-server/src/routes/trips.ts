import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, tripsTable, stopsTable, activitiesTable, usersTable } from "@workspace/db";
import { CreateTripBody, UpdateTripBody, GetTripParams, UpdateTripParams, DeleteTripParams, CopyTripParams } from "@workspace/api-zod";
import { requireAuth, getUser } from "../lib/auth";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(s, 10);
}

async function getTripWithStops(tripId: number) {
  const trip = await db.query.tripsTable.findFirst({
    where: eq(tripsTable.id, tripId),
  });
  if (!trip) return null;
  const stops = await db.query.stopsTable.findMany({
    where: eq(stopsTable.tripId, tripId),
    orderBy: [stopsTable.orderIndex],
  });
  const stopsWithActs = await Promise.all(
    stops.map(async (stop) => {
      const activities = await db.select().from(activitiesTable).where(eq(activitiesTable.stopId, stop.id));
      return {
        ...stop,
        activities: activities.map((a) => ({
          ...a,
          cost: a.cost ? Number(a.cost) : null,
        })),
      };
    })
  );
  const destinationCount = stops.length;
  const totalBudget = stopsWithActs.reduce((sum, s) =>
    sum + s.activities.reduce((asum, a) => asum + (a.cost ?? 0), 0), 0);
  return { ...trip, destinationCount, totalBudget: totalBudget || null, stops: stopsWithActs };
}

async function buildTripSummary(trip: typeof tripsTable.$inferSelect) {
  const stops = await db.select().from(stopsTable).where(eq(stopsTable.tripId, trip.id));
  const destinationCount = stops.length;
  const activities = await db.select().from(activitiesTable).where(
    stops.length > 0 ? sql`${activitiesTable.stopId} = ANY(ARRAY[${sql.join(stops.map(s => sql`${s.id}`), sql`, `)}])` : sql`false`
  );
  const totalBudget = activities.reduce((sum, a) => sum + (a.cost ? Number(a.cost) : 0), 0);
  return { ...trip, destinationCount, totalBudget: totalBudget || null };
}

router.get("/trips", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getUser(req);
  const trips = await db.select().from(tripsTable).where(eq(tripsTable.userId, userId)).orderBy(tripsTable.createdAt);
  const summaries = await Promise.all(trips.map(buildTripSummary));
  res.json(summaries);
});

router.post("/trips", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getUser(req);
  const parsed = CreateTripBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [trip] = await db.insert(tripsTable).values({ ...parsed.data, userId }).returning();
  res.status(201).json({ ...trip, destinationCount: 0, totalBudget: null });
});

router.get("/trips/public", async (_req, res): Promise<void> => {
  const trips = await db.select().from(tripsTable).where(eq(tripsTable.isPublic, true)).orderBy(tripsTable.createdAt);
  const enriched = await Promise.all(trips.map(async (trip) => {
    const [owner] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, trip.userId));
    const summary = await buildTripSummary(trip);
    return { ...summary, ownerName: owner?.name ?? "Anonymous" };
  }));
  res.json(enriched);
});

router.get("/trips/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetTripParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid trip ID" });
    return;
  }
  const { userId } = getUser(req);
  const tripDetail = await getTripWithStops(params.data.id);
  if (!tripDetail) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  if (tripDetail.userId !== userId && !tripDetail.isPublic) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.json(tripDetail);
});

router.patch("/trips/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateTripParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid trip ID" });
    return;
  }
  const { userId } = getUser(req);
  const parsed = UpdateTripBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [trip] = await db.update(tripsTable).set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(tripsTable.id, params.data.id), eq(tripsTable.userId, userId))).returning();
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const summary = await buildTripSummary(trip);
  res.json(summary);
});

router.delete("/trips/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteTripParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid trip ID" });
    return;
  }
  const { userId } = getUser(req);
  const [trip] = await db.delete(tripsTable)
    .where(and(eq(tripsTable.id, params.data.id), eq(tripsTable.userId, userId))).returning();
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/trips/:id/copy", requireAuth, async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  const { userId } = getUser(req);
  const source = await getTripWithStops(id);
  if (!source || !source.isPublic) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  const [newTrip] = await db.insert(tripsTable).values({
    userId,
    name: `Copy of ${source.name}`,
    description: source.description,
    startDate: source.startDate,
    endDate: source.endDate,
    isPublic: false,
  }).returning();
  for (const stop of source.stops) {
    const [newStop] = await db.insert(stopsTable).values({
      tripId: newTrip.id,
      cityName: stop.cityName,
      country: stop.country,
      arrivalDate: stop.arrivalDate,
      departureDate: stop.departureDate,
      orderIndex: stop.orderIndex,
      imageUrl: stop.imageUrl,
    }).returning();
    for (const act of stop.activities) {
      await db.insert(activitiesTable).values({
        stopId: newStop.id,
        name: act.name,
        type: act.type,
        cost: act.cost?.toString(),
        durationMinutes: act.durationMinutes,
        description: act.description,
        imageUrl: act.imageUrl,
      });
    }
  }
  res.status(201).json({ ...newTrip, destinationCount: source.stops.length, totalBudget: null });
});

export default router;
