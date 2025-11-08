"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BellIcon, LightBulbIcon, CpuChipIcon, Cog6ToothIcon } from "@/components/Icons";
import NotificationDropdown from "./NotificationDropdown";

interface TopUtilityButtonsProps {
  onWordOfDayClick: () => void;
  hasNewWord?: boolean;
  onChatClick: () => void;
}

export default function TopUtilityButtons({ onWordOfDayClick, hasNewWord = false, onChatClick }: TopUtilityButtonsProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      const data = await response.json();

      if (response.ok) {
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Notifications */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="relative w-11 h-11 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center border border-gray-200 hover:border-gray-300 group"
          title="Notifications"
        >
          <BellIcon className="w-6 h-6 text-gray-600 group-hover:text-[#0088FF] transition-colors" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>

        <NotificationDropdown
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          unreadCount={unreadCount}
          onUnreadCountChange={setUnreadCount}
        />
      </div>

      {/* Word of the Day */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onWordOfDayClick}
        className="relative w-11 h-11 bg-orange-500 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center group"
        title="Word of the Day"
      >
        <LightBulbIcon className="w-6 h-6 text-white" />
        {hasNewWord && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
        )}
      </motion.button>

      {/* AI Mentor Chat */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onChatClick}
        className="relative w-11 h-11 bg-[#0088FF] rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center group"
        title="AI Mentor Chat"
      >
        <CpuChipIcon className="w-6 h-6 text-white" />
      </motion.button>

      {/* Settings/Profile */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/settings')}
        className="relative w-11 h-11 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center border border-gray-200 hover:border-gray-300 group"
        title="Settings"
      >
        <Cog6ToothIcon className="w-6 h-6 text-gray-600 group-hover:text-[#0088FF] transition-colors" />
      </motion.button>
    </div>
  );
}
