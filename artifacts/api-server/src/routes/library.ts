import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { categoriesTable, itemsTable } from "@workspace/db";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";

const router = Router();

// ─── Categories ──────────────────────────────────────────────────────────────

router.get("/categories", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  try {
    const categories = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, userId));
    res.json(categories);
  } catch (err) {
    req.log.error(err, "Failed to fetch categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/categories", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { id, name, icon, color, isDefault } = req.body;
  if (!id || !name) {
    res.status(400).json({ error: "id and name are required" });
    return;
  }
  try {
    const [row] = await db
      .insert(categoriesTable)
      .values({ id, userId, name, icon: icon ?? "folder-outline", color: color ?? "#6366f1", isDefault: isDefault ?? false })
      .onConflictDoUpdate({
        target: categoriesTable.id,
        set: { name, icon, color, isDefault, updatedAt: new Date() },
      })
      .returning();
    res.json(row);
  } catch (err) {
    req.log.error(err, "Failed to upsert category");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/categories/:id", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { name, icon, color, isDefault } = req.body;
  const catId = String(req.params.id);
  try {
    const [row] = await db
      .update(categoriesTable)
      .set({ name, icon, color, isDefault, updatedAt: new Date() })
      .where(and(eq(categoriesTable.id, catId), eq(categoriesTable.userId, userId)))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    req.log.error(err, "Failed to update category");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/categories/:id", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const catId = String(req.params.id);
  try {
    await db
      .delete(categoriesTable)
      .where(and(eq(categoriesTable.id, catId), eq(categoriesTable.userId, userId)));
    res.json({ ok: true });
  } catch (err) {
    req.log.error(err, "Failed to delete category");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Items ────────────────────────────────────────────────────────────────────

router.get("/items", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  try {
    const items = await db
      .select()
      .from(itemsTable)
      .where(eq(itemsTable.userId, userId));
    res.json(items);
  } catch (err) {
    req.log.error(err, "Failed to fetch items");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/items", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { id, categoryId, title, url, notes, platform, thumbnail, duration, completed, position } = req.body;
  if (!id || !categoryId || !title || !url) {
    res.status(400).json({ error: "id, categoryId, title, and url are required" });
    return;
  }
  try {
    const [row] = await db
      .insert(itemsTable)
      .values({ id, userId, categoryId, title, url, notes: notes ?? "", platform: platform ?? "other", thumbnail, duration, completed: completed ?? false, position: position ?? 0 })
      .onConflictDoUpdate({
        target: itemsTable.id,
        set: { categoryId, title, url, notes, platform, thumbnail, duration, completed, position },
      })
      .returning();
    res.json(row);
  } catch (err) {
    req.log.error(err, "Failed to upsert item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/items/:id", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { categoryId, title, url, notes, platform, thumbnail, duration, completed, completedAt, position } = req.body;
  const itemId = String(req.params.id);
  try {
    const [row] = await db
      .update(itemsTable)
      .set({ categoryId, title, url, notes, platform, thumbnail, duration, completed, completedAt: completedAt ? new Date(completedAt) : undefined, position })
      .where(and(eq(itemsTable.id, itemId), eq(itemsTable.userId, userId)))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err) {
    req.log.error(err, "Failed to update item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/items/:id", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const itemId = String(req.params.id);
  try {
    await db
      .delete(itemsTable)
      .where(and(eq(itemsTable.id, itemId), eq(itemsTable.userId, userId)));
    res.json({ ok: true });
  } catch (err) {
    req.log.error(err, "Failed to delete item");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Full sync (pull everything at once) ─────────────────────────────────────

router.get("/sync", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  try {
    const [categories, items] = await Promise.all([
      db.select().from(categoriesTable).where(eq(categoriesTable.userId, userId)),
      db.select().from(itemsTable).where(eq(itemsTable.userId, userId)),
    ]);
    res.json({ categories, items });
  } catch (err) {
    req.log.error(err, "Failed to sync library");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Bulk push (push local data to cloud on first sign-in) ───────────────────

router.post("/sync", requireAuth, async (req: Request, res: Response) => {
  const { userId } = req as AuthedRequest;
  const { categories = [], items = [] } = req.body;
  try {
    if (categories.length > 0) {
      await db.insert(categoriesTable)
        .values(categories.map((c: any) => ({ ...c, userId })))
        .onConflictDoNothing();
    }
    if (items.length > 0) {
      await db.insert(itemsTable)
        .values(items.map((i: any) => ({ ...i, userId })))
        .onConflictDoNothing();
    }
    res.json({ ok: true });
  } catch (err) {
    req.log.error(err, "Failed to bulk sync");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
