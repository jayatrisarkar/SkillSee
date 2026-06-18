import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { sharedPlaylistsTable } from "@workspace/db";
import type { Request, Response } from "express";

const router = Router();

const DOMAIN = "skillsee.replit.app";
const IMAGE_URL = `https://${DOMAIN}/playlist-assets/skillsee-logo.jpeg`;

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(opts: {
  title: string;
  count: number;
  id: string;
  color: string;
  items: Array<{ t: string; u: string }>;
}): string {
  const { title, count, id, color, items } = opts;
  const playlistUrl = id
    ? `https://${DOMAIN}/playlist?id=${id}`
    : `https://${DOMAIN}`;
  const resourceWord = count === 1 ? "resource" : "resources";
  const deepLink = id ? `skillsee://playlist?id=${id}` : "skillsee://";
  const appStoreUrl = "https://apps.apple.com/app/id000000000";
  const playStoreUrl =
    "https://play.google.com/store/apps/details?id=com.skillsee.app";

  const itemsHtml = items
    .slice(0, 8)
    .map(
      (it) => `
    <div class="item">
      <div class="item-icon">▶</div>
      <div class="item-title">${esc(it.t || "Untitled")}</div>
    </div>`
    )
    .join("");

  const moreHtml =
    items.length > 8
      ? `<div class="more">+${items.length - 8} more resources</div>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} | SkillSee</title>

  <!-- Open Graph / WhatsApp / iMessage -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${count} ${resourceWord} · SkillSee — Save. Learn. Master." />
  <meta property="og:image" content="${IMAGE_URL}" />
  <meta property="og:image:width" content="512" />
  <meta property="og:image:height" content="512" />
  <meta property="og:url" content="${playlistUrl}" />
  <meta property="og:site_name" content="SkillSee" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${count} ${resourceWord} · SkillSee" />
  <meta name="twitter:image" content="${IMAGE_URL}" />

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f0f1a;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }
    .card {
      background: linear-gradient(160deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 24px;
      padding: 32px 28px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 24px 80px rgba(99,102,241,0.2);
    }
    .logo-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 28px;
    }
    .logo-img {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      object-fit: cover;
    }
    .logo-name {
      font-size: 15px;
      font-weight: 700;
      color: #a5b4fc;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .playlist-title {
      font-size: 26px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 6px;
      background: linear-gradient(135deg, #818cf8, #c084fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .playlist-meta {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 24px;
    }
    .items-list {
      background: rgba(255,255,255,0.04);
      border-radius: 14px;
      padding: 4px 0;
      margin-bottom: 24px;
      overflow: hidden;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .item:last-child { border-bottom: none; }
    .item-icon { font-size: 11px; color: #6366f1; flex-shrink: 0; }
    .item-title {
      font-size: 14px;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .more {
      text-align: center;
      font-size: 13px;
      color: #64748b;
      padding: 10px 0 4px;
    }
    .btn-open {
      display: block;
      width: 100%;
      padding: 15px;
      border: none;
      border-radius: 14px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      margin-bottom: 12px;
      letter-spacing: 0.01em;
    }
    .store-row {
      display: flex;
      gap: 8px;
    }
    .btn-store {
      flex: 1;
      display: block;
      padding: 11px 8px;
      border: 1px solid rgba(99,102,241,0.4);
      border-radius: 12px;
      color: #a5b4fc;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-row">
      <img class="logo-img" src="/playlist-assets/skillsee-logo.jpeg" alt="SkillSee" />
      <span class="logo-name">SkillSee</span>
    </div>

    <div class="playlist-title">${esc(title)}</div>
    <div class="playlist-meta">Playlist · SkillSee · ${count} ${resourceWord}</div>

    ${items.length > 0 ? `<div class="items-list">${itemsHtml}</div>${moreHtml}` : ""}

    <a class="btn-open" href="${deepLink}"
       onclick="setTimeout(function(){ window.location.href = '${playStoreUrl}'; }, 1500);">
      Open in SkillSee
    </a>

    <div class="store-row">
      <a class="btn-store" href="${appStoreUrl}">App Store</a>
      <a class="btn-store" href="${playStoreUrl}">Google Play</a>
    </div>
  </div>
</body>
</html>`;
}

router.get("/", async (req: Request, res: Response) => {
  const { id } = req.query;

  if (id && typeof id === "string") {
    try {
      const [row] = await db
        .select()
        .from(sharedPlaylistsTable)
        .where(eq(sharedPlaylistsTable.id, id));

      if (row && !(row.expiresAt && row.expiresAt < new Date())) {
        const items = Array.isArray(row.items) ? row.items : [];
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(
          buildHtml({
            title: row.title,
            count: items.length,
            id,
            color: row.color,
            items,
          })
        );
        return;
      }
    } catch {
      // fall through to generic
    }
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(
    buildHtml({
      title: "SkillSee Playlist",
      count: 0,
      id: "",
      color: "#6366F1",
      items: [],
    })
  );
});

export default router;
