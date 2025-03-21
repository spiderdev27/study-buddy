'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { NavBar } from '@/components/navigation/NavBar';
import { AIChatInterface } from '@/components/ai-tutor/AIChatInterface';
import { SubjectSelector } from '@/components/ai-tutor/SubjectSelector';
import { LearningSettings, LearningPreferences } from '@/components/ai-tutor/LearningSettings';
import { StudyResources } from '@/components/ai-tutor/StudyResources';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Maximize2,
  Minimize2,
  BookOpen,
  LayoutSidebar,
  Monitor,
  Database
} from 'lucide-react';

export default function AITutorPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // State for subject and topic
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  
  // State for learning preferences
  const [learningPreferences, setLearningPreferences] = useState<LearningPreferences>({
    difficulty: 'intermediate',
    learningStyle: 'visual',
    sessionDuration: 30,
    includeExamples: true,
    includePracticeQuestions: true,
    explainInDepth: true
  });
  
  // State for sidebar visibility on mobile
  const [showSidebar, setShowSidebar] = useState(false);
  
  // State for chat fullscreen mode
  const [fullscreenChat, setFullscreenChat] = useState(false);
  
  // State for API status
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowSidebar(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Check Gemini API connectivity on mount
  useEffect(() => {
    async function checkApiConnection() {
      try {
        const response = await fetch('/api/gemini/status', { method: 'GET' });
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (error) {
        console.error('Failed to check API status:', error);
        setApiStatus('error');
      }
    }
    
    // Set a timeout to simulate checking
    const timer = setTimeout(() => {
      // For demo purposes, we'll just set to connected
      // In production, uncomment the checkApiConnection() call
      // checkApiConnection();
      setApiStatus('connected');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Common Header */}
      <Header />
      
      {/* API Status Banner */}
      <div className={cn(
        "px-4 py-2 text-sm font-medium text-center transition-all duration-300",
        apiStatus === 'checking' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' :
        apiStatus === 'connected' ? 'bg-green-500/20 text-green-700 dark:text-green-300' :
        'bg-red-500/20 text-red-700 dark:text-red-300'
      )}>
        <div className="flex items-center justify-center gap-2">
          {apiStatus === 'checking' && (
            <>
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Connecting to Gemini 2.0 Flash...</span>
            </>
          )}
          {apiStatus === 'connected' && (
            <>
              <Database className="w-4 h-4" />
              <span>Connected to Gemini 2.0 Flash</span>
            </>
          )}
          {apiStatus === 'error' && (
            <>
              <Monitor className="w-4 h-4" />
              <span>Using offline mode - Gemini 2.0 Flash API not available</span>
            </>
          )}
        </div>
      </div>
      
      {/* AI Tutor Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Hero Section */}
        <div className={cn(
          "w-full py-6 px-4 md:px-6 transition-all",
          fullscreenChat ? "hidden" : "block"
        )}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className={cn(
                "h-5 w-5",
                isDark ? "text-indigo-400" : "text-indigo-600"
              )} />
              <h1 className={cn(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-gray-900"
              )}>
                AI Tutor
              </h1>
            </div>
            <p className={cn(
              "text-sm md:text-base",
              isDark ? "text-gray-300" : "text-gray-600"
            )}>
              Your personalized learning companion. Select a subject and topic to begin learning.
            </p>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto flex flex-col lg:flex-row">
            {/* Sidebar for Subject/Topic Selection and Settings */}
            <AnimatePresence>
              {(!fullscreenChat || showSidebar) && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className={cn(
                    "w-full lg:w-80 flex-shrink-0 border-r p-4 overflow-y-auto z-10",
                    isDark ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200",
                    fullscreenChat && "fixed inset-y-0 left-0 h-full pt-16"
                  )}
                >
                  {/* Close button for mobile sidebar */}
                  {fullscreenChat && (
                    <button
                      onClick={() => setShowSidebar(false)}
                      className={cn(
                        "absolute top-4 right-4 p-1 rounded-full",
                        isDark ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"
                      )}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  )}
                  
                  {/* Subject Selector */}
                  <div className="mb-6">
                    <h3 className={cn(
                      "text-sm font-medium mb-3",
                      isDark ? "text-gray-300" : "text-gray-600"
                    )}>
                      What would you like to learn?
                    </h3>
                    <SubjectSelector 
                      onSelectSubject={setSelectedSubject}
                      onSelectTopic={setSelectedTopic}
                    />
                  </div>
                  
                  {/* Learning Settings */}
                  <div className="mb-6">
                    <LearningSettings onSettingsChange={setLearningPreferences} />
                  </div>
                  
                  {/* Study Session Progress */}
                  <div className={cn(
                    "rounded-xl border p-4",
                    isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
                  )}>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className={cn(
                        "h-5 w-5",
                        isDark ? "text-blue-400" : "text-blue-600"
                      )} />
                      <h3 className={cn(
                        "font-medium",
                        isDark ? "text-white" : "text-gray-800"
                      )}>
                        Study Session
                      </h3>
                    </div>
                    
                    <div className="mb-3">
                      <div className={cn(
                        "text-xs mb-1 flex justify-between",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>
                        <span>Progress</span>
                        <span>25%</span>
                      </div>
                      <div className={cn(
                        "w-full h-2 rounded-full overflow-hidden",
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      )}>
                        <div
                          className={cn(
                            "h-full rounded-full",
                            isDark ? "bg-blue-500" : "bg-blue-600"
                          )}
                          style={{ width: '25%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "grid grid-cols-2 gap-2 text-xs",
                      isDark ? "text-gray-300" : "text-gray-600"
                    )}>
                      <div className="flex flex-col">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Time Spent</span>
                        <span className="font-medium">15 min</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Concepts</span>
                        <span className="font-medium">4 / 16</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Questions</span>
                        <span className="font-medium">3 / 12</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>Mastery</span>
                        <span className="font-medium">Developing</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Main Chat Area */}
            <div className={cn(
              "flex-1 flex flex-col h-full overflow-hidden transition-all",
              fullscreenChat ? "w-full" : "w-full lg:w-auto"
            )}>
              {/* Chat container */}
              <div className="relative flex-1 flex flex-col">
                {/* Button to toggle sidebar on mobile when in fullscreen */}
                {fullscreenChat && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    className={cn(
                      "absolute left-4 top-4 p-1.5 rounded-full z-10",
                      isDark ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"
                    )}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
                
                {/* Fullscreen toggle button */}
                <button
                  onClick={() => setFullscreenChat(!fullscreenChat)}
                  className={cn(
                    "absolute right-4 top-4 p-1.5 rounded-full z-10",
                    isDark ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"
                  )}
                >
                  {fullscreenChat ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                
                <div className="flex-1 p-4 flex flex-col h-full">
                  <AIChatInterface 
                    subject={selectedSubject}
                    topic={selectedTopic}
                    preferences={learningPreferences}
                  />
                </div>
              </div>
            </div>
            
            {/* Resources Panel - Only visible when not in fullscreen */}
            {!fullscreenChat && (
              <div className="w-full lg:w-80 p-4 flex-shrink-0 border-l overflow-y-auto">
                <StudyResources 
                  subject={selectedSubject}
                  topic={selectedTopic}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Common NavBar */}
      <NavBar />
    </div>
  );
} 