"use client";

import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useSupabase } from "@/app/supabase-provider";
import {
  HomeIcon,
  MicrophoneIcon,
  ChatBubbleLeftRightIcon,
  FlagIcon,
  ChatBubbleOvalLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  PaintBrushIcon,
  ArrowRightOnRectangleIcon,
} from "@/components/Icons";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  isActive?: boolean;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { supabase } = useSupabase();

  const navItems: NavItem[] = [
    { icon: HomeIcon, label: "Home", path: "/" },
    { icon: MicrophoneIcon, label: "SpeakFlow", path: "/record" },
    { icon: ChatBubbleLeftRightIcon, label: "Challenges", path: "/challenges" },
    { icon: FlagIcon, label: "Practice", path: "/practice" },
    { icon: ChatBubbleOvalLeftIcon, label: "Community", path: "/community" },
    { icon: DocumentTextIcon, label: "Grammar", path: "/grammar-quiz" },
  ];

  const bottomNavItems: NavItem[] = [
    { icon: ClockIcon, label: "History", path: "/recordings" },
    { icon: PaintBrushIcon, label: "Preferences", path: "/settings" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-[#0088FF] shadow-2xl flex flex-col items-center py-6 z-50">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8 cursor-pointer hover:scale-110 transition-transform"
        onClick={() => router.push("/")}
      >
        <span className="text-2xl font-bold text-[#0088FF]">O</span>
      </motion.div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-4 w-full px-3">
        {navItems.map((item, index) => {
          const isActive = pathname === item.path;
          const IconComponent = item.icon;

          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(item.path)}
              className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all group ${
                isActive
                  ? "bg-white text-[#0088FF] shadow-lg"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              title={item.label}
            >
              <IconComponent className="w-6 h-6" />

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"
                />
              )}

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900" />
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="flex flex-col gap-4 w-full px-3 mb-4">
        {bottomNavItems.map((item, index) => {
          const isActive = pathname === item.path;
          const IconComponent = item.icon;

          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(item.path)}
              className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all group ${
                isActive
                  ? "bg-white text-[#0088FF] shadow-lg"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              title={item.label}
            >
              <IconComponent className="w-6 h-6" />

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900" />
              </div>
            </motion.button>
          );
        })}

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="relative w-14 h-14 rounded-2xl bg-white/10 text-white hover:bg-red-500 flex items-center justify-center transition-all group"
          title="Logout"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6" />

          {/* Tooltip */}
          <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
            Logout
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}
