"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { TrophyIcon, StarIcon, FireIcon, UserIcon } from "@/components/Icons";

interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
  level: number;
  period_xp?: number;
  users: {
    email: string;
    user_metadata: {
      name?: string;
    };
  };
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"all" | "week" | "month">("all");
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard?period=${period}`);
      const data = await response.json();

      if (data.ok) {
        setLeaderboard(data.leaderboard);
        setUserRank(data.userRank);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case 2:
        return "bg-gray-100 text-gray-700 border-gray-300";
      case 3:
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return "bg-white text-gray-700 border-gray-200";
    }
  };

  const getDisplayName = (entry: LeaderboardEntry) => {
    return (
      entry.users?.user_metadata?.name ||
      entry.users?.email?.split("@")[0] ||
      "Anonymous"
    );
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPeriod("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            period === "all"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setPeriod("week")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            period === "week"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            period === "month"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
          }`}
        >
          This Month
        </button>
      </div>

      {/* User Rank Card */}
      {userRank && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-5 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrophyIcon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm opacity-90">Your Rank</p>
                <p className="text-2xl font-bold">{getRankBadge(userRank)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Keep climbing!</p>
              <p className="text-xs opacity-75 mt-1">
                {userRank > 3 && `${userRank - 3} spots from top 3`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrophyIcon className="w-6 h-6 text-blue-600" />
            Top Learners
            {period === "week" && " - This Week"}
            {period === "month" && " - This Month"}
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <FireIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No data available for this period</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const displayXP = period === "all" ? entry.total_xp : entry.period_xp || 0;

              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    rank <= 3 ? "bg-gradient-to-r from-gray-50/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Rank Badge */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${getRankColor(
                        rank
                      )}`}
                    >
                      {rank <= 3 ? getRankBadge(rank) : rank}
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {getDisplayName(entry)}
                        </p>
                        <p className="text-xs text-gray-500">Level {entry.level}</p>
                      </div>
                    </div>
                  </div>

                  {/* XP Display */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-purple-600">
                      <StarIcon className="w-5 h-5" />
                      <span className="font-bold text-lg">{displayXP}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {period === "all" ? "Total XP" : "Period XP"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Motivational Footer */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-blue-800 text-center">
          <span className="font-semibold">Pro Tip:</span> Complete daily challenges to earn XP
          and climb the leaderboard!
        </p>
      </div>
    </div>
  );
}
