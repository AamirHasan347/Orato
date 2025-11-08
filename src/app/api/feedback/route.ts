import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      console.error("Feedback API: No transcript provided");
      return NextResponse.json(
        { error: "missing_transcript", detail: "No transcript provided" },
        { status: 400 }
      );
    }

    console.log("Feedback API: Transcript received, length:", transcript.length);

    // Check if API key exists
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("Feedback API: OPENROUTER_API_KEY is not set");
      return NextResponse.json(
        { error: "api_key_missing", detail: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    // Simplified system prompt to reduce token usage and improve reliability
    const systemPrompt = `You are an English teacher providing feedback on spoken English. Respond with valid JSON only (no markdown, no extra text) using this exact structure:
{
  "rating": "Needs Practice" or "Good" or "Excellent",
  "scores": {
    "fluency": 0-10,
    "grammar": 0-10,
    "vocabulary": 0-10,
    "confidence": 0-10
  },
  "highlights": {
    "positives": ["point1", "point2"],
    "areas_to_improve": ["point1", "point2"]
  },
  "advice": "one helpful tip"
}`;

    console.log("Feedback API: Calling OpenRouter with gpt-3.5-turbo");

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Provide feedback for this transcript:\n\n${transcript}` },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    console.log("Feedback API: Received response from OpenRouter");

    const text = response?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!text) {
      console.error("Feedback API: Empty response from AI model");
      return NextResponse.json(
        { error: "empty_response", detail: "AI model returned empty response" },
        { status: 500 }
      );
    }

    console.log("Feedback API: Raw response:", text.substring(0, 200));

    // Try to parse JSON
    try {
      // Remove markdown code blocks if present
      const cleaned = text
        .replace(/^\s*```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();

      // Extract first JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : cleaned;

      const parsed = JSON.parse(jsonStr);
      console.log("Feedback API: Successfully parsed JSON feedback");
      return NextResponse.json({ ok: true, feedback: parsed });
    } catch (parseErr) {
      // JSON parse failed — return raw text as fallback
      console.warn("Feedback API: JSON parse failed, returning raw text");
      console.warn("Parse error:", parseErr);
      return NextResponse.json({ ok: true, feedback: text });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "unknown_error";
    const errorDetails = error instanceof Error ? error.stack : String(error);

    console.error("Feedback API: Error occurred");
    console.error("Error message:", errorMessage);
    console.error("Error details:", errorDetails);

    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
        detail: "Failed to generate feedback. Please check server logs."
      },
      { status: 500 }
    );
  }
}
