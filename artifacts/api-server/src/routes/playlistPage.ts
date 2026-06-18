import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { sharedPlaylistsTable } from "@workspace/db";
import type { Request, Response } from "express";

const router = Router();

const DOMAIN = "skillsee.replit.app";
const IMAGE_URL = `https://${DOMAIN}/playlist-assets/skillsee-logo.jpeg`;
const EXPO_PORT = process.env["EXPO_WEB_PORT"] ?? "18115";

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildOgTags(title: string, description: string, id?: string): string {
  const url = id
    ? `https://${DOMAIN}/playlist?id=${id}`
    : `https://${DOMAIN}`;
  return [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${IMAGE_URL}" />`,
    `<meta property="og:image:width" content="512" />`,
    `<meta property="og:image:height" content="512" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="SkillSee" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${IMAGE_URL}" />`,
  ].join("\n  ");
}

router.get("/", async (req: Request, res: Response) => {
  const { id } = req.query;

  // 1. Look up playlist data for OG tags
  let ogTitle = "SkillSee Playlist";
  let ogDescription = "Save. Learn. Master. · SkillSee";

  if (id && typeof id === "string") {
    try {
      const [row] = await db
        .select()
        .from(sharedPlaylistsTable)
        .where(eq(sharedPlaylistsTable.id, id));

      if (row && !(row.expiresAt && row.expiresAt < new Date())) {
        const items = Array.isArray(row.items) ? row.items : [];
        const count = items.length;
        const resourceWord = count === 1 ? "resource" : "resources";
        ogTitle = row.title;
        ogDescription = `${count} ${resourceWord} · SkillSee — Save. Learn. Master.`;
      }
    } catch {
      // ignore DB errors, fall through with generic OG
    }
  }

  // 2. Proxy the Expo web SPA and inject OG tags into its <head>
  //    This gives humans the full Expo playlist screen while bots get the OG tags.
  const qs = new URLSearchParams(
    req.query as Record<string, string>
  ).toString();
  const expoUrl = `http://localhost:${EXPO_PORT}/playlist${qs ? "?" + qs : ""}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const upstream = await fetch(expoUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "SkillSeeOGProxy/1.0" },
    });
    clearTimeout(timer);

    if (upstream.ok) {
      let html = await upstream.text();
      const ogTags = buildOgTags(ogTitle, ogDescription, id as string | undefined);
      // Inject right after <head> (or <head ...>)
      html = html.replace(/(<head[^>]*>)/i, `$1\n  ${ogTags}`);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      return res.send(html);
    }
  } catch {
    // Expo server unavailable — fall through to minimal fallback
  }

  // 3. Fallback: minimal page with OG tags + redirect to Expo
  const redirectUrl = id
    ? `https://${DOMAIN}/?from=playlist&id=${id}`
    : `https://${DOMAIN}/`;
  const ogTags = buildOgTags(ogTitle, ogDescription, id as string | undefined);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(ogTitle)} | SkillSee</title>
  ${ogTags}
  <meta http-equiv="refresh" content="0; url=${redirectUrl}" />
</head>
<body>
  <p style="font-family:sans-serif;color:#fff;background:#0f0f1a;padding:32px;text-align:center;">
    Loading playlist…<br><br>
    <a href="${redirectUrl}" style="color:#818cf8;">Open SkillSee</a>
  </p>
</body>
</html>`);
});

export default router;
