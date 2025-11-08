"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookmarkIcon, PlayIcon, TrashIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface SavedVideo {
  id: string;
  video_id: string;
  video_title: string;
  created_at: string;
}

export default function SavedVideosPage() {
  const router = useRouter();
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedVideos();
  }, []);

  const fetchSavedVideos = async () => {
    try {
      const response = await fetch("/api/saved-videos");
      const data = await response.json();

      if (data.ok) {
        setSavedVideos(data.savedVideos);
      }
    } catch (error) {
      console.error("Error fetching saved videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    setDeletingId(videoId);

    try {
      const response = await fetch(`/api/saved-videos?videoId=${videoId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSavedVideos(savedVideos.filter((v) => v.video_id !== videoId));
      }
    } catch (error) {
      console.error("Error deleting saved video:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleWatch = (videoId: string) => {
    // Navigate back to dashboard or wherever Coach's Corner is displayed
    router.push("/?video=" + videoId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <BookmarkIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Videos</h1>
              <p className="text-gray-600">
                {savedVideos.length} {savedVideos.length === 1 ? "video" : "videos"} saved
              </p>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        {savedVideos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-12 text-center"
          >
            <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved videos yet</h3>
            <p className="text-gray-600 mb-6">
              Start saving videos from Coach&apos;s Corner to watch them later!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={`https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`}
                    alt={video.video_title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleWatch(video.video_id)}
                      className="opacity-0 hover:opacity-100 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <PlayIcon className="w-8 h-8 text-blue-500 ml-1" />
                    </motion.button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {video.video_title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Saved {new Date(video.created_at).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWatch(video.video_id)}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <PlayIcon className="w-4 h-4" />
                      Watch
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(video.video_id)}
                      disabled={deletingId === video.video_id}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
