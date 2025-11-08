"use client";

import { useSupabase } from "../supabase-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import ChallengeHistory from "@/components/ChallengeHistory";
import Leaderboard from "@/components/Leaderboard";
import { ShareIcon, TrophyIcon, ClockIcon, FlagIcon, StarIcon } from "@/components/Icons";

interface Challenge {
  id: string;
  prompt: string;
  difficulty: string;
  date: string;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
  total_challenges_completed: number;
}

interface FeedbackData {
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
}

export default function DailyChallenges() {
  const { supabase, user, loading: authLoading } = useSupabase();
  const router = useRouter();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [streak, setStreak] = useState<Streak>({
    current_streak: 0,
    longest_streak: 0,
    total_challenges_completed: 0,
  });
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"challenge" | "history" | "leaderboard">("challenge");

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    transcript: string;
    feedback: FeedbackData | null;
  } | null>(null);
  const [xpEarned, setXpEarned] = useState<number>(0);
  const [totalXP, setTotalXP] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [isRetry, setIsRetry] = useState(false);
  const [retryChallenge, setRetryChallenge] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If not authenticated, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // User is authenticated, fetch the challenge
    fetchDailyChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchDailyChallenge = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/daily-challenge");
      const data = await response.json();

      if (data.ok) {
        setChallenge(data.challenge);
        setCompleted(data.completed);
        setStreak(data.streak);

        if (data.completed && data.attempt) {
          // Show completed attempt
          setAudioUrl(data.attempt.audio_url);
          if (data.attempt.transcript) {
            setResult({
              transcript: data.attempt.transcript,
              feedback: data.attempt.feedback,
            });
          }
        }
      } else {
        console.error("Failed to fetch challenge:", data.error);
      }
    } catch (error) {
      console.error("Error fetching daily challenge:", error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Process the recording
        await processRecording(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimeLeft(180);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not start recording. Please check microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    setProcessing(true);

    try {
      // Step 1: Transcribe
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcribeData = await transcribeRes.json();

      if (!transcribeData.ok) {
        throw new Error("Transcription failed");
      }

      const transcript = transcribeData.transcript;

      // Step 2: Get feedback
      const feedbackRes = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const feedbackData = await feedbackRes.json();
      const feedback = feedbackData.ok ? feedbackData.feedback : null;

      setResult({ transcript, feedback });

      // Step 3: Upload audio to Supabase storage
      if (!user) return;

      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("recordings")
        .upload(fileName, audioBlob, {
          contentType: "audio/webm",
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("recordings")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Step 4: Save challenge attempt
      const challengeId = retryChallenge?.id || challenge?.id;
      const saveRes = await fetch("/api/save-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_id: challengeId,
          audio_url: publicUrl,
          transcript,
          feedback,
          score: feedback?.scores?.fluency || null,
          is_retry: isRetry,
        }),
      });

      const saveData = await saveRes.json();

      if (saveData.ok) {
        setCompleted(true);
        setStreak(saveData.streak);
        setXpEarned(saveData.xp_earned || 0);
        setTotalXP(saveData.total_xp || 0);
        setLevel(saveData.level || 1);
        setShowShareModal(true);
      }
    } catch (error) {
      console.error("Error processing recording:", error);
      alert("Failed to process recording. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRetry = (retryData: any) => {
    setRetryChallenge(retryData);
    setIsRetry(true);
    setCompleted(false);
    setAudioUrl(null);
    setResult(null);
    setActiveTab("challenge");
  };

  const handleShare = async () => {
    const shareText = `I just earned ${xpEarned} XP on Orato! 🎯\nLevel ${level} | Total XP: ${totalXP}\nJoin me in improving your English speaking skills!`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Orato Progress",
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Share cancelled or failed", error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert("Progress copied to clipboard!");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-gray-600">Loading challenge...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Challenge Available</h1>
          <p className="text-gray-600 mb-4">
            There is no challenge available for today. Check back tomorrow!
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.push("/")}
            className="text-blue-500 hover:text-blue-600 mb-4 inline-flex items-center font-medium"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FlagIcon className="w-8 h-8 text-blue-600" />
                Daily Speaking Challenge
              </h1>
              <p className="text-gray-600 mt-2">
                Complete challenges daily to earn XP, build streaks, and climb the leaderboard!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm border border-gray-200"
        >
          <button
            onClick={() => setActiveTab("challenge")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "challenge"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FlagIcon className="w-5 h-5" />
            Today's Challenge
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "history"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ClockIcon className="w-5 h-5" />
            History
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "leaderboard"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <TrophyIcon className="w-5 h-5" />
            Leaderboard
          </button>
        </motion.div>

        {/* Tab Content */}
        {activeTab === "history" && <ChallengeHistory onRetry={handleRetry} />}
        {activeTab === "leaderboard" && <Leaderboard />}
        {activeTab === "challenge" && (
          <div>
            {/* Retry Banner */}
            {isRetry && retryChallenge && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-blue-800">
                      Retry Mode - Previous Score: {retryChallenge.previousScore?.toFixed(1)}/10
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Beat your previous score to earn bonus XP!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsRetry(false);
                      setRetryChallenge(null);
                      fetchDailyChallenge();
                    }}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm border border-blue-200"
                  >
                    Cancel Retry
                  </button>
                </div>
              </motion.div>
            )}

            {/* Streak Info */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-orange-500">
                    {streak.current_streak}
                  </div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-500">
                    {streak.longest_streak}
                  </div>
                  <div className="text-sm text-gray-600">Longest Streak</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-700">
                    {streak.total_challenges_completed}
                  </div>
                  <div className="text-sm text-gray-600">Total Completed</div>
                </div>
              </div>
            </div>

            {/* Challenge Card */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    challenge.difficulty === "easy"
                      ? "bg-green-100 text-green-700"
                      : challenge.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {challenge.difficulty.toUpperCase()}
                </span>
                {completed && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    ✓ Completed
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isRetry && retryChallenge ? retryChallenge.prompt : challenge.prompt}
              </h2>

              {!completed && !audioUrl && (
                <div className="text-center">
                  {!isRecording && (
                    <button
                      onClick={startRecording}
                      className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-lg font-medium"
                    >
                      Start Recording
                    </button>
                  )}

                  {isRecording && (
                    <div>
                      <div className="text-5xl font-bold text-red-500 mb-4">
                        {formatTime(timeLeft)}
                      </div>
                      <button
                        onClick={stopRecording}
                        className="px-8 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-lg font-medium"
                      >
                        Stop Recording
                      </button>
                    </div>
                  )}
                </div>
              )}

              {processing && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing your recording...</p>
                </div>
              )}

              {audioUrl && !processing && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Your Recording
                  </h3>
                  <audio controls className="w-full mb-6">
                    <source src={audioUrl} type="audio/webm" />
                  </audio>

                  {result && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Transcript:
                        </h4>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                          {result.transcript}
                        </p>
                      </div>

                      {result.feedback && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Feedback:
                          </h4>
                          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                            {result.feedback.rating && (
                              <div>
                                <span className="font-medium">Rating: </span>
                                <span className="text-blue-600">
                                  {result.feedback.rating}
                                </span>
                              </div>
                            )}

                            {result.feedback.scores && (
                              <div>
                                <span className="font-medium">Scores:</span>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {Object.entries(result.feedback.scores).map(
                                    ([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="capitalize">{key}:</span>
                                        <span className="font-medium">{value}/10</span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {result.feedback.highlights?.positives && (
                              <div>
                                <span className="font-medium text-green-700">
                                  Positives:
                                </span>
                                <ul className="list-disc list-inside mt-1 text-gray-700">
                                  {result.feedback.highlights.positives.map(
                                    (item, idx) => (
                                      <li key={idx}>{item}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {result.feedback.highlights?.areas_to_improve && (
                              <div>
                                <span className="font-medium text-orange-700">
                                  Areas to Improve:
                                </span>
                                <ul className="list-disc list-inside mt-1 text-gray-700">
                                  {result.feedback.highlights.areas_to_improve.map(
                                    (item, idx) => (
                                      <li key={idx}>{item}</li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                            {result.feedback.advice && (
                              <div>
                                <span className="font-medium">Advice: </span>
                                <span className="text-gray-700">
                                  {result.feedback.advice}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {completed && (
                    <div className="mt-6">
                      {/* XP Earned Card */}
                      {xpEarned > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white mb-4"
                        >
                          <div className="text-center">
                            <StarIcon className="w-12 h-12 mx-auto mb-2" />
                            <h3 className="text-2xl font-bold mb-1">Challenge Complete!</h3>
                            <p className="text-3xl font-extrabold mb-2">+{xpEarned} XP</p>
                            <p className="text-sm opacity-90 mb-4">
                              Level {level} | Total XP: {totalXP}
                            </p>
                            {retryChallenge && result?.feedback?.scores?.fluency && (
                              <div className="bg-white/20 rounded-lg p-3 mb-4">
                                <p className="text-sm font-medium">Score Comparison:</p>
                                <div className="flex items-center justify-center gap-4 mt-2">
                                  <span className="text-lg">
                                    Previous: {retryChallenge.previousScore?.toFixed(1)}
                                  </span>
                                  <span className="text-2xl">→</span>
                                  <span className="text-lg font-bold">
                                    Now: {result.feedback.scores.fluency.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            )}
                            <button
                              onClick={handleShare}
                              className="w-full py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold flex items-center justify-center gap-2"
                            >
                              <ShareIcon className="w-5 h-5" />
                              Share Your Progress
                            </button>
                          </div>
                        </motion.div>
                      )}

                      <div className="text-center bg-green-50 rounded-xl p-6 border border-green-200">
                        <p className="text-green-700 font-medium text-lg mb-4">
                          {isRetry
                            ? "Great job on the retry! Check the leaderboard to see your ranking."
                            : "Challenge completed! Come back tomorrow for a new one."}
                        </p>
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => setActiveTab("history")}
                            className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition border border-blue-200 font-medium"
                          >
                            View History
                          </button>
                          <button
                            onClick={() => setActiveTab("leaderboard")}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                          >
                            View Leaderboard
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
