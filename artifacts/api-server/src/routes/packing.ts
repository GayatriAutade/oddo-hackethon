import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, packingItemsTable, tripsTable } from "@workspace/db";
import {
  CreatePackingItemBody, UpdatePackingItemBody,
  ListPackingItemsParams, CreatePackingItemParams,
  UpdatePackingItemParams, DeletePackingItemParams,
} from "@workspace/api-zod";
import { requireAuth, getUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/trips/:id/packing", requireAuth, async (req, res): Promise<void> => {
  const params = ListPackingItemsParams.safeParse(req.params);
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
  const items = await db.select().from(packingItemsTable).where(eq(packingItemsTable.tripId, params.data.id)).orderBy(packingItemsTable.createdAt);
  res.json(items);
});

router.post("/trips/:id/packing", requireAuth, async (req, res): Promise<void> => {
  const params = CreatePackingItemParams.safeParse(req.params);
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
  const parsed = CreatePackingItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(packingItemsTable).values({ ...parsed.data, tripId: params.data.id }).returning();
  res.status(201).json(item);
});

router.patch("/trips/:id/packing/:itemId", requireAuth, async (req, res): Promise<void> => {
  const params = UpdatePackingItemParams.safeParse(req.params);
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
  const parsed = UpdatePackingItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.update(packingItemsTable).set(parsed.data)
    .where(and(eq(packingItemsTable.id, params.data.itemId), eq(packingItemsTable.tripId, params.data.id))).returning();
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(item);
});

router.delete("/trips/:id/packing/:itemId", requireAuth, async (req, res): Promise<void> => {
  const params = DeletePackingItemParams.safeParse(req.params);
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
  const [item] = await db.delete(packingItemsTable)
    .where(and(eq(packingItemsTable.id, params.data.itemId), eq(packingItemsTable.tripId, params.data.id))).returning();
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
