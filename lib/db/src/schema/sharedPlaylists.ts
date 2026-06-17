import { pgTable, text, timestamp, json } from "drizzle-orm/pg-core";

export const sharedPlaylistsTable = pgTable("shared_playlists", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  icon: text("icon").notNull().default("folder-outline"),
  color: text("color").notNull().default("#6366F1"),
  items: json("items").notNull().$type<Array<{ t: string; u: string }>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull().$defaultFn(
    () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ),
});

export type SharedPlaylist = typeof sharedPlaylistsTable.$inferSelect;
