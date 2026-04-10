import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ result: "", message: "GEMINI_API_KEY is not configured" }, { status: 400 });
  }

  try {
    const { action, text, context } = await request.json();

    let systemInstruction = "";

    switch (action) {
      case "improve":
        systemInstruction = "You are an expert editor. Improve the phrasing, clarity, and grammar of the following text. Do not add conversational padding, return ONLY the improved text.";
        break;
      case "seo":
        systemInstruction = "You are an SEO expert. Read the following article content and generate an engaging, highly-optimized meta description (maximum 160 characters). Do not add conversational padding, return ONLY the meta description string.";
        break;
      case "continue":
        systemInstruction = "You are a professional author. Read the following text which ends abruptly, and seamlessly write the next few sentences or paragraph to continue the thought. Do not prepend the original text. Return ONLY your newly generated continuation.";
        break;
      case "engaging":
        systemInstruction = "You are a luxury copywriter. Rewrite the following text to sound extremely premium, highly engaging, and captivating. Keep the core meaning intact but elevate the vocabulary. Do not add conversational padding, return ONLY the rewritten text.";
        break;
      default:
        return NextResponse.json({ result: "", message: "Invalid action" }, { status: 400 });
    }

    const payload = `${systemInstruction}\n\nCONTENT:\n${text}\n${context ? `\nEXTRA CONTEXT: ${context}` : ''}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: payload }] }],
          generationConfig: {
            temperature: action === 'continue' ? 0.7 : 0.4,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("Gemini error:", err);
      return NextResponse.json({ result: "", message: "Gemini API error" }, { status: 500 });
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ result: resultText.trim() });
  } catch (err: any) {
    console.error("AI composition failed:", err);
    return NextResponse.json({ result: "", message: "AI composition failed" }, { status: 500 });
  }
}
