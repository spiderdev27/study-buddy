'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NavBar } from '@/components/navigation/NavBar';
import { Header } from '@/components/navigation/Header';
import { useTheme } from '@/app/theme-selector';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

// Define the Quiz question type
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function QuizGenerator() {
  const { theme, colors } = useTheme();
  
  // State for quiz generation
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for quiz display and interaction
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Performance tracking
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  
  // Study recommendations
  const [studyRecommendations, setStudyRecommendations] = useState<string | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  
  // User performance history
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [showPerformanceHistory, setShowPerformanceHistory] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  
  // Handle topic input change
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };
  
  // Handle difficulty selection
  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(difficulty);
  };
  
  // Handle number of questions change
  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 20) {
      setNumQuestions(value);
      console.log('Number of questions set to:', value);
    }
  };
  
  // Generate the quiz
  const generateQuiz = async () => {
    if (!topic.trim()) {
      setError('Please enter at least one topic');
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    setQuiz([]);
    setSelectedAnswers([]);
    setShowResults(false);
    setIsQuizStarted(false);
    
    // Extract topics from the comma-separated input
    const topics = topic.split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    console.log(`Requesting quiz for topics: ${topics.join(', ')}, difficulty: ${difficulty}, questions: ${numQuestions}`);
    
    try {
      const response = await fetch('/api/tools/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topics, // Send array of topics instead of a single topic
          difficulty,
          numQuestions,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }
      
      if (data.success && Array.isArray(data.quiz)) {
        console.log(`Received quiz with ${data.quiz.length} questions`);
        setQuiz(data.quiz);
        // Initialize selectedAnswers array with empty strings
        setSelectedAnswers(new Array(data.quiz.length).fill(''));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Start the quiz
  const startQuiz = () => {
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
    setIsQuizStarted(true);
    console.log(`Starting quiz with ${quiz.length} questions`);
    setQuizStartTime(Date.now());
    setTimeSpent(0);
    setIsTimerRunning(false);
    setStudyRecommendations(null);
    setShowPerformanceHistory(false);
  };
  
  // Handle option selection
  const handleOptionSelect = (option: string) => {
    if (showResults) return;
    
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = option;
    setSelectedAnswers(newSelectedAnswers);
  };
  
  // Go to next question or finish quiz
  const handleNextQuestion = () => {
    setShowExplanation(false);
    
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      quiz.forEach((question, index) => {
        if (selectedAnswers[index] === question.correctAnswer) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setShowResults(true);
      console.log(`Quiz completed. Score: ${correctCount}/${quiz.length}`);
      setIsTimerRunning(false);
    }
  };
  
  // Go to previous question
  const handlePreviousQuestion = () => {
    setShowExplanation(false);
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Reset everything
  const handleReset = () => {
    setTopic('');
    setDifficulty('medium');
    setNumQuestions(5);
    setQuiz([]);
    setSelectedAnswers([]);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
    setIsQuizStarted(false);
    setError(null);
    setQuizStartTime(null);
    setTimeSpent(0);
    setIsTimerRunning(false);
    setStudyRecommendations(null);
    setIsLoadingRecommendations(false);
    setPerformanceHistory([]);
    setShowPerformanceHistory(false);
    setIsLoadingHistory(false);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };
  
  const itemVariants = {
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
  
  // Timer effect for tracking time spent on quiz
  useEffect(() => {
    if (isQuizStarted && !showResults && !isTimerRunning) {
      setQuizStartTime(Date.now());
      setTimeSpent(0);
      setIsTimerRunning(true);
    }
    
    if (isTimerRunning) {
      const timerInterval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timerInterval);
    }
    
    if (showResults && isTimerRunning) {
      setIsTimerRunning(false);
    }
  }, [isQuizStarted, showResults, isTimerRunning]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Load user performance history
  const loadPerformanceHistory = async () => {
    setIsLoadingHistory(true);
    
    try {
      const response = await fetch('/api/user/quiz-results?userId=anonymous');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.results)) {
        setPerformanceHistory(data.results);
      } else {
        console.error('Failed to load performance history:', data);
      }
    } catch (error) {
      console.error('Error loading performance history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  // Save quiz result
  const saveQuizResult = async () => {
    try {
      // Prepare question results
      const questionResults = quiz.map((question, index) => ({
        question: question.question,
        correct: selectedAnswers[index] === question.correctAnswer,
        userAnswer: selectedAnswers[index],
        correctAnswer: question.correctAnswer
      }));
      
      // Get topics array from comma-separated string
      const topicsArray = topic.split(',').map(t => t.trim()).filter(Boolean);
      
      const response = await fetch('/api/user/quiz-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'anonymous', // In a real app, you'd use the actual user ID
          topic, // Keep original format for backward compatibility
          topics: topicsArray, // Add the array of topics
          difficulty,
          score,
          totalQuestions: quiz.length,
          timeSpent,
          questionResults
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Failed to save quiz result:', data);
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };
  
  // Get study recommendations
  const getStudyRecommendations = async () => {
    setIsLoadingRecommendations(true);
    
    try {
      // Prepare question results
      const questionResults = quiz.map((question, index) => ({
        question: question.question,
        correct: selectedAnswers[index] === question.correctAnswer,
        userAnswer: selectedAnswers[index],
        correctAnswer: question.correctAnswer
      }));
      
      // Get topics array from comma-separated string
      const topicsArray = topic.split(',').map(t => t.trim()).filter(Boolean);
      
      const response = await fetch('/api/user/study-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic, // Keep original format for backward compatibility
          topics: topicsArray, // Add the array of topics
          difficulty,
          quizResults: {
            score,
            totalQuestions: quiz.length,
            timeSpent,
            questionResults
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.recommendations) {
        setStudyRecommendations(data.recommendations);
      } else {
        console.error('Failed to get study recommendations:', data);
      }
    } catch (error) {
      console.error('Error getting study recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary">
      {/* Common header */}
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {!quiz.length ? (
          // Quiz Generator Form
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  Quiz Generator
                </h1>
                <p className="text-text-secondary max-w-xl">
                  Create custom quizzes on any topic. Our AI will generate quiz questions tailored to your specifications.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="space-y-6">
                  {/* Topic Input */}
                  <div>
                    <label htmlFor="topic" className="block text-sm font-medium mb-2">
                      Quiz Topic <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="topic"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Enter topic(s) separated by commas (e.g. Ancient Rome, Quantum Physics)"
                      value={topic}
                      onChange={handleTopicChange}
                    />
                  </div>
                  
                  {/* Difficulty Selection */}
                  <div>
                    <span className="block text-sm font-medium mb-2">Difficulty Level</span>
                    <div className="flex flex-wrap gap-2">
                      {['easy', 'medium', 'hard'].map((level) => (
                        <button
                          key={level}
                          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                            difficulty === level
                              ? 'bg-primary/20 border border-primary/40'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                          onClick={() => handleDifficultyChange(level as 'easy' | 'medium' | 'hard')}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Number of Questions */}
                  <div>
                    <label htmlFor="numQuestions" className="block text-sm font-medium mb-2">
                      Number of Questions
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        id="numQuestions"
                        min="1"
                        max="20"
                        value={numQuestions}
                        onChange={handleNumQuestionsChange}
                        className="flex-1 h-2 appearance-none bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 accent-primary"
                      />
                      <span className="ml-4 px-3 py-1 bg-white/5 rounded-lg min-w-[40px] text-center">
                        {numQuestions}
                      </span>
                    </div>
                  </div>
                  
                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  
                  {/* Generate Button */}
                  <div className="pt-4">
                    <button
                      onClick={generateQuiz}
                      disabled={isGenerating || !topic.trim()}
                      className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg text-white font-medium shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Generate Quiz
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : !isQuizStarted ? (
          // Quiz Preview (before starting)
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Quiz Ready!</h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                      <path d="M9 12L11 14L15 10" />
                    </svg>
                  </div>
                  <span className="text-text-primary text-lg">
                    Topic{topic.includes(',') ? 's' : ''}: <span className="font-medium text-primary">{topic}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                      <path d="M9 12L11 14L15 10" />
                    </svg>
                  </div>
                  <span className="text-text-primary text-lg">Difficulty: <span className="font-medium text-primary capitalize">{difficulty}</span></span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                      <path d="M9 12L11 14L15 10" />
                    </svg>
                  </div>
                  <span className="text-text-primary text-lg">Questions: <span className="font-medium text-primary">{quiz.length}</span></span>
                </div>
              </div>
              
              <p className="text-text-secondary mb-8">
                You're about to start a quiz on {topic.includes(',') ? 'multiple topics including' : ''} {topic}. 
                The quiz contains {quiz.length} questions at a {difficulty} difficulty level. Good luck!
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={startQuiz}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg text-white font-medium shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <path d="M5 3L19 12L5 21V3Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Start Quiz
                </button>
                
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Generate Another Quiz
                </button>
              </div>
            </div>
          </motion.div>
        ) : showResults ? (
          // Quiz Results
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-center mb-8">
                <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-text-primary mb-2">Quiz Complete!</h2>
                <p className="text-text-secondary max-w-xl mx-auto">
                  You've completed the quiz on {topic}. Here's how you did:
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-center space-y-6 md:space-y-0 md:space-x-6 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 text-center">
                  <h3 className="text-text-secondary text-sm mb-1">Score</h3>
                  <div className="text-4xl font-bold text-primary">{score}/{quiz.length}</div>
                  <p className="text-text-secondary text-sm mt-1">
                    ({Math.round((score / quiz.length) * 100)}%)
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 text-center">
                  <h3 className="text-text-secondary text-sm mb-1">Time Spent</h3>
                  <div className="text-2xl font-bold text-text-primary">{formatTime(timeSpent)}</div>
                  <p className="text-text-secondary text-sm mt-1">
                    {Math.floor(timeSpent / 60)} min {timeSpent % 60} sec
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 text-center">
                  <h3 className="text-text-secondary text-sm mb-1">Performance</h3>
                  <div className="text-2xl font-bold">
                    {score / quiz.length >= 0.8 ? (
                      <span className="text-green-400">Excellent</span>
                    ) : score / quiz.length >= 0.6 ? (
                      <span className="text-yellow-400">Good</span>
                    ) : score / quiz.length >= 0.4 ? (
                      <span className="text-orange-400">Fair</span>
                    ) : (
                      <span className="text-red-400">Needs Improvement</span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm mt-1">
                    {score / quiz.length >= 0.8 ? 'Great job!' : score / quiz.length >= 0.6 ? 'Well done!' : 'Keep practicing!'}
                  </p>
                </div>
              </div>
              
              {/* Buttons for Recommendations and History */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button
                  onClick={() => {
                    if (!studyRecommendations) {
                      getStudyRecommendations();
                      saveQuizResult();
                    } else {
                      setStudyRecommendations(null);
                    }
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  {isLoadingRecommendations ? 'Loading...' : studyRecommendations ? 'Hide Recommendations' : 'Get Study Recommendations'}
                </button>
                
                <button
                  onClick={() => {
                    if (!showPerformanceHistory) {
                      loadPerformanceHistory();
                    }
                    setShowPerformanceHistory(!showPerformanceHistory);
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                    <path d="M12 20v-6M12 8V2M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M20 12h-6M8 12H2M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
                  </svg>
                  {isLoadingHistory ? 'Loading...' : showPerformanceHistory ? 'Hide Performance History' : 'View Performance History'}
                </button>
              </div>
              
              {/* Study Recommendations Section */}
              {studyRecommendations && (
                <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="text-xl font-medium text-text-primary mb-4 flex items-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                    Personalized Study Recommendations
                  </h3>
                  
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>
                      {studyRecommendations}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              
              {/* Performance History Section */}
              {showPerformanceHistory && (
                <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="text-xl font-medium text-text-primary mb-4 flex items-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    Your Quiz Performance History
                  </h3>
                  
                  {performanceHistory.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary">
                      <p>No quiz history available yet.</p>
                      <p className="text-sm mt-2">Complete more quizzes to see your progress over time.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3">Date</th>
                            <th className="text-left py-2 px-3">Topic</th>
                            <th className="text-left py-2 px-3">Difficulty</th>
                            <th className="text-left py-2 px-3">Score</th>
                            <th className="text-left py-2 px-3">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {performanceHistory.map((result, index) => (
                            <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-2 px-3">{new Date(result.date).toLocaleDateString()}</td>
                              <td className="py-2 px-3">{result.topic}</td>
                              <td className="py-2 px-3 capitalize">{result.difficulty}</td>
                              <td className="py-2 px-3">
                                {result.score}/{result.totalQuestions} ({Math.round((result.score / result.totalQuestions) * 100)}%)
                              </td>
                              <td className="py-2 px-3">{formatTime(result.timeSpent)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              <h3 className="text-xl font-medium text-text-primary mb-4">Question Summary</h3>
              
              <div className="space-y-4 mb-8">
                {quiz.map((question, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${
                    selectedAnswers[index] === question.correctAnswer
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-start">
                      <div className={`p-1 rounded-full ${
                        selectedAnswers[index] === question.correctAnswer
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      } mr-2 mt-0.5`}>
                        {selectedAnswers[index] === question.correctAnswer ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary mb-1">
                          Question {index + 1}: {question.question}
                        </h4>
                        <div className="text-sm text-text-secondary mb-2">
                          <span className="inline-block">Your answer: <span className={selectedAnswers[index] === question.correctAnswer ? 'text-green-400' : 'text-red-400'}>{selectedAnswers[index] || 'No answer'}</span></span>
                          {selectedAnswers[index] !== question.correctAnswer && (
                            <span className="inline-block ml-4">Correct answer: <span className="text-green-400">{question.correctAnswer}</span></span>
                          )}
                        </div>
                        <div className="text-sm text-text-secondary">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => {
                    setIsQuizStarted(false);
                    setShowResults(false);
                    setStudyRecommendations(null);
                    setShowPerformanceHistory(false);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg text-white font-medium shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <path d="M17 2L7 12L17 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back to Quiz
                </button>
                
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Generate New Quiz
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // Quiz Questions
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-sm">Question {currentQuestionIndex + 1} of {quiz.length}</span>
                  <span className="text-text-secondary text-sm">Progress: {Math.round(((currentQuestionIndex + 1) / quiz.length) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Timer display in the Quiz Questions component */}
              <div className="absolute top-4 right-4 bg-white/10 px-3 py-1.5 rounded-lg text-sm flex items-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatTime(timeSpent)}
              </div>
              
              {/* Question Display */}
              <div className="mb-6">
                <h2 className="text-xl font-medium text-text-primary mb-4">
                  {quiz[currentQuestionIndex].question}
                </h2>
                
                <div className="space-y-3">
                  {quiz[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full p-4 text-left rounded-lg transition-colors ${
                        selectedAnswers[currentQuestionIndex] === option
                          ? 'bg-primary/20 border border-primary/40'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                      disabled={showExplanation}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          selectedAnswers[currentQuestionIndex] === option
                            ? 'bg-primary/30 text-white'
                            : 'bg-white/10 text-text-secondary'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-text-primary">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Explanation (when shown) */}
              {showExplanation && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <h3 className="font-medium text-primary mb-2">Explanation</h3>
                  <p className="text-text-secondary">
                    {quiz[currentQuestionIndex].explanation}
                  </p>
                  {selectedAnswers[currentQuestionIndex] !== quiz[currentQuestionIndex].correctAnswer && (
                    <div className="mt-2 text-text-secondary">
                      <span>Correct answer: <span className="text-green-400">{quiz[currentQuestionIndex].correctAnswer}</span></span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                    <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Previous
                </button>
                
                <div className="flex space-x-3">
                  {!showExplanation && selectedAnswers[currentQuestionIndex] && (
                    <button
                      onClick={() => setShowExplanation(true)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Show Explanation
                    </button>
                  )}
                  
                  <button
                    onClick={handleNextQuestion}
                    disabled={!selectedAnswers[currentQuestionIndex]}
                    className={`px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center ${
                      selectedAnswers[currentQuestionIndex]
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-primary/20'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    {currentQuestionIndex === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Footer Navigation */}
      <NavBar />
      
      <style jsx global>{`
        /* Custom Scrollbar Styles */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        /* Focus styles for better accessibility */
        :focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }
        
        /* Loading skeleton animation */
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .loading-skeleton {
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.03) 25%, 
            rgba(255, 255, 255, 0.08) 37%, 
            rgba(255, 255, 255, 0.03) 63%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        /* Adjustments for mobile */
        @media (max-width: 640px) {
          .quiz-controls {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
} 