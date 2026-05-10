import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tripsTable } from "./trips";

export const packingItemsTable = pgTable("packing_items", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => tripsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category"),
  isPacked: boolean("is_packed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPackingItemSchema = createInsertSchema(packingItemsTable).omit({ id: true, createdAt: true });
export type InsertPackingItem = z.infer<typeof insertPackingItemSchema>;
export type PackingItem = typeof packingItemsTable.$inferSelect;
