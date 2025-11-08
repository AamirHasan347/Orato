"use client";

import { useEffect, useState, useRef } from "react";
import { useSupabase } from "../supabase-provider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon,
  LightBulbIcon,
  ClockIcon,
  TrophyIcon,
  BookOpenIcon
} from "@/components/Icons";

interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  category: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

interface UserAnswer {
  question_id: string;
  user_answer: string;
  time_taken: number;
}

interface GradedAnswer {
  question_id: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  time_taken: number;
}

interface Category {
  name: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

export default function EnhancedGrammarQuizPage() {
  const { user, loading: authLoading } = useSupabase();
  const router = useRouter();

  // Selection states
  const [showSetup, setShowSetup] = useState(true);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Quiz states
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAIExplanation, setShowAIExplanation] = useState(false);
  const [aiExplanation, setAIExplanation] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);

  // Results states
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Progress states
  const [progress, setProgress] = useState<any>(null);
  const [showProgress, setShowProgress] = useState(false);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(180);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [quizStartTime, setQuizStartTime] = useState(0);

  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
    } else {
      fetchCategories();
      fetchProgress();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (questions.length > 0 && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [questions, showResults]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/grammar-quiz/categories");
      const data = await response.json();
      if (data.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/grammar-quiz/progress");
      const data = await response.json();
      if (data.ok) {
        setProgress(data);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const startQuiz = async () => {
    setLoading(true);

    try {
      const url = new URL("/api/grammar-quiz", window.location.origin);
      url.searchParams.append("difficulty", difficulty);
      if (selectedCategory) {
        url.searchParams.append("category", selectedCategory);
      }
      url.searchParams.append("limit", "5");

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.ok) {
        setQuestions(data.questions);
        setShowSetup(false);
        setQuizStartTime(Date.now());
        setQuestionStartTime(Date.now());
        setTimeLeft(180);
      } else {
        alert(data.error || "Failed to load quiz questions");
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
      alert("Could not load quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (option: string) => {
    setSelectedAnswer(option);
    setShowAIExplanation(false);
    setAIExplanation("");
  };

  const fetchAIExplanation = async (question: QuizQuestion, userAns: string, correctAns: string) => {
    setLoadingAI(true);
    try {
      const response = await fetch("/api/grammar-quiz/ai-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question_text,
          userAnswer: `${userAns}. ${question.options[userAns as keyof typeof question.options]}`,
          correctAnswer: `${correctAns}. ${question.options[correctAns as keyof typeof question.options]}`,
          options: question.options,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        setAIExplanation(data.explanation);
      }
    } catch (error) {
      console.error("Error fetching AI explanation:", error);
      setAIExplanation("Failed to load AI explanation.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      alert("Please select an answer before proceeding.");
      return;
    }

    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const answer: UserAnswer = {
      question_id: questions[currentQuestionIndex].id,
      user_answer: selectedAnswer,
      time_taken: timeTaken,
    };

    setUserAnswers([...userAnswers, answer]);
    setSelectedAnswer(null);
    setShowAIExplanation(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
    } else {
      handleSubmitQuiz([...userAnswers, answer]);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevAnswer = userAnswers[currentQuestionIndex - 1];
      if (prevAnswer) {
        setSelectedAnswer(prevAnswer.user_answer);
      }
    }
  };

  const handleSubmitQuiz = async (answers: UserAnswer[] = userAnswers) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setLoading(true);
    const totalTimeTaken = Math.round((Date.now() - quizStartTime) / 1000);

    try {
      const response = await fetch("/api/grammar-quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answers,
          time_taken: totalTimeTaken,
          difficulty: difficulty,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setResults(data);
        setShowResults(true);
        fetchProgress(); // Refresh progress
      } else {
        alert(data.error || "Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Could not submit quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryQuiz = () => {
    setShowResults(false);
    setShowSetup(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setResults(null);
    setTimeLeft(180);
    setShowAIExplanation(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Setup Screen
  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-10"
          >
            <button
              onClick={() => router.push("/")}
              className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition"
            >
              ← Back to Dashboard
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🧩</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Grammar Quiz</h1>
              <p className="text-gray-600 text-lg">Test your grammar skills with personalized quizzes!</p>
            </div>

            {/* Progress Summary */}
            {progress && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
              >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <ChartBarIcon className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">{progress.stats.totalAttempts}</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-2 font-medium">Total Quizzes</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <TrophyIcon className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{progress.stats.averageScore}%</span>
                  </div>
                  <p className="text-sm text-green-700 mt-2 font-medium">Average Score</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <SparklesIcon className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">{progress.stats.bestScore}%</span>
                  </div>
                  <p className="text-sm text-purple-700 mt-2 font-medium">Best Score</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <CheckCircleIcon className="w-8 h-8 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">{progress.stats.totalCorrect}</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-2 font-medium">Correct Answers</p>
                </div>
              </motion.div>
            )}

            {/* Difficulty Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                1. Choose Difficulty Level:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: "easy", emoji: "😊", label: "Beginner", desc: "Basic grammar rules", color: "green" },
                  { value: "medium", emoji: "🤔", label: "Intermediate", desc: "Moderate complexity", color: "yellow" },
                  { value: "hard", emoji: "🔥", label: "Advanced", desc: "Expert level", color: "red" },
                ].map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() => setDifficulty(diff.value as any)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                      difficulty === diff.value
                        ? `bg-${diff.color}-100 border-${diff.color}-400 shadow-lg`
                        : `bg-${diff.color}-50 border-${diff.color}-200 hover:border-${diff.color}-300`
                    }`}
                  >
                    <div className="text-3xl mb-2">{diff.emoji}</div>
                    <div className={`font-bold text-${diff.color}-700 text-lg`}>{diff.label}</div>
                    <div className={`text-${diff.color}-600 text-sm`}>{diff.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                2. Choose Grammar Category (Optional):
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedCategory === null
                      ? "bg-blue-100 border-blue-400 text-blue-700"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <BookOpenIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium text-sm">All Categories</div>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedCategory === cat.name
                        ? "bg-blue-100 border-blue-400 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{cat.name}</div>
                    <div className="text-xs opacity-75">{cat.total} questions</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startQuiz}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Quiz
            </button>

            {/* Quiz Info */}
            <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5" />
                Quiz Format:
              </h3>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  5 multiple choice questions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  3 minutes total time
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  AI-powered explanations for each question
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Detailed progress tracking
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults && results) {
    const percentage = results.percentage;
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-10"
          >
            {/* Score Display */}
            <div className="text-center mb-8">
              <div className="text-7xl mb-4">{passed ? "🎉" : "📚"}</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
              <div className="text-6xl font-bold my-6" style={{ color: passed ? "#10b981" : "#f59e0b" }}>
                {results.score}/{results.total}
              </div>
              <p className="text-2xl text-gray-700">
                You scored <span className="font-bold">{percentage}%</span>
              </p>
              <p className="text-gray-600 mt-2">
                {passed ? "Great job! Keep up the good work! 🌟" : "Keep practicing! You'll do better next time! 💪"}
              </p>
            </div>

            {/* Answer Review with AI Explanations */}
            <div className="space-y-4 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpenIcon className="w-7 h-7 text-blue-600" />
                Review Your Answers:
              </h3>
              {results.answers.map((answer: GradedAnswer, index: number) => {
                const question = questions.find((q) => q.id === answer.question_id);
                if (!question) return null;

                return (
                  <AnswerReview
                    key={index}
                    index={index}
                    answer={answer}
                    question={question}
                    onRequestAI={(q, userAns, correctAns) => {
                      fetchAIExplanation(q, userAns, correctAns);
                      setShowAIExplanation(true);
                    }}
                    aiExplanation={aiExplanation}
                    showAI={showAIExplanation}
                    loadingAI={loadingAI}
                  />
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetryQuiz}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Screen (continues...)
  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto py-4 md:py-8">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between text-white">
            <button
              onClick={() => router.push("/")}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition"
            >
              ←
            </button>
            <h1 className="text-xl md:text-2xl font-bold">Grammar Quiz</h1>
            <div className="w-16 h-12 flex items-center justify-center rounded-full bg-yellow-400 text-yellow-900 font-bold text-sm">
              <ClockIcon className="w-4 h-4 mr-1" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
              <span className="font-medium">Question {currentQuestionIndex + 1}</span>
              <span>{currentQuestionIndex + 1} of {questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
              ></motion.div>
            </div>
          </div>

          {/* Question */}
          <div className="px-6 py-8 md:px-10 md:py-12">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  difficulty === "easy" ? "bg-green-100 text-green-700" :
                  difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {currentQuestion.category}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed">
                {currentQuestion.question_text}
              </h2>
            </div>

            {/* Options */}
            <div className="mb-8">
              <p className="text-gray-600 mb-4 font-medium">Choose your answer:</p>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectAnswer(key)}
                    className={`p-5 rounded-2xl text-left transition-all duration-200 ${
                      selectedAnswer === key
                        ? "bg-blue-500 text-white border-2 border-blue-600 shadow-lg"
                        : "bg-white text-gray-800 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <span className="font-bold text-lg mr-3">{key}.</span>
                    {value}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  currentQuestionIndex === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                ← Previous
              </button>

              <div className="flex items-center gap-2 text-blue-600">
                <span className="text-2xl">💡</span>
                <span className="font-medium text-sm hidden sm:inline">
                  {currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>

              <button
                onClick={handleNext}
                disabled={!selectedAnswer}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  !selectedAnswer
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg"
                }`}
              >
                {currentQuestionIndex === questions.length - 1 ? "Submit" : "Next"} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Answer Review Component
function AnswerReview({
  index,
  answer,
  question,
  onRequestAI,
  aiExplanation,
  showAI,
  loadingAI
}: {
  index: number;
  answer: GradedAnswer;
  question: QuizQuestion;
  onRequestAI: (q: QuizQuestion, userAns: string, correctAns: string) => void;
  aiExplanation: string;
  showAI: boolean;
  loadingAI: boolean;
}) {
  const [showAILocal, setShowAILocal] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-6 rounded-xl border-2 ${
        answer.is_correct
          ? "bg-green-50 border-green-300"
          : "bg-red-50 border-red-300"
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">{answer.is_correct ? "✅" : "❌"}</div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 mb-3">
            Question {index + 1}: {question.question_text}
          </p>
          <div className="space-y-2 text-sm mb-3">
            <p className="flex items-center gap-2">
              <span className="font-medium">Your answer:</span>
              <span className={`font-semibold ${answer.is_correct ? "text-green-700" : "text-red-700"}`}>
                {answer.user_answer}. {question.options[answer.user_answer as keyof typeof question.options]}
              </span>
            </p>
            {!answer.is_correct && (
              <p className="flex items-center gap-2">
                <span className="font-medium">Correct answer:</span>
                <span className="text-green-700 font-semibold">
                  {answer.correct_answer}. {question.options[answer.correct_answer as keyof typeof question.options]}
                </span>
              </p>
            )}
          </div>

          {/* Standard Explanation */}
          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Explanation:</span> {answer.explanation}
            </p>
          </div>

          {/* AI Explanation Button */}
          <button
            onClick={() => {
              if (!showAILocal) {
                onRequestAI(question, answer.user_answer, answer.correct_answer);
                setShowAILocal(true);
              } else {
                setShowAILocal(false);
              }
            }}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            {showAILocal ? "Hide AI Explanation" : "Get AI Explanation"}
          </button>

          {/* AI Explanation Display */}
          <AnimatePresence>
            {showAILocal && showAI && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200"
              >
                {loadingAI ? (
                  <div className="flex items-center gap-2 text-purple-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span className="text-sm">Generating AI explanation...</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <SparklesIcon className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">AI Tutor Explanation:</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{aiExplanation}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
