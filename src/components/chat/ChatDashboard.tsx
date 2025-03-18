"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/app/theme-selector';
import { Logo } from '@/components/ui/Logo';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function ChatDashboard() {
  const { theme, colors, toggleColorMode, colorMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Study Buddy AI assistant. How can I help you with your studies today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Set up scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const scrollPos = chatContainerRef.current.scrollTop;
        const maxScroll = chatContainerRef.current.scrollHeight - chatContainerRef.current.clientHeight;
        setScrollProgress(scrollPos / (maxScroll || 1));
      }
    };
    
    const containerElement = chatContainerRef.current;
    if (containerElement) {
      containerElement.addEventListener('scroll', handleScroll);
      return () => containerElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (will be replaced with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputValue),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Simple AI response simulation
  const getAIResponse = (input: string): string => {
    const responses = [
      "That's a great question! Let me help you understand this concept better.",
      "I've found some useful resources on that topic. Would you like me to share them with you?",
      "Let's break down this problem step-by-step so it's easier to understand.",
      "I can help you study this material. Would you prefer flashcards, practice questions, or a summary?",
      "That's an interesting topic. Here's how I'd explain it in simple terms...",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-60">
          <div className="absolute top-0 left-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/2 right-10 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] rounded-full bg-accent/5 blur-3xl" />
        </div>
      </div>
      
      {/* Header - Fixed & Compact */}
      <motion.header 
        className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center h-16 px-4 md:px-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Logo size={32} />
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm -z-10" />
            </div>
            <h1 className="text-xl font-bold hidden md:block text-gradient">Study Buddy</h1>
          </div>
          
          {/* Progress Indicator */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-secondary"
              style={{ scaleX: 1 - scrollProgress, transformOrigin: 'right' }} 
            />
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleColorMode}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-card backdrop-blur-md border border-white/10 shadow-sm"
            >
              {colorMode === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </motion.button>
            
            {/* Chat Options */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-card backdrop-blur-md border border-white/10 shadow-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </motion.button>
            
            {/* Profile */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center bg-gradient-to-r from-primary to-secondary rounded-full h-8 pr-2 pl-0.5 shadow-glow"
            >
              <span className="w-7 h-7 rounded-full bg-white text-primary font-medium text-xs flex items-center justify-center">A</span>
              <span className="text-white text-xs font-medium ml-1 hidden md:block">Alex</span>
            </motion.button>
          </div>
        </div>
      </motion.header>
      
      <main className="flex-1 max-w-5xl mx-auto w-full md:px-6 flex flex-col">
        {/* Chat Area */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Chat Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4 px-4 md:px-0"
          >
            <h2 className="text-2xl font-bold text-gradient mb-1">AI Study Assistant</h2>
            <p className="text-text-secondary text-sm">Ask me anything about your studies!</p>
          </motion.div>

          {/* Message Suggestions */}
          <motion.div 
            className="mb-4 px-4 md:px-0 overflow-x-auto scrollbar-hidden -mx-1 px-1 pb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex gap-2">
              {["Explain quantum physics", "Help with calculus homework", "Create a study plan", "Summarize this chapter"].map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  className="px-4 py-2 bg-bg-card border border-white/10 rounded-full text-sm whitespace-nowrap hover:bg-white/5 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  onClick={() => {
                    setInputValue(suggestion);
                  }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-0 min-h-0 pb-4"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-6 py-4"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[85%] rounded-2xl backdrop-blur-md
                      ${message.sender === 'user' 
                        ? 'bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 text-text-primary pr-4 pl-5 py-3 rounded-tr-sm'
                        : 'bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/20 text-text-primary pl-4 pr-5 py-3 rounded-tl-sm'
                      }
                    `}
                  >
                    <div className="flex items-center mb-1.5">
                      <span className={`text-xs font-semibold ${message.sender === 'user' ? 'text-primary' : 'text-secondary'}`}>
                        {message.sender === 'user' ? 'You' : 'Study Buddy AI'}
                      </span>
                      <span className="text-xs ml-2 text-text-secondary opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-text-primary text-sm leading-relaxed">{message.text}</p>
                  </div>
                </motion.div>
              ))}
              
              {/* AI typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-start"
                >
                  <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/20 rounded-2xl rounded-tl-sm py-3 px-5">
                    <div className="flex space-x-2 items-center h-6">
                      <motion.div 
                        className="h-2 w-2 bg-secondary rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: "loop", delay: 0 }}
                      />
                      <motion.div 
                        className="h-2 w-2 bg-secondary rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: "loop", delay: 0.2 }}
                      />
                      <motion.div 
                        className="h-2 w-2 bg-secondary rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: "loop", delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </motion.div>
          </div>

          {/* Input Area with Floating Design */}
          <motion.div 
            className="sticky bottom-0 pb-24 pt-4 bg-gradient-to-t from-background via-background to-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="relative">
              <div className={`glass-card p-1 transition-all duration-300 ${isInputFocused ? 'shadow-glow' : ''}`}>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="Ask me anything about your studies..."
                    className="flex-1 py-3 px-4 bg-transparent border-none focus:outline-none text-text-primary text-sm"
                  />
                  
                  <div className="flex items-center gap-2 pr-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </motion.button>
                    
                    <motion.button
                      type="submit"
                      disabled={!inputValue.trim()}
                      whileHover={{ scale: 1.1, rotate: -10 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-primary to-secondary text-white shadow-sm transition-all duration-200 ${!inputValue.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-glow'}`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 