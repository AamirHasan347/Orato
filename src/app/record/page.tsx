"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabase } from "../supabase-provider";
import { useRouter } from "next/navigation";

type AIParsedFeedback = {
  rating?: string;
  scores?: {
    fluency?: number;
    grammar?: number;
    vocabulary?: number;
    confidence?: number;
  };
  highlights?: {
    positives?: string[];
    areas_to_improve?: string[];
  };
  advice?: string;
};

export default function RecordPage() {
  const { supabase, user } = useSupabase();
  const router = useRouter();

  // UI / session state
  const [topic, setTopic] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Media state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  // Results
  const [transcript, setTranscript] = useState<string>("");
  const [feedbackRaw, setFeedbackRaw] = useState<string | null>(null);
  const [feedbackObj, setFeedbackObj] = useState<AIParsedFeedback | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Local topic pool (100 ideas could be moved to separate file; truncated for brevity)
  const topics = [
    "Should students use smartphones in school?",
    "Is homework necessary for learning?",
    "Can money buy happiness?",
    "What makes a person truly successful?",
    "Should animals be kept in zoos?",
    "Is technology making us smarter or lazier?",
    "Are social media platforms good for society?",
    "Should uniforms be mandatory in schools?",
    "Is it better to be kind or honest?",
    "Can AI replace teachers in the future?",
    "Should schools teach financial literacy?",
    "Is climate change the biggest challenge of our time?",
    "Should college education be free?",
    "Is online learning as effective as offline learning?",
    "Should children start learning coding early?",
    "Is space exploration worth the cost?",
    "Should exams be replaced with project assessments?",
    "Are electric cars the future of transport?",
    "Should governments regulate social media?",
    "Is watching TV a waste of time?",
    // ...add up to 100 topics as you like
  ];

  // pick random topic on load
  useEffect(() => {
    const idx = Math.floor(Math.random() * topics.length);
    setTopic(topics[idx]);
  }, []);

  // timer effect
  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      timerRef.current = window.setTimeout(
        () => setTimeLeft((t) => t - 1),
        1000
      );
    }

    if (timeLeft === 0 && isRecording) {
      // auto-stop when timer reaches zero
      stopRecording();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, timeLeft]);

  // helpers to render feedback (object or text)
  const renderFeedback = () => {
    if (!feedbackRaw && !feedbackObj)
      return <p className="text-sm text-gray-500">No feedback yet.</p>;
    if (feedbackObj) {
      return (
        <div className="space-y-2 text-sm text-gray-800">
          <div>
            <strong>Rating:</strong> {feedbackObj.rating ?? "—"}
          </div>
          {feedbackObj.scores && (
            <div>
              <strong>Scores:</strong>
              <ul className="ml-4 list-disc">
                <li>Fluency: {feedbackObj.scores.fluency ?? "-"}/10</li>
                <li>Grammar: {feedbackObj.scores.grammar ?? "-"}/10</li>
                <li>Vocabulary: {feedbackObj.scores.vocabulary ?? "-"}/10</li>
                <li>Confidence: {feedbackObj.scores.confidence ?? "-"}/10</li>
              </ul>
            </div>
          )}
          {feedbackObj.highlights?.positives && (
            <div>
              <strong>Positives:</strong>
              <ul className="ml-4 list-disc">
                {feedbackObj.highlights.positives.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {feedbackObj.highlights?.areas_to_improve && (
            <div>
              <strong>Areas to improve:</strong>
              <ul className="ml-4 list-disc">
                {feedbackObj.highlights.areas_to_improve.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {feedbackObj.advice && (
            <div>
              <strong>Advice:</strong>
              <p>{feedbackObj.advice}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <pre className="whitespace-pre-wrap text-sm text-gray-800">
        {feedbackRaw}
      </pre>
    );
  };

  // start recording
  const startRecording = async () => {
    setTranscript("");
    setFeedbackRaw(null);
    setFeedbackObj(null);
    setAudioUrl(null);
    setTimeLeft(180);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // local preview URL
        const localUrl = URL.createObjectURL(blob);
        setAudioUrl(localUrl);

        // Process: transcribe -> feedback -> upload -> save session
        setLoading(true);
        try {
          // 1) Transcribe
          const form = new FormData();
          form.append("file", blob, "speech.webm");
          const transRes = await fetch("/api/transcribe", {
            method: "POST",
            body: form,
          });

          if (!transRes.ok) {
            console.error("Transcribe API error:", transRes.status, transRes.statusText);
            const errorText = await transRes.text();
            console.error("Transcribe API error details:", errorText);
            alert("Failed to transcribe audio. Please try again.");
            setLoading(false);
            return;
          }

          const transJson = await transRes.json();
          console.log("Transcribe API response:", transJson);

          if (!transJson.ok) {
            console.error("Transcribe API returned error:", transJson);
            alert("Transcription failed. Please try again.");
            setLoading(false);
            return;
          }

          const transcriptText = transJson?.transcript ?? transJson?.text ?? "";
          if (!transcriptText) {
            console.error("No transcript text received");
            alert("Could not transcribe audio. Please speak more clearly and try again.");
            setLoading(false);
            return;
          }

          setTranscript(transcriptText);

          // 2) Send transcript to feedback API
          const fbRes = await fetch("/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript: transcriptText }),
          });

          if (!fbRes.ok) {
            console.error("Feedback API error:", fbRes.status, fbRes.statusText);
            const errorText = await fbRes.text();
            console.error("Feedback API error details:", errorText);
            setFeedbackRaw("Error: Could not get feedback from AI");
          } else {
            const fbJson = await fbRes.json();
            console.log("Feedback API response:", fbJson);

            // Check if response has ok: true
            if (!fbJson.ok) {
              console.error("Feedback API returned error:", fbJson);
              setFeedbackRaw("Error: Feedback generation failed");
            } else {
              const fb = fbJson?.feedback ?? fbJson?.data ?? "";

              // Try to parse feedback JSON (if model returned object)
              if (typeof fb === "string") {
                // attempt to parse JSON string inside
                try {
                  const cleaned = fb
                    .replace(/^\s*```(?:json)?\s*/, "")
                    .replace(/\s*```\s*$/, "")
                    .trim();
                  const match = cleaned.match(/\{[\s\S]*\}/);
                  const jsonStr = match ? match[0] : cleaned;
                  const parsed = JSON.parse(jsonStr);
                  setFeedbackObj(parsed);
                } catch (e) {
                  console.log("Could not parse feedback as JSON, using raw text");
                  setFeedbackRaw(typeof fb === "string" ? fb : JSON.stringify(fb));
                }
              } else if (typeof fb === "object" && fb !== null) {
                setFeedbackObj(fb as AIParsedFeedback);
              } else {
                setFeedbackRaw(String(fb));
              }
            }
          }

          // 3) Upload audio to Supabase Storage (public)
          const fileName = `${user?.id ?? "anon"}/${Date.now()}.webm`;
          const { data: uploadData, error: uploadError } =
            await supabase.storage.from("recordings").upload(fileName, blob, {
              contentType: "audio/webm",
              upsert: false,
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            // still save feedback (without audio_url) or early return
          }

          // Build public URL (public bucket)
          const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(
            /\/$/,
            ""
          );
          const publicUrl = uploadData?.path
            ? `${base}/storage/v1/object/public/recordings/${uploadData.path}`
            : `${base}/storage/v1/object/public/recordings/${fileName}`;

          // 4) Save session server-side
          setSaving(true);
          try {
            const saveRes = await fetch("/api/save-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                topic,
                audio_url: publicUrl,
                feedback: feedbackObj
                  ? JSON.stringify(feedbackObj)
                  : feedbackRaw ?? "",
              }),
            });

            if (!saveRes.ok) {
              console.error("Save-session failed:", await saveRes.text());
            }
          } catch (err) {
            console.error("Save-session network error:", err);
          } finally {
            setSaving(false);
          }
        } catch (err) {
          console.error("Processing error:", err);
        } finally {
          setLoading(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording start failed:", err);
      alert(
        "Could not access microphone. Allow microphone permissions and try again."
      );
    }
  };

  // stop recording
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Reset to try new topic
  const resetForNewTopic = () => {
    setTranscript("");
    setFeedbackRaw(null);
    setFeedbackObj(null);
    setAudioUrl(null);
    setTimeLeft(180);
    const idx = Math.floor(Math.random() * topics.length);
    setTopic(topics[idx]);
  };

  // render feedback (returns JSX)
  const FeedbackBlock = () => {
    return (
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm text-left w-full max-w-2xl">
        <h3 className="font-semibold mb-2">AI Feedback</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Generating feedback…</p>
        ) : saving ? (
          <p className="text-sm text-gray-500">Saving session…</p>
        ) : (
          renderFeedback()
        )}
      </div>
    );
  };

  // Formatting time mm:ss
  const formatTime = (s: number) => {
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
      s % 60
    ).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-start bg-neutral-50 p-6">
      <main className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold text-center mb-4">
            🎙️ SpeakFlow — 3 Minute Practice
          </h1>

          <p className="text-center text-lg font-medium text-gray-800 mb-2">
            {topic}
          </p>

          {isRecording && (
            <div className="flex justify-center mb-4">
              <div className="px-4 py-1 rounded-full bg-white/60 border border-white/30 text-sm">
                ⏱️ {formatTime(timeLeft)}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => (isRecording ? stopRecording() : startRecording())}
              className={`px-6 py-3 rounded-full font-semibold text-white shadow-md transition transform ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-lime-500 hover:bg-lime-600"
              }`}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </button>
          </div>

          {/* Local audio preview */}
          {audioUrl && (
            <div className="mt-6 flex justify-center">
              <audio controls src={audioUrl} />
            </div>
          )}

          {/* Transcript */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Transcript</h3>
            <div className="text-sm text-gray-700 min-h-[48px]">
              {loading ? (
                <span className="text-gray-500">
                  Waiting for transcription…
                </span>
              ) : (
                transcript || (
                  <span className="text-gray-400">No transcript yet.</span>
                )
              )}
            </div>
          </div>

          {/* Feedback */}
          {(feedbackRaw || feedbackObj) && <FeedbackBlock />}

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => router.push("/recordings")}
              className="text-sm px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              View History
            </button>

            <button
              onClick={resetForNewTopic}
              className="text-sm px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
            >
              New Topic
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
