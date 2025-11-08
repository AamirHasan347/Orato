"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ClockIcon, TrophyIcon, StarIcon, ChartBarIcon } from "@/components/Icons";

interface ChallengeAttempt {
  id: string;
  challenge_id: string;
  audio_url: string;
  transcript: string;
  feedback: any;
  score: number;
  xp_earned: number;
  is_retry: boolean;
  created_at: string;
  daily_challenges: {
    id: string;
    prompt: string;
    difficulty: string;
    date: string;
  };
}

interface ChallengeHistoryProps {
  onRetry?: (challenge: any) => void;
}

export default function ChallengeHistory({ onRetry }: ChallengeHistoryProps) {
  const [attempts, setAttempts] = useState<ChallengeAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [selectedAttempt, setSelectedAttempt] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/challenge-history");
      const data = await response.json();

      if (data.ok) {
        setAttempts(data.attempts);
        setTotalXP(data.totalXP);
        setLevel(data.level);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-orange-600";
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your challenge history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* XP Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Your Progress</p>
            <h3 className="text-3xl font-bold">Level {level}</h3>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90 mb-1">Total XP</p>
            <div className="flex items-center gap-2">
              <StarIcon className="w-6 h-6" />
              <span className="text-2xl font-bold">{totalXP}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Level {level}</span>
            <span>Level {level + 1}</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totalXP % 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <p className="text-xs mt-1 opacity-75">{100 - (totalXP % 100)} XP to next level</p>
        </div>
      </motion.div>

      {/* History List */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ClockIcon className="w-6 h-6 text-blue-600" />
          Challenge History ({attempts.length})
        </h3>

        {attempts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <TrophyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No challenges completed yet!</p>
            <p className="text-sm text-gray-500 mt-2">
              Start your first challenge to build your history.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt, index) => (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(
                          attempt.daily_challenges.difficulty
                        )}`}
                      >
                        {attempt.daily_challenges.difficulty.toUpperCase()}
                      </span>
                      {attempt.is_retry && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          RETRY
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(attempt.created_at)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {attempt.daily_challenges.prompt}
                    </h4>
                  </div>
                  <div className="text-right ml-4">
                    {attempt.score && (
                      <div className="flex items-center gap-1 mb-1">
                        <ChartBarIcon className="w-4 h-4 text-gray-400" />
                        <span className={`text-xl font-bold ${getScoreColor(attempt.score)}`}>
                          {attempt.score.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-400">/10</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-purple-600">
                      <StarIcon className="w-3 h-3" />
                      <span className="font-semibold">+{attempt.xp_earned} XP</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <button
                    onClick={() =>
                      setSelectedAttempt(selectedAttempt === attempt.id ? null : attempt.id)
                    }
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedAttempt === attempt.id ? "Hide Details" : "View Details"}
                  </button>

                  {selectedAttempt === attempt.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      {/* Audio Player */}
                      {attempt.audio_url && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">
                            Recording:
                          </h5>
                          <audio controls className="w-full">
                            <source src={attempt.audio_url} type="audio/webm" />
                          </audio>
                        </div>
                      )}

                      {/* Transcript */}
                      {attempt.transcript && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">
                            Transcript:
                          </h5>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {attempt.transcript}
                          </p>
                        </div>
                      )}

                      {/* Retry Button */}
                      {onRetry && (
                        <button
                          onClick={() =>
                            onRetry({
                              id: attempt.challenge_id,
                              prompt: attempt.daily_challenges.prompt,
                              difficulty: attempt.daily_challenges.difficulty,
                              previousScore: attempt.score,
                            })
                          }
                          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm"
                        >
                          Retry This Challenge
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
