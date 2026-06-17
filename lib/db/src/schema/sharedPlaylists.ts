import { pgTable, text, timestamp, json } from "drizzle-orm/pg-core";

export const sharedPlaylistsTable = pgTable("shared_playlists", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  icon: text("icon").notNull().default("folder-outline"),
  color: text("color").notNull().default("#6366F1"),
  items: json("items").notNull().$type<Array<{ t: string; u: string }>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SharedPlaylist = typeof sharedPlaylistsTable.$inferSelect;
