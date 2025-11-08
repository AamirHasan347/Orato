import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "no_file", detail: "No audio file received" },
        { status: 400 }
      );
    }

    // Convert the uploaded file into a Buffer (required by Groq)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Send audio to Groq Whisper
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: (() => {
          const fd = new FormData();
          fd.append(
            "file",
            new Blob([buffer], { type: "audio/wav" }),
            "audio.wav"
          );
          fd.append("model", "whisper-large-v3");
          return fd;
        })(),
      }
    );

    const groqJson = await groqRes.json();

    if (!groqRes.ok) {
      console.error("Groq Error:", groqJson);
      return NextResponse.json(
        { error: "groq_failed", detail: groqJson },
        { status: 500 }
      );
    }

    const transcriptText = groqJson.text?.trim() || "";

    return NextResponse.json({
      ok: true,
      transcript: transcriptText,
      feedback: "Recording received and transcribed successfully ✅",
    });
  } catch (err: any) {
    console.error("Server Error:", err);
    return NextResponse.json(
      { error: "server_crash", detail: err?.message || err },
      { status: 500 }
    );
  }
}
