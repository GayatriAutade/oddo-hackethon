import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tripsTable } from "./trips";

export const stopsTable = pgTable("stops", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => tripsTable.id, { onDelete: "cascade" }),
  cityName: text("city_name").notNull(),
  country: text("country").notNull(),
  arrivalDate: text("arrival_date"),
  departureDate: text("departure_date"),
  orderIndex: integer("order_index").default(0).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStopSchema = createInsertSchema(stopsTable).omit({ id: true, createdAt: true });
export type InsertStop = z.infer<typeof insertStopSchema>;
export type Stop = typeof stopsTable.$inferSelect;
