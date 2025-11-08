// /src/app/recordings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "../supabase-provider";
import { useRouter } from "next/navigation";

type RecordingRow = {
  id: string;
  user_id?: string;
  topic?: string | null;
  audio_url?: string | null;
  feedback?: string | null;
  created_at?: string | null;
};

export default function RecordingsPage() {
  const { supabase, user } = useSupabase();
  const router = useRouter();
  const [recordings, setRecordings] = useState<RecordingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
      return;
    }
    fetchRecordings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchRecordings() {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("recordings")
        .select("id, topic, audio_url, feedback, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching recordings:", error);
        setRecordings([]);
      } else {
        setRecordings(data as RecordingRow[]);
      }
    } catch (err) {
      console.error("Unexpected fetch error:", err);
      setRecordings([]);
    } finally {
      setLoading(false);
    }
  }

  // Helper: get playable src. If audio_url looks like a full URL, use it directly.
  const getAudioSrc = (audio_url?: string | null) => {
    if (!audio_url) return null;
    const trimmed = audio_url.trim();
    if (trimmed.startsWith("http")) return trimmed;
    // otherwise assume it's a storage path (like "userId/123_filename.webm")
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    if (!base) return trimmed;
    return `${base}/storage/v1/object/public/recordings/${trimmed}`;
  };

  if (loading) {
    return <p className="p-8">Loading recordings...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your SpeakFlow History</h1>

      {recordings.length === 0 ? (
        <p className="text-gray-600">No recordings found. Start SpeakFlow!</p>
      ) : (
        <div className="space-y-6">
          {recordings.map((rec) => (
            <div key={rec.id} className="bg-white rounded-xl p-5 shadow">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500">
                      {rec.created_at
                        ? new Date(rec.created_at).toLocaleString()
                        : ""}
                    </div>
                    <div className="text-sm text-gray-700 font-semibold">
                      {rec.topic ?? "Untitled topic"}
                    </div>
                  </div>

                  <div className="mb-3">
                    {getAudioSrc(rec.audio_url) ? (
                      <audio
                        controls
                        src={getAudioSrc(rec.audio_url) ?? undefined}
                      />
                    ) : (
                      <div className="text-sm text-gray-500">
                        No audio available
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">AI Feedback</h3>

                    {rec.feedback ? (
                      // try to detect JSON string
                      (() => {
                        try {
                          const parsed = JSON.parse(rec.feedback);
                          // Render structured JSON if it matches expected shape
                          const p: any = parsed;
                          const hasStructured =
                            p &&
                            (p.rating || p.scores || p.highlights || p.advice);
                          if (hasStructured) {
                            return (
                              <div className="text-sm text-gray-700 space-y-2">
                                {p.rating && (
                                  <div>
                                    <strong>Rating:</strong> {p.rating}
                                  </div>
                                )}
                                {p.scores && (
                                  <div>
                                    <strong>Scores:</strong>
                                    <ul className="ml-4 list-disc">
                                      <li>
                                        Fluency: {p.scores.fluency ?? "-"}/10
                                      </li>
                                      <li>
                                        Grammar: {p.scores.grammar ?? "-"}/10
                                      </li>
                                      <li>
                                        Vocabulary: {p.scores.vocabulary ?? "-"}
                                        /10
                                      </li>
                                      <li>
                                        Confidence: {p.scores.confidence ?? "-"}
                                        /10
                                      </li>
                                    </ul>
                                  </div>
                                )}
                                {p.highlights?.positives && (
                                  <div>
                                    <strong>Positives:</strong>
                                    <ul className="ml-4 list-disc">
                                      {p.highlights.positives.map(
                                        (x: string, i: number) => (
                                          <li key={i}>{x}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                                {p.highlights?.areas_to_improve && (
                                  <div>
                                    <strong>Areas to improve:</strong>
                                    <ul className="ml-4 list-disc">
                                      {p.highlights.areas_to_improve.map(
                                        (x: string, i: number) => (
                                          <li key={i}>{x}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                                {p.advice && (
                                  <div>
                                    <strong>Advice:</strong>
                                    <p>{p.advice}</p>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        } catch (e) {
                          // not JSON — fall back to plain text
                        }
                        return (
                          <pre className="whitespace-pre-wrap text-sm text-gray-700">
                            {rec.feedback}
                          </pre>
                        );
                      })()
                    ) : (
                      <div className="text-sm text-gray-500">
                        No feedback saved.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
