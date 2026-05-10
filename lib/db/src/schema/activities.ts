import { pgTable, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { stopsTable } from "./stops";

export const activitiesTable = pgTable("activities", {
  id: serial("id").primaryKey(),
  stopId: integer("stop_id").notNull().references(() => stopsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type"),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  durationMinutes: integer("duration_minutes"),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activitiesTable).omit({ id: true, createdAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activitiesTable.$inferSelect;
