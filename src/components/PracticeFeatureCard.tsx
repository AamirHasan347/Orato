"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface PracticeFeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  borderColor: string;
  iconColor: string;
  href: string;
  delay?: number;
  onClick?: () => void;
}

export default function PracticeFeatureCard({
  icon: IconComponent,
  title,
  description,
  borderColor,
  iconColor,
  href,
  delay = 0,
  onClick
}: PracticeFeatureCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href && href !== "#") {
      router.push(href);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-gray-300 group"
    >
      {/* Icon */}
      <div className={`w-16 h-16 border-2 ${borderColor} rounded-2xl flex items-center justify-center ${iconColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <IconComponent className="w-8 h-8" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#0088FF] transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>

      {/* Hover Arrow */}
      <motion.div
        initial={{ x: 0, opacity: 0 }}
        whileHover={{ x: 5, opacity: 1 }}
        className="mt-4 flex items-center gap-2 text-[#0088FF] font-medium text-sm"
      >
        Start now
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </motion.div>
    </motion.div>
  );
}
