"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "./supabase-provider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Icons
import {
  MicrophoneIcon,
  ChatBubbleLeftRightIcon,
  FilmIcon,
  DocumentTextIcon,
  LightBulbIcon,
  BookmarkSquareIcon,
  ChartBarIcon,
  RocketLaunchIcon
} from "@/components/Icons";

// Components
import Sidebar from "@/components/Sidebar";
import WelcomeSection from "@/components/WelcomeSection";
import SkillSummaryCards from "@/components/SkillSummaryCards";
import PracticeFeatureCard from "@/components/PracticeFeatureCard";
import CoachCorner from "@/components/CoachCorner";
import JourneyTracker from "@/components/JourneyTracker";
import ExploreSection from "@/components/ExploreSection";
import TopUtilityButtons from "@/components/TopUtilityButtons";
import WordOfDayModal from "@/components/WordOfDayModal";
import ChatInterface from "@/components/ChatInterface";

export default function DashboardPage() {
  const { supabase, user, loading } = useSupabase();
  const router = useRouter();
  const [showWordModal, setShowWordModal] = useState(false);
  const [hasNewWord, setHasNewWord] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // If not authenticated, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user has seen today's word
    checkWordOfDay();
  }, [user, loading, router]);

  const checkWordOfDay = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastSeenDate = localStorage.getItem('wordOfDayLastSeen');

    if (lastSeenDate !== today) {
      // User hasn't seen today's word yet
      setHasNewWord(true);
      // Auto-show the modal after a short delay for better UX
      setTimeout(() => {
        setShowWordModal(true);
      }, 2000);
    }
  };

  const handleCloseModal = () => {
    setShowWordModal(false);
    // Mark today's word as seen
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('wordOfDayLastSeen', today);
    setHasNewWord(false);
  };

  const handleOpenModal = () => {
    setShowWordModal(true);
    // Mark as seen when user manually opens it
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('wordOfDayLastSeen', today);
    setHasNewWord(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-[#0088FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const practiceFeatures = [
    {
      icon: MicrophoneIcon,
      title: "AI Speech Practice",
      description: "Record yourself speaking and get instant AI-powered feedback on fluency and pronunciation.",
      borderColor: "border-green-500",
      iconColor: "text-green-600",
      href: "/record"
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Daily Speaking Challenge",
      description: "Complete today's challenge and improve your conversational skills with real-world topics.",
      borderColor: "border-orange-500",
      iconColor: "text-orange-600",
      href: "/challenges"
    },
    {
      icon: FilmIcon,
      title: "Real-Life Scenarios",
      description: "Practice speaking in real-world situations like job interviews, meetings, and casual conversations.",
      borderColor: "border-purple-500",
      iconColor: "text-purple-600",
      href: "/scenarios"
    },
    {
      icon: DocumentTextIcon,
      title: "Grammar Quiz",
      description: "Test your grammar knowledge with interactive quizzes and track your improvement over time.",
      borderColor: "border-blue-500",
      iconColor: "text-blue-600",
      href: "/grammar-quiz"
    },
    {
      icon: LightBulbIcon,
      title: "Word of the Day",
      description: "Learn a new word every day with examples, pronunciation, and usage tips.",
      borderColor: "border-yellow-500",
      iconColor: "text-yellow-600",
      href: "#",
      onClick: handleOpenModal
    },
    {
      icon: BookmarkSquareIcon,
      title: "Vocabulary Builder",
      description: "Expand your vocabulary with curated word lists and interactive learning exercises.",
      borderColor: "border-pink-500",
      iconColor: "text-pink-600",
      href: "/vocabulary"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Word of Day Modal */}
      <WordOfDayModal isOpen={showWordModal} onClose={handleCloseModal} />

      {/* AI Mentor Chat */}
      <ChatInterface
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        position="right"
      />

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-20 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back to your English learning hub</p>
            </div>

            {/* Top Utility Buttons */}
            <TopUtilityButtons
              onWordOfDayClick={handleOpenModal}
              hasNewWord={hasNewWord}
              onChatClick={() => setShowChat(true)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-8 space-y-8 max-w-[1600px] mx-auto">
          {/* Welcome Section */}
          <WelcomeSection userName={user?.user_metadata?.name} userEmail={user?.email} />

          {/* Skill Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <ChartBarIcon className="w-7 h-7 text-[#0088FF]" />
              <h2 className="text-2xl font-bold text-gray-900">Your Skills Overview</h2>
            </div>
            <SkillSummaryCards />
          </motion.div>

          {/* Core Practice Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <RocketLaunchIcon className="w-7 h-7 text-[#0088FF]" />
              <h2 className="text-2xl font-bold text-gray-900">Start Practicing</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practiceFeatures.map((feature, index) => (
                <PracticeFeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  borderColor={feature.borderColor}
                  iconColor={feature.iconColor}
                  href={feature.href}
                  delay={0.5 + index * 0.05}
                  onClick={feature.onClick}
                />
              ))}
            </div>
          </motion.div>

          {/* Two Column Layout: Journey Tracker & Coach's Corner */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <JourneyTracker />
            <CoachCorner />
          </div>

          {/* Explore & Motivation Section */}
          <ExploreSection />

          {/* Footer Spacing */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
