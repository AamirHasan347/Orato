// /src/app/api/save-session/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // parse body
    const body = await req.json();
    const { topic, audio_url, feedback } = body;

    // get user
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      console.error("Unauthorized save-session attempt", userErr);
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // simple validation
    if (!audio_url) {
      return NextResponse.json({ error: "missing_audio_url" }, { status: 400 });
    }

    // Insert into recordings table
    const { data, error } = await supabase.from("recordings").insert([
      {
        user_id: user.id,
        topic: topic ?? null,
        audio_url,
        feedback:
          typeof feedback === "string" ? feedback : JSON.stringify(feedback),
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, inserted: data }, { status: 200 });
  } catch (err: any) {
    console.error("save-session route error:", err);
    return NextResponse.json(
      { error: err?.message ?? "unknown_error" },
      { status: 500 }
    );
  }
}
