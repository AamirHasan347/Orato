"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AcademicCapIcon } from "@/components/Icons";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  BookmarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";

interface Video {
  id: string;
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  order_index: number;
}

interface WeeklyRecommendation {
  id: string;
  video_id: string;
  focus_topic: string;
  description: string;
  video?: Video;
}

export default function CoachCorner() {
  const channelName = "Mother's Channel"; // Update with actual channel name if available

  // State
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [nextVideo, setNextVideo] = useState<Video | null>(null);
  const [previousVideo, setPreviousVideo] = useState<Video | null>(null);
  const [weeklyRecommendation, setWeeklyRecommendation] = useState<WeeklyRecommendation | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [saveMessage, setSaveMessage] = useState("");

  // Fetch initial video and weekly recommendation
  useEffect(() => {
    fetchVideoData("OLYSBScArl4");
    fetchWeeklyRecommendation();
    checkIfSaved("OLYSBScArl4");
  }, []);

  const fetchVideoData = async (videoId: string) => {
    try {
      const response = await fetch(`/api/coach-videos?currentVideoId=${videoId}`);
      const data = await response.json();

      if (data.ok) {
        setCurrentVideo(data.currentVideo);
        setNextVideo(data.nextVideo);
        setPreviousVideo(data.previousVideo);
        setCurrentIndex(data.currentIndex);
        setTotalVideos(data.totalVideos);
        checkIfSaved(data.currentVideo.video_id);
      }
    } catch (error) {
      console.error("Error fetching video data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyRecommendation = async () => {
    try {
      const response = await fetch("/api/weekly-recommendation");
      const data = await response.json();

      if (data.ok && data.recommendation) {
        setWeeklyRecommendation(data.recommendation);
      }
    } catch (error) {
      console.error("Error fetching weekly recommendation:", error);
    }
  };

  const checkIfSaved = async (videoId: string) => {
    try {
      const response = await fetch("/api/saved-videos");
      const data = await response.json();

      if (data.ok) {
        const saved = data.savedVideos.some((v: any) => v.video_id === videoId);
        setIsSaved(saved);
      }
    } catch (error) {
      console.error("Error checking if video is saved:", error);
    }
  };

  const handleSaveVideo = async () => {
    if (!currentVideo) return;

    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/saved-videos?videoId=${currentVideo.video_id}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (data.ok) {
          setIsSaved(false);
          showSaveMessage("Video removed from saved list");
        }
      } else {
        // Save
        const response = await fetch("/api/saved-videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId: currentVideo.video_id,
            videoTitle: currentVideo.title,
          }),
        });
        const data = await response.json();

        if (data.ok) {
          setIsSaved(true);
          showSaveMessage("Video saved for later!");
        } else if (response.status === 409) {
          showSaveMessage("Video already saved");
        }
      }
    } catch (error) {
      console.error("Error saving video:", error);
      showSaveMessage("Error saving video");
    }
  };

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleNavigate = (direction: "next" | "previous") => {
    const targetVideo = direction === "next" ? nextVideo : previousVideo;
    if (targetVideo) {
      setCurrentVideo(targetVideo);
      fetchVideoData(targetVideo.video_id);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="aspect-video bg-gray-200 rounded-xl"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 border-2 border-orange-500 rounded-xl flex items-center justify-center text-orange-600">
            <AcademicCapIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Coach&apos;s Corner</h2>
            <p className="text-sm text-gray-600">by {channelName}</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open(`https://youtube.com/@${channelName.toLowerCase().replace(/\s+/g, '')}`, '_blank')}
          className="px-4 py-2 bg-[#0088FF] text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
        >
          View More Lessons
        </motion.button>
      </div>

      {/* Weekly Recommendation Banner */}
      <AnimatePresence>
        {weeklyRecommendation && weeklyRecommendation.video_id === currentVideo?.video_id && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">
                {weeklyRecommendation.focus_topic}
              </span>
            </div>
            <p className="text-sm text-purple-700">{weeklyRecommendation.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Embed */}
      <div className="relative w-full rounded-xl overflow-hidden shadow-lg aspect-video bg-black">
        <iframe
          key={currentVideo?.video_id}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${currentVideo?.video_id}`}
          title="Coach's Corner Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>

      {/* Video Controls */}
      <div className="mt-4 flex items-center justify-between">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigate("previous")}
            disabled={!previousVideo}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              previousVideo
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </motion.button>

          <span className="text-sm text-gray-600 px-3">
            {currentIndex} / {totalVideos}
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigate("next")}
            disabled={!nextVideo}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              nextVideo
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRightIcon className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 rounded-lg hover:bg-red-50 transition-all"
          >
            {isLiked ? (
              <HeartSolidIcon className="w-6 h-6 text-red-500" />
            ) : (
              <HeartIcon className="w-6 h-6 text-gray-400 hover:text-red-500" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSaveVideo}
            className="p-2 rounded-lg hover:bg-blue-50 transition-all relative"
          >
            {isSaved ? (
              <BookmarkSolidIcon className="w-6 h-6 text-blue-500" />
            ) : (
              <BookmarkIcon className="w-6 h-6 text-gray-400 hover:text-blue-500" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Save Message */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 text-sm text-center text-blue-600 font-medium"
          >
            {saveMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description */}
      <div className="mt-6 bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 mb-1">{currentVideo?.title}</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {currentVideo?.description}
            </p>
            {currentVideo?.category && (
              <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {currentVideo.category}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
