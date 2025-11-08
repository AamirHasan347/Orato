"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BookOpenIcon,
  ChatBubbleOvalLeftIcon,
  ArrowPathIcon,
  LightBulbIcon,
  BookmarkSquareIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";

interface WordOfDay {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  funFact: string;
  synonyms: string[];
  date: string;
  examples?: string[];
}

interface WordOfDayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DifficultWord {
  word: string;
  definition: string;
  pronunciation?: string;
}

export default function WordOfDayModal({ isOpen, onClose }: WordOfDayModalProps) {
  const [wordData, setWordData] = useState<WordOfDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedDifficultWord, setSelectedDifficultWord] = useState<DifficultWord | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchWordOfDay();
      setIsAnimating(true);
      checkIfSaved();
      checkForQuiz();
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const fetchWordOfDay = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/word-of-day");
      const data = await response.json();

      if (data.ok) {
        setWordData(data.word);
      } else {
        setError(data.error || "Failed to fetch word");
      }
    } catch (err) {
      console.error("Error fetching word of day:", err);
      setError("Could not load word of the day");
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!wordData?.id) return;

    try {
      const response = await fetch(`/api/my-vocabulary/check?wordId=${wordData.id}`);
      const data = await response.json();
      setIsSaved(data.isSaved || false);
    } catch (error) {
      console.error("Error checking if word is saved:", error);
    }
  };

  const checkForQuiz = async () => {
    try {
      const response = await fetch("/api/vocabulary-quiz/check");
      const data = await response.json();

      if (data.shouldShowQuiz) {
        setShowQuiz(true);
      }
    } catch (error) {
      console.error("Error checking for quiz:", error);
    }
  };

  const speakWord = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8; // Slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const saveToVocabulary = async () => {
    if (!wordData) return;

    try {
      const response = await fetch("/api/my-vocabulary/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wordId: wordData.id,
          word: wordData.word,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving word:", error);
    }
  };

  const lookupDifficultWord = useCallback((word: string) => {
    // Simplified dictionary - in production, this could call a dictionary API
    const commonWords: Record<string, DifficultWord> = {
      "articulate": {
        word: "articulate",
        definition: "To express thoughts or feelings clearly in words",
        pronunciation: "/ɑːrˈtɪkjʊleɪt/"
      },
      "eloquent": {
        word: "eloquent",
        definition: "Fluent or persuasive in speaking or writing",
        pronunciation: "/ˈeləkwənt/"
      },
      "vivid": {
        word: "vivid",
        definition: "Producing powerful feelings or strong, clear images in the mind",
        pronunciation: "/ˈvɪvɪd/"
      },
      "enhance": {
        word: "enhance",
        definition: "To intensify, increase, or further improve the quality or value of something",
        pronunciation: "/ɪnˈhæns/"
      },
      "profound": {
        word: "profound",
        definition: "Very great or intense; having deep insight or understanding",
        pronunciation: "/prəˈfaʊnd/"
      }
    };

    const foundWord = commonWords[word.toLowerCase()];
    if (foundWord) {
      setSelectedDifficultWord(foundWord);
    } else {
      // Provide a generic response if word not found
      setSelectedDifficultWord({
        word: word,
        definition: "Click the speaker icon to hear how this word is pronounced.",
        pronunciation: undefined
      });
    }
  }, []);

  // Helper function to highlight difficult words in text
  const highlightDifficultWords = (text: string) => {
    const difficultWords = ["articulate", "eloquent", "vivid", "enhance", "profound", "perseverance", "meticulous", "exemplary"];
    const words = text.split(/(\s+)/);

    return words.map((word, index) => {
      const cleanWord = word.replace(/[.,!?;:'"]/g, '').toLowerCase();
      const isDifficult = difficultWords.includes(cleanWord);

      if (isDifficult) {
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              lookupDifficultWord(cleanWord);
            }}
            className="text-blue-600 underline decoration-dotted cursor-help hover:text-blue-700 transition-colors"
            title="Click to see definition"
          >
            {word}
          </span>
        );
      }
      return <span key={index}>{word}</span>;
    });
  };

  if (!isOpen) return null;

  if (showQuiz) {
    return <VocabularyQuiz onClose={() => setShowQuiz(false)} />;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <style jsx global>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-slide-in-down {
          animation: slideInDown 0.5s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }

        .stagger-1 {
          animation-delay: 0.1s;
          opacity: 0;
        }
        .stagger-2 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        .stagger-3 {
          animation-delay: 0.3s;
          opacity: 0;
        }
        .stagger-4 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        .stagger-5 {
          animation-delay: 0.5s;
          opacity: 0;
        }
      `}</style>

      <div
        className={`relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 ${
          isAnimating ? "animate-slide-in-down" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - solid blue */}
        <div className="relative bg-[#0088FF] px-8 py-6 text-white overflow-hidden">
          <div className="shimmer absolute inset-0"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-1">Word of the Day</h2>
                <p className="text-blue-100 text-sm">
                  {wordData?.date
                    ? new Date(wordData.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Today"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading today's word...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 font-medium">{error}</p>
              <button
                onClick={fetchWordOfDay}
                className="mt-4 px-6 py-2 bg-[#0088FF] text-white rounded-lg hover:shadow-md transition shadow-sm"
              >
                Try Again
              </button>
            </div>
          ) : wordData ? (
            <div className="space-y-6">
              {/* The Word */}
              <div className="text-center pb-6 border-b-2 border-gray-100 animate-fade-in-up stagger-1">
                <h3 className="text-5xl font-bold text-gray-900 mb-2">{wordData.word}</h3>
                <div className="flex items-center justify-center gap-3 text-gray-600 mb-3">
                  <span className="text-lg italic">{wordData.pronunciation}</span>
                  <button
                    onClick={() => speakWord(wordData.word)}
                    className={`p-2 rounded-full hover:bg-blue-100 transition-colors ${
                      isSpeaking ? "bg-blue-100 text-blue-600" : "text-gray-600"
                    }`}
                    title="Listen to pronunciation"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                      />
                    </svg>
                  </button>
                  <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium border border-orange-200">
                    {wordData.partOfSpeech}
                  </span>
                </div>
                {/* Save to Vocabulary Button */}
                <button
                  onClick={saveToVocabulary}
                  disabled={isSaved}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isSaved
                      ? "bg-green-100 text-green-700 border border-green-200 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Saved to My Vocabulary
                    </>
                  ) : (
                    <>
                      <BookmarkSquareIcon className="w-5 h-5" />
                      Save to My Vocabulary
                    </>
                  )}
                </button>
              </div>

              {/* Definition */}
              <div className="animate-fade-in-up stagger-2">
                <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <BookOpenIcon className="w-6 h-6 text-blue-600" />
                  Definition
                </h4>
                <p className="text-gray-700 leading-relaxed">{highlightDifficultWords(wordData.definition)}</p>
              </div>

              {/* Examples */}
              <div className="animate-fade-in-up stagger-3">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ChatBubbleOvalLeftIcon className="w-6 h-6 text-purple-600" />
                  Example Sentences
                </h4>
                <div className="space-y-3">
                  <div className="text-gray-700 italic bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    "{highlightDifficultWords(wordData.example)}"
                  </div>
                  {wordData.examples && wordData.examples.map((example, idx) => (
                    <div key={idx} className="text-gray-700 italic bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                      "{highlightDifficultWords(example)}"
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                  💡 Tip: Click on underlined words to see their definitions
                </p>
              </div>

              {/* Difficult Word Tooltip */}
              <AnimatePresence>
                {selectedDifficultWord && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-white border-2 border-blue-500 rounded-xl p-4 shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                        {selectedDifficultWord.word}
                      </h5>
                      <button
                        onClick={() => setSelectedDifficultWord(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    {selectedDifficultWord.pronunciation && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm italic text-gray-600">{selectedDifficultWord.pronunciation}</span>
                        <button
                          onClick={() => speakWord(selectedDifficultWord.word)}
                          className="p-1 rounded-full hover:bg-blue-100 text-blue-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    <p className="text-gray-700">{selectedDifficultWord.definition}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Synonyms */}
              {wordData.synonyms && wordData.synonyms.length > 0 && (
                <div className="animate-fade-in-up stagger-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <ArrowPathIcon className="w-6 h-6 text-green-600" />
                    Synonyms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {wordData.synonyms.map((synonym, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition border border-gray-200"
                      >
                        {synonym}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fun Fact */}
              {wordData.funFact && (
                <div className="animate-fade-in-up stagger-5">
                  <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                    <h4 className="text-lg font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      <LightBulbIcon className="w-6 h-6 text-orange-600" />
                      Fun Fact
                    </h4>
                    <p className="text-gray-700">{wordData.funFact}</p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-6 border-t-2 border-gray-100 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-4">
                  <BookmarkSquareIcon className="w-5 h-5" />
                  <p>Keep learning new words every day to improve your English!</p>
                </div>
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#0088FF] text-white rounded-full font-semibold hover:shadow-lg transition-all duration-200 shadow-md"
                >
                  Got it!
                  <SparklesIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Vocabulary Quiz Component
function VocabularyQuiz({ onClose }: { onClose: () => void }) {
  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await fetch("/api/vocabulary-quiz/generate");
      const data = await response.json();

      if (data.ok) {
        setQuizData(data.quiz);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);

    if (quizData.questions[currentQuestion].correctAnswer === answerIndex) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < quizData.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResults(true);
      }
    }, 1000);
  };

  const handleFinish = async () => {
    // Save quiz results
    await fetch("/api/vocabulary-quiz/save-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score,
        total: quizData.questions.length,
      }),
    });

    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-12 text-center shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your quiz...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / quizData.questions.length) * 100);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <div className="mb-6">
            {percentage >= 80 ? (
              <div className="text-6xl mb-4">🎉</div>
            ) : percentage >= 60 ? (
              <div className="text-6xl mb-4">👍</div>
            ) : (
              <div className="text-6xl mb-4">📚</div>
            )}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
            <p className="text-gray-600">Here's how you did</p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
            <div className="text-5xl font-bold mb-2">{percentage}%</div>
            <p className="text-lg">{score} out of {quizData.questions.length} correct</p>
          </div>

          <div className="space-y-3">
            {percentage >= 80 && (
              <p className="text-green-600 font-semibold">Excellent work! You're mastering your vocabulary! 🌟</p>
            )}
            {percentage >= 60 && percentage < 80 && (
              <p className="text-blue-600 font-semibold">Good job! Keep practicing to improve even more! 💪</p>
            )}
            {percentage < 60 && (
              <p className="text-orange-600 font-semibold">Keep learning! Review the words and try again soon! 📖</p>
            )}
          </div>

          <button
            onClick={handleFinish}
            className="mt-6 w-full px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors"
          >
            Continue Learning
          </button>
        </motion.div>
      </div>
    );
  }

  if (!quizData) return null;

  const question = quizData.questions[currentQuestion];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        key={currentQuestion}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Weekly Vocabulary Quiz</h2>
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {quizData.questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{question.question}</h3>
          {question.word && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-2xl font-bold text-gray-900 text-center">{question.word}</p>
            </div>
          )}
        </div>

        {/* Answers */}
        <div className="space-y-3">
          {question.options.map((option: string, index: number) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = question.correctAnswer === index;
            const showResult = selectedAnswer !== null;

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                  !showResult
                    ? "bg-gray-50 hover:bg-gray-100 border-2 border-gray-200"
                    : isSelected && isCorrect
                    ? "bg-green-100 border-2 border-green-500"
                    : isSelected && !isCorrect
                    ? "bg-red-100 border-2 border-red-500"
                    : isCorrect
                    ? "bg-green-100 border-2 border-green-500"
                    : "bg-gray-50 border-2 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-800">{option}</span>
                  {showResult && isCorrect && <span className="text-green-600">✓</span>}
                  {showResult && isSelected && !isCorrect && <span className="text-red-600">✗</span>}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
