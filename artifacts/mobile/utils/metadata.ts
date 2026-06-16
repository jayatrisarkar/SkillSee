export interface UrlMetadata {
  title?: string;
  thumbnailUrl?: string;
  description?: string;
  platform?: string;
}

function detectPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
  if (lower.includes("instagram.com")) return "Instagram";
  if (lower.includes("tiktok.com")) return "TikTok";
  if (lower.includes("facebook.com") || lower.includes("fb.com") || lower.includes("fb.watch")) return "Facebook";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "X (Twitter)";
  if (lower.includes("vimeo.com")) return "Vimeo";
  return "";
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\s]+)/,
    /youtu\.be\/([^?\s]+)/,
    /youtube\.com\/shorts\/([^?\s\/]+)/,
    /youtube\.com\/embed\/([^?\s]+)/,
  ];
  for (const pat of patterns) {
    const m = url.match(pat);
    if (m) return m[1];
  }
  return null;
}

async function fetchWithTimeout(url: string, ms = 6000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchUrlMetadata(rawUrl: string): Promise<UrlMetadata> {
  const url = rawUrl.trim();
  if (!url || !url.startsWith("http")) return {};

  const platform = detectPlatform(url);
  const result: UrlMetadata = { platform: platform || undefined };

  try {
    const encodedUrl = encodeURIComponent(url);

    const ytId = extractYouTubeId(url);
    if (ytId) {
      result.thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    const noembedRes = await fetchWithTimeout(
      `https://noembed.com/embed?url=${encodedUrl}`
    );

    if (noembedRes.ok) {
      const data = await noembedRes.json();
      if (data && !data.error) {
        if (data.title) result.title = data.title;
        if (data.thumbnail_url) result.thumbnailUrl = data.thumbnail_url;
        if (data.author_name) {
          result.description = `By ${data.author_name}${platform ? ` · ${platform}` : ""}`;
        }
        return result;
      }
    }
  } catch {}

  if (platform === "YouTube") {
    try {
      const oembedRes = await fetchWithTimeout(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        if (data.title) result.title = data.title;
        if (data.thumbnail_url) result.thumbnailUrl = data.thumbnail_url;
        if (data.author_name) result.description = `By ${data.author_name} · YouTube`;
      }
    } catch {}
  }

  if (platform === "TikTok") {
    try {
      const oembedRes = await fetchWithTimeout(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        if (data.title) result.title = data.title;
        if (data.thumbnail_url) result.thumbnailUrl = data.thumbnail_url;
        if (data.author_name) result.description = `By ${data.author_name} · TikTok`;
      }
    } catch {}
  }

  return result;
}
