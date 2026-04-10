import { NextRequest, NextResponse } from "next/server";

/**
 * API route for AI-powered tag suggestions using Google Gemini.
 * This is OPTIONAL — returns empty array if GEMINI_API_KEY is not set.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ tags: [], message: "AI tagging not configured" });
  }

  try {
    const { url, title, description } = await request.json();

    const prompt = `You are a bookmark organizer AI. Given the following link, suggest 3-5 relevant tags for categorization. Return ONLY a JSON array of lowercase tag strings, nothing else.

URL: ${url || "Unknown"}
Title: ${title || "Unknown"}
Description: ${description || "No description"}

Example response: ["technology", "programming", "web-development"]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ tags: [], message: "Gemini API error" });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      return NextResponse.json({ tags: [] });
    }

    const tags = JSON.parse(jsonMatch[0]);
    const cleanTags = Array.isArray(tags)
      ? tags.map((t: string) => t.toLowerCase().trim()).filter(Boolean)
      : [];

    return NextResponse.json({ tags: cleanTags });
  } catch {
    return NextResponse.json({ tags: [], message: "AI tagging failed" });
  }
}
