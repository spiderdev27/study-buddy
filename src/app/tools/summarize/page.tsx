'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Logo } from '@/components/ui/Logo';
import { NavBar } from '@/components/navigation/NavBar';
import { Header } from '@/components/navigation/Header';
import { useTheme } from '@/app/theme-selector';

export default function SummarizeTool() {
  const { theme } = useTheme();
  const { data: session, status } = useSession({ required: false });
  const [isLoading, setIsLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [summaryStyle, setSummaryStyle] = useState<'concise' | 'detailed' | 'bullets'>('concise');
  
  // Handle session state
  useEffect(() => {
    if (status === 'loading') {
      setAuthLoading(true);
    } else {
      setAuthLoading(false);
      
      if (status === 'authenticated') {
        console.log('User authenticated:', session?.user?.name);
      } else {
        console.log('Using tool as guest user');
      }
    }
  }, [status, session]);
  
  // Function to handle text summarization
  const handleSummarize = async () => {
    if (!text.trim()) {
      setError('Please enter some text to summarize.');
      return;
    }
    
    if (text.trim().length < 100) {
      setError('Please enter at least 100 characters for a meaningful summary.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tools/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          summaryLength,
          summaryStyle,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to summarize text');
      }
      
      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error('Error summarizing text:', err);
      setError('Failed to summarize text. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate text statistics
  const getTextStats = () => {
    if (!text.trim()) {
      return { words: 0, characters: 0, sentences: 0, readingTime: '0 min' };
    }
    
    const words = text.trim().split(/\s+/).length;
    const characters = text.length;
    const sentences = text.split(/[.!?]+/).length - 1;
    const readingTime = Math.ceil(words / 225); // Average adult reading speed of 225 WPM
    
    return {
      words,
      characters,
      sentences,
      readingTime: `${readingTime} min`
    };
  };
  
  const textStats = getTextStats();
  
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-60">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/4 right-10 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] rounded-full bg-accent/5 blur-3xl" />
        </div>
      </div>
      
      {/* Common Header Component */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold">AI Study Assistant</h1>
            <p className="text-text-secondary">Summarize text using Google's Gemini AI</p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4">Input Text</h2>
              
              <div className="mb-4">
                <textarea
                  className="w-full h-64 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Paste or type the text you want to summarize..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isLoading}
                ></textarea>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm text-text-secondary mb-2">Summary Length</label>
                  <div className="flex bg-white/5 rounded-lg p-1">
                    <button
                      className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors ${summaryLength === 'short' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                      onClick={() => setSummaryLength('short')}
                      disabled={isLoading}
                    >
                      Short
                    </button>
                    <button
                      className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors ${summaryLength === 'medium' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                      onClick={() => setSummaryLength('medium')}
                      disabled={isLoading}
                    >
                      Medium
                    </button>
                    <button
                      className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors ${summaryLength === 'long' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                      onClick={() => setSummaryLength('long')}
                      disabled={isLoading}
                    >
                      Long
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm text-text-secondary mb-2">Summary Style</label>
                  <div className="flex bg-white/5 rounded-lg p-1">
                    <button
                      className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors ${summaryStyle === 'concise' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                      onClick={() => setSummaryStyle('concise')}
                      disabled={isLoading}
                    >
                      Concise
                    </button>
                    <button
                      className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors ${summaryStyle === 'detailed' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                      onClick={() => setSummaryStyle('detailed')}
                      disabled={isLoading}
                    >
                      Detailed
                    </button>
                    <button
                      className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors ${summaryStyle === 'bullets' ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                      onClick={() => setSummaryStyle('bullets')}
                      disabled={isLoading}
                    >
                      Bullets
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-text-secondary">
                  <span className="mr-3">{textStats.words} words</span>
                  <span className="mr-3">{textStats.characters} characters</span>
                  <span className="mr-3">{textStats.sentences} sentences</span>
                  <span>~{textStats.readingTime} reading time</span>
                </div>
                
                <motion.button
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSummarize}
                  disabled={isLoading || !text.trim()}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>AI Summarizing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Summarize with AI
                    </div>
                  )}
                </motion.button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}
            </motion.div>
            
            {/* Output Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card p-6 rounded-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Summary</h2>
                <div className="flex items-center text-xs text-text-secondary bg-white/5 px-2 py-1 rounded-full">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Powered by Gemini AI
                </div>
              </div>

              <div className="relative min-h-64 mb-4">
                {!summary && !isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-text-secondary">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3 opacity-40">
                      <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 7L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 7L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 9H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-sm">Your summarized text will appear here</p>
                    <p className="text-xs mt-2">Enter your text and click the Summarize button</p>
                  </div>
                ) : (
                  <div className={`w-full h-full border border-white/10 rounded-lg p-4 ${isLoading ? 'bg-white/5 animate-pulse' : 'bg-white/5'}`}>
                    {isLoading ? (
                      <div className="h-full flex flex-col items-center justify-center">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-6 w-6 rounded-full bg-background"></div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M15.5 9C15.5 7.89543 14.6046 7 13.5 7H10.5C9.39543 7 8.5 7.89543 8.5 9V15C8.5 16.1046 9.39543 17 10.5 17H13.5C14.6046 17 15.5 16.1046 15.5 15V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <p className="font-medium text-primary">Gemini AI Processing</p>
                          <p className="text-sm text-text-secondary mt-1">Creating summary based on your preferences...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-text-primary whitespace-pre-line">
                        {summary}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {summary && !isLoading && (
                <div className="flex justify-end gap-3">
                  <motion.button
                    className="px-3 py-1.5 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors flex items-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      navigator.clipboard.writeText(summary);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copy
                  </motion.button>
                  
                  <motion.button
                    className="px-3 py-1.5 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors flex items-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      // In a real implementation, this would save to the user's library
                      // For now, we'll just clear for a new summary
                      setSummary('');
                      setText('');
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                      <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Save to Library
                  </motion.button>
                  
                  <motion.button
                    className="px-3 py-1.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSummary('');
                      setText('');
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                      <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    New Summary
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Tips Section - Update based on active tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-6 rounded-xl mt-6"
          >
            <h2 className="text-xl font-semibold mb-4">
              Tips for Better AI Summaries
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mr-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Use Complete Text</h3>
                  <p className="text-sm text-text-secondary">Include full paragraphs with context for more accurate AI summaries.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mr-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Match Length to Content</h3>
                  <p className="text-sm text-text-secondary">Choose longer summaries for complex material and shorter for simpler content.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mr-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Select the Right Style</h3>
                  <p className="text-sm text-text-secondary">Use bullets for quick review and detailed for in-depth understanding.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm text-text-secondary">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>
                  <strong>AI Tip:</strong>{' '}
                  When comparing research papers or complex texts, use the 'detailed' style for more nuanced summaries that capture subtle differences between sources.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* Navigation Bar */}
      <NavBar />
    </div>
  );
} 