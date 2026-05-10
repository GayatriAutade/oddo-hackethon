import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, tripsTable, stopsTable, activitiesTable } from "@workspace/db";
import { requireAuth, getUser } from "../lib/auth";

const POPULAR = [
  { name: "Paris", country: "France", region: "Europe", description: "The City of Light.", imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400", popularityScore: 9.8, avgDailyCostUsd: 180 },
  { name: "Tokyo", country: "Japan", region: "Asia", description: "Ancient temples meet futuristic tech.", imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400", popularityScore: 9.7, avgDailyCostUsd: 150 },
  { name: "Bali", country: "Indonesia", region: "Asia", description: "Tropical paradise.", imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400", popularityScore: 8.7, avgDailyCostUsd: 55 },
  { name: "Barcelona", country: "Spain", region: "Europe", description: "Sun, art, and architecture.", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400", popularityScore: 9.4, avgDailyCostUsd: 130 },
];

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getUser(req);
  const trips = await db.select().from(tripsTable).where(eq(tripsTable.userId, userId)).orderBy(tripsTable.createdAt);
  const today = new Date().toISOString().split("T")[0];
  const upcomingTrips = trips.filter((t) => t.startDate && t.startDate >= today).length;
  const stops = trips.length > 0
    ? await db.select().from(stopsTable).where(
        sql`${stopsTable.tripId} = ANY(ARRAY[${sql.join(trips.map((t) => sql`${t.id}`), sql`, `)}]::integer[])`
      )
    : [];
  const totalCitiesVisited = stops.length;
  const activities = stops.length > 0
    ? await db.select().from(activitiesTable).where(
        sql`${activitiesTable.stopId} = ANY(ARRAY[${sql.join(stops.map((s) => sql`${s.id}`), sql`, `)}]::integer[])`
      )
    : [];
  const totalActivities = activities.length;
  const totalBudgetPlanned = activities.reduce((sum, a) => sum + (a.cost ? Number(a.cost) : 0), 0);
  const recentTrips = trips.slice(-5).reverse().map((t) => ({
    ...t,
    destinationCount: stops.filter((s) => s.tripId === t.id).length,
    totalBudget: null,
  }));
  res.json({
    totalTrips: trips.length,
    upcomingTrips,
    totalCitiesVisited,
    totalActivities,
    totalBudgetPlanned,
    recentTrips,
    popularDestinations: POPULAR,
  });
});

export default router;
