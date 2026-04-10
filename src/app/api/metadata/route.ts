import { NextRequest, NextResponse } from "next/server";

/**
 * API route that fetches metadata from a URL (title, description, favicon, og:image).
 * Used when saving a new link to auto-fill fields.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkVault/1.0; +https://linkvault.app)",
      },
    });

    clearTimeout(timeout);

    const html = await response.text();

    // Parse title
    const titleMatch =
      html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ||
      html.match(/<meta[^>]*name="title"[^>]*content="([^"]*)"/) ||
      html.match(/<title[^>]*>([^<]*)<\/title>/);
    const title = titleMatch ? decodeHTMLEntities(titleMatch[1]) : null;

    // Parse description
    const descMatch =
      html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/) ||
      html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/) ||
      html.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"/);
    const description = descMatch ? decodeHTMLEntities(descMatch[1]) : null;

    // Parse og:image
    const imageMatch =
      html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/) ||
      html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"/);
    let image_url = imageMatch ? imageMatch[1] : null;

    // Make relative image URLs absolute
    if (image_url && !image_url.startsWith("http")) {
      const base = new URL(url);
      image_url = new URL(image_url, base.origin).href;
    }

    // Parse favicon
    const faviconMatch =
      html.match(/<link[^>]*rel="(?:shortcut )?icon"[^>]*href="([^"]*)"/) ||
      html.match(/<link[^>]*href="([^"]*)"[^>]*rel="(?:shortcut )?icon"/);
    let favicon = faviconMatch ? faviconMatch[1] : null;

    // Make relative favicon URLs absolute
    if (favicon && !favicon.startsWith("http")) {
      const base = new URL(url);
      favicon = new URL(favicon, base.origin).href;
    }

    // Fallback favicon
    if (!favicon) {
      const base = new URL(url);
      favicon = `${base.origin}/favicon.ico`;
    }

    return NextResponse.json({
      title,
      description,
      image_url,
      favicon,
    });
  } catch {
    return NextResponse.json(
      { title: null, description: null, image_url: null, favicon: null },
      { status: 200 }
    );
  }
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}
