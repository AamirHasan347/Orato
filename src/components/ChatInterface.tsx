'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'right' | 'floating';
}

const PRESET_PROMPTS = [
  {
    label: 'Correct my sentence',
    icon: '✏️',
    prompt: 'Please correct this sentence: ',
  },
  {
    label: 'Give me a speaking topic',
    icon: '🎤',
    prompt: 'Give me an interesting speaking topic to practice.',
  },
  {
    label: 'Explain a grammar rule',
    icon: '📚',
    prompt: 'Can you explain the difference between ',
  },
  {
    label: 'Expand my vocabulary',
    icon: '📖',
    prompt: 'Teach me 5 advanced words related to ',
  },
  {
    label: 'How am I doing?',
    icon: '📊',
    prompt: 'Based on my recent performance, what should I focus on improving?',
  },
  {
    label: 'Practice conversation',
    icon: '💬',
    prompt: "Let's have a conversation about ",
  },
];

export default function ChatInterface({
  isOpen,
  onClose,
  position = 'right',
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm your Orato AI Mentor. I'm here to help you improve your English! Ask me anything about grammar, vocabulary, pronunciation, or get speaking practice tips. 😊",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowPresets(false);

    try {
      // Build conversation history
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory,
          includeContext: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (prompt: string) => {
    setInputValue(prompt);
    setShowPresets(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  const containerClasses =
    position === 'floating'
      ? 'fixed bottom-4 right-4 w-96 h-[600px] z-50'
      : 'fixed top-0 right-0 h-full w-full md:w-[450px] z-50';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: position === 'floating' ? 50 : 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: position === 'floating' ? 50 : 100 }}
        transition={{ duration: 0.3 }}
        className={containerClasses}
      >
        {/* Chat Container */}
        <div className="flex flex-col h-full bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-6 w-6" />
              <div>
                <h3 className="font-bold text-lg">Orato AI Mentor</h3>
                <p className="text-xs opacity-90">Your English learning assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label="Close chat"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preset Prompts */}
          {showPresets && messages.length <= 1 && (
            <div className="p-4 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2 font-medium">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_PROMPTS.slice(0, 6).map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetClick(preset.prompt)}
                    className="flex items-center space-x-2 p-2 text-left text-sm bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-lg transition"
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-xs text-gray-700 font-medium">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about English..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 text-sm"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by AI • Learning context included
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
