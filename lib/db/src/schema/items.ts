import { pgTable, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const itemsTable = pgTable("items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  categoryId: text("category_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  notes: text("notes").notNull().default(""),
  platform: text("platform").notNull().default("other"),
  thumbnail: text("thumbnail"),
  duration: text("duration"),
  completed: boolean("completed").notNull().default(false),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  position: integer("position").notNull().default(0),
});

export const insertItemSchema = createInsertSchema(itemsTable).omit({
  savedAt: true,
  completedAt: true,
});

export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof itemsTable.$inferSelect;
