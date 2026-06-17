import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { sharedPlaylistsTable } from "@workspace/db";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { title, icon, color, items } = req.body;
  if (!title || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "title and items are required" });
    return;
  }
  try {
    const id = randomUUID().replace(/-/g, "").slice(0, 12);
    await db.insert(sharedPlaylistsTable).values({
      id,
      title: String(title),
      icon: String(icon ?? "folder-outline"),
      color: String(color ?? "#6366F1"),
      items: items.map((it: any) => ({ t: String(it.t ?? ""), u: String(it.u ?? "") })),
    });
    res.json({ id });
  } catch (err) {
    req.log.error(err, "Failed to create shared playlist");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [row] = await db
      .select()
      .from(sharedPlaylistsTable)
      .where(eq(sharedPlaylistsTable.id, String(id)));
    if (!row) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }
    if (row.expiresAt && row.expiresAt < new Date()) {
      res.status(404).json({ error: "Playlist expired" });
      return;
    }
    res.json(row);
  } catch (err) {
    req.log.error(err, "Failed to fetch shared playlist");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
