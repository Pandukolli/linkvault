/**
 * Google Gemini AI client for auto-tagging links.
 * This is OPTIONAL — if no API key is set, AI features are disabled.
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export function isAIEnabled(): boolean {
  return !!GEMINI_API_KEY && GEMINI_API_KEY.length > 0;
}

/**
 * Use Gemini to suggest tags for a link based on its URL, title, and description.
 * Returns an array of tag strings, or empty array if AI is disabled.
 */
export async function suggestTags(
  url: string,
  title: string | null,
  description: string | null
): Promise<string[]> {
  if (!isAIEnabled()) return [];

  try {
    const prompt = `You are a bookmark organizer AI. Given the following link, suggest 3-5 relevant tags for categorization. Return ONLY a JSON array of lowercase tag strings, nothing else.

URL: ${url}
Title: ${title || "Unknown"}
Description: ${description || "No description"}

Example response: ["technology", "programming", "web-development"]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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

    if (!response.ok) return [];

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    // Extract JSON array from response (handles markdown code blocks too)
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) return [];
    
    const tags = JSON.parse(jsonMatch[0]);
    return Array.isArray(tags) ? tags.map((t: string) => t.toLowerCase().trim()) : [];
  } catch {
    console.error("AI tagging failed — falling back to manual tags");
    return [];
  }
}
