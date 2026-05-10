import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, tripsTable, stopsTable, activitiesTable } from "@workspace/db";
import { GetTripBudgetParams } from "@workspace/api-zod";
import { requireAuth, getUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/trips/:id/budget", requireAuth, async (req, res): Promise<void> => {
  const params = GetTripBudgetParams.safeParse(req.params);
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
  const stops = await db.select().from(stopsTable).where(eq(stopsTable.tripId, params.data.id));
  if (stops.length === 0) {
    res.json({ total: 0, perDay: null, byCity: [], byCategory: [] });
    return;
  }
  const stopIds = stops.map((s) => s.id);
  const allActivities = await Promise.all(
    stops.map((s) => db.select().from(activitiesTable).where(eq(activitiesTable.stopId, s.id)))
  );
  const byCity = stops.map((stop, i) => ({
    cityName: stop.cityName,
    amount: allActivities[i].reduce((sum, a) => sum + (a.cost ? Number(a.cost) : 0), 0),
  }));
  const categoryMap: Record<string, number> = {};
  for (const acts of allActivities) {
    for (const a of acts) {
      const cat = a.type ?? "Other";
      categoryMap[cat] = (categoryMap[cat] ?? 0) + (a.cost ? Number(a.cost) : 0);
    }
  }
  const byCategory = Object.entries(categoryMap).map(([category, amount]) => ({ category, amount }));
  const total = byCity.reduce((sum, c) => sum + c.amount, 0);
  let perDay: number | null = null;
  if (trip.startDate && trip.endDate) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    perDay = total / days;
  }
  res.json({ total, perDay, byCity, byCategory });
});

export default router;
