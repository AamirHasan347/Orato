"use client";

import { motion } from "framer-motion";
import { AcademicCapIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

interface CEFRLevel {
  level: string;
  overall_score: number;
  fluency_score?: number;
  grammar_score?: number;
  vocabulary_score?: number;
  confidence_score?: number;
  cefr_descriptions?: {
    title: string;
    description: string;
    can_do: string[];
  };
}

interface Props {
  cefrLevel: CEFRLevel;
}

export default function CEFRLevelDisplay({ cefrLevel }: Props) {
  const getLevelColor = (level: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      A1: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" },
      A2: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700" },
      B1: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700" },
      B2: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700" },
      C1: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700" },
      C2: { bg: "bg-pink-50", border: "border-pink-300", text: "text-pink-700" },
    };
    return colors[level] || colors.A1;
  };

  const colors = getLevelColor(cefrLevel.level);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-6 ${colors.bg} border-2 ${colors.border} rounded-xl`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center border-2 ${colors.border}`}>
          <AcademicCapIcon className={`w-8 h-8 ${colors.text}`} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-3xl font-bold ${colors.text}`}>
              {cefrLevel.level}
            </h3>
            <span className={`text-lg font-semibold ${colors.text}`}>
              {cefrLevel.cefr_descriptions?.title}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            {cefrLevel.cefr_descriptions?.description}
          </p>

          {/* Overall Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Score</span>
              <span className={`text-sm font-bold ${colors.text}`}>
                {cefrLevel.overall_score.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cefrLevel.overall_score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${colors.bg.replace('50', '500')} rounded-full`}
              />
            </div>
          </div>

          {/* Skill Breakdown */}
          {(cefrLevel.fluency_score || cefrLevel.grammar_score || cefrLevel.vocabulary_score) && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {cefrLevel.fluency_score !== undefined && (
                <div>
                  <div className="text-xs text-gray-600">Fluency</div>
                  <div className={`text-sm font-bold ${colors.text}`}>
                    {cefrLevel.fluency_score.toFixed(1)}%
                  </div>
                </div>
              )}
              {cefrLevel.grammar_score !== undefined && (
                <div>
                  <div className="text-xs text-gray-600">Grammar</div>
                  <div className={`text-sm font-bold ${colors.text}`}>
                    {cefrLevel.grammar_score.toFixed(1)}%
                  </div>
                </div>
              )}
              {cefrLevel.vocabulary_score !== undefined && (
                <div>
                  <div className="text-xs text-gray-600">Vocabulary</div>
                  <div className={`text-sm font-bold ${colors.text}`}>
                    {cefrLevel.vocabulary_score.toFixed(1)}%
                  </div>
                </div>
              )}
              {cefrLevel.confidence_score !== undefined && (
                <div>
                  <div className="text-xs text-gray-600">Confidence</div>
                  <div className={`text-sm font-bold ${colors.text}`}>
                    {cefrLevel.confidence_score.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Can Do List */}
          {cefrLevel.cefr_descriptions?.can_do && cefrLevel.cefr_descriptions.can_do.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">You can:</h4>
              <ul className="space-y-1">
                {cefrLevel.cefr_descriptions.can_do.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircleIcon className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
