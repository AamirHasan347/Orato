"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FireIcon, ChartBarIcon, LightBulbIcon } from "@/components/Icons";

interface WelcomeSectionProps {
  userName?: string;
  userEmail?: string;
}

// English tips and motivational quotes
const dailyTips = [
  { type: "tip", content: "Use 'fewer' with countable nouns and 'less' with uncountable nouns." },
  { type: "quote", content: "The limits of my language mean the limits of my world. – Ludwig Wittgenstein" },
  { type: "tip", content: "Practice speaking out loud daily, even if just to yourself!" },
  { type: "quote", content: "Language is the road map of a culture. It tells you where its people come from and where they are going. – Rita Mae Brown" },
  { type: "tip", content: "Remember: 'Effect' is usually a noun, 'Affect' is usually a verb." },
  { type: "quote", content: "Every day is a new opportunity to improve your English speaking skills!" },
  { type: "tip", content: "To sound more natural, use contractions like 'don't' instead of 'do not' in casual speech." },
  { type: "quote", content: "Mistakes are proof that you are trying. Keep practicing!" },
  { type: "tip", content: "Learn phrasal verbs – they're essential for fluent English conversation." },
  { type: "quote", content: "The more that you read, the more things you will know. The more that you learn, the more places you'll go. – Dr. Seuss" },
  { type: "tip", content: "Record yourself speaking to identify areas for improvement." },
  { type: "quote", content: "Consistency is key to mastering any language. Practice every day!" },
  { type: "tip", content: "Use 'who' for people and 'which' or 'that' for things." },
  { type: "quote", content: "Language shapes the way we think and determines what we can think about. – Benjamin Lee Whorf" },
  { type: "tip", content: "Practice active listening by watching English videos with subtitles." }
];

export default function WelcomeSection({ userName, userEmail }: WelcomeSectionProps) {
  const [greeting, setGreeting] = useState("Good day");
  const [streak, setStreak] = useState(5);
  const [xp, setXp] = useState(740);
  const [level, setLevel] = useState(3);
  const [dailyTip, setDailyTip] = useState(dailyTips[0]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Get tip/quote based on day of year for consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const tipIndex = dayOfYear % dailyTips.length;
    setDailyTip(dailyTips[tipIndex]);
  }, []);

  const displayName = userName || userEmail?.split('@')[0] || "Learner";
  const maxXP = 1000;
  const xpPercentage = (xp / maxXP) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-[#0088FF] rounded-3xl p-8 md:p-10 shadow-lg overflow-hidden border border-gray-200"
    >
      {/* Decorative Background Pattern - Subtle circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left: Greeting */}
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
            >
              {greeting}, {displayName}!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg md:text-xl text-white/90"
            >
              Ready to speak <span className="font-semibold">confidently</span> today?
            </motion.p>
          </div>

          {/* Right: Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-6"
          >
            {/* Streak */}
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-5 py-4 rounded-2xl border border-white/30">
              <FireIcon className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-sm text-white/80 font-medium">Streak</p>
                <p className="text-2xl font-bold text-white">{streak} Days</p>
              </div>
            </div>

            {/* Level Badge */}
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-5 py-4 rounded-2xl border border-white/30">
              <ChartBarIcon className="w-8 h-8 text-blue-200" />
              <div>
                <p className="text-sm text-white/80 font-medium">Level</p>
                <p className="text-2xl font-bold text-white">{level}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Bar Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/90 font-medium">Level {level} – Confident Speaker</p>
            <p className="text-white/90 font-medium">{xp} / {maxXP} XP</p>
          </div>

          {/* XP Progress Bar */}
          <div className="relative h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
              className="h-full bg-orange-500 rounded-full shadow-md"
            />
          </div>
        </motion.div>

        {/* Daily Tip/Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/30"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <LightBulbIcon className="w-6 h-6 text-yellow-300" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                {dailyTip.type === "tip" ? "💡 English Tip of the Day" : "✨ Daily Motivation"}
              </p>
              <p className="text-white text-base md:text-lg font-medium leading-relaxed">
                {dailyTip.content}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
