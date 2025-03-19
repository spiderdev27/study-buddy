'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { Calendar, Clock, Upload, CheckCircle, FileText, BarChart2, Brain, Calendar as CalendarIcon, RefreshCw, LightbulbIcon } from 'lucide-react';
import { GlowingParticles } from '@/components/effects/GlowingParticles';
import { cn } from '@/lib/utils';
import FocusMode from '@/components/study-planner/FocusMode';

// Types for our study planner
type StudyPlan = {
  id: string;
  title: string;
  deadline: Date;
  dailyHours: number;
  progress: number;
  topics: StudyTopic[];
  createdAt: Date;
};

type StudyTopic = {
  id: string;
  title: string;
  description: string;
  duration: number; // in hours
  status: 'pending' | 'in-progress' | 'completed' | 'needs-review';
  subtopics: StudySubtopic[];
  priority: 'low' | 'medium' | 'high';
  scheduledDate?: Date;
};

type StudySubtopic = {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  duration: number; // in minutes
};

export default function StudyPlanner() {
  const [activeStep, setActiveStep] = useState<'upload' | 'configure' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deadline, setDeadline] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
  const [dailyHours, setDailyHours] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualSyllabusText, setManualSyllabusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const controls = useAnimation();

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      simulateUploadProgress();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      simulateUploadProgress();
    }
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setActiveStep('configure');
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setUsingFallbackData(false);
    
    try {
      if (!file) {
        throw new Error("No syllabus file provided");
      }

      // Create form data to send to the API
      const formData = new FormData();
      formData.append('syllabus', file);
      formData.append('deadline', deadline.toISOString());
      formData.append('dailyHours', dailyHours.toString());
      
      // Add manual syllabus text if provided
      if (manualSyllabusText.trim()) {
        formData.append('manual_syllabus_text', manualSyllabusText);
      }
      
      console.log("Sending request to analyze syllabus:", file.name, file.type);
      
      // Call the Gemini API endpoint
      const response = await fetch('/api/study-planner/analyze', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API returned error:", errorData);
        throw new Error(errorData.error || "Failed to analyze syllabus");
      }
      
      // Parse the API response
      const data = await response.json();
      
      console.log("API response received:", {
        topicsCount: data.topics?.length || 0,
        recommendationsCount: data.recommendations?.length || 0,
        scheduleCount: data.schedule?.length || 0,
        is_fallback: data.is_fallback
      });
      
      // Check if we're using fallback data
      if (data.is_fallback === true) {
        console.log("Using fallback data as indicated by API response");
        setUsingFallbackData(true);
      } else {
        console.log("Using real Gemini-generated data");
        setUsingFallbackData(false);
      }
      
      // Store recommendations and schedule
      setRecommendations(data.recommendations || []);
      setScheduleData(data.schedule || []);
      
      // Convert the API response into our StudyPlan format
      const studyPlan: StudyPlan = {
        id: 'plan-' + Date.now(),
        title: file.name.split('.')[0] || 'Study Plan',
        deadline: deadline,
        dailyHours: dailyHours,
        progress: 0,
        topics: data.topics.map((topic: any) => ({
          id: `topic-${Math.random().toString(36).substring(2, 11)}`,
          title: topic.title,
          description: topic.description || `Study ${topic.title}`,
          duration: topic.duration,
          status: 'pending' as StudyTopic['status'],
          priority: (topic.priority || 'medium') as StudyTopic['priority'],
          subtopics: (topic.subtopics || []).map((subtopic: any) => ({
            id: `subtopic-${Math.random().toString(36).substring(2, 11)}`,
            title: subtopic.title,
            status: 'pending' as 'pending' | 'completed',
            duration: subtopic.duration || 30,
          })) as StudySubtopic[],
          scheduledDate: topic.date ? new Date(topic.date) : undefined,
        })),
        createdAt: new Date()
      };
      
      setStudyPlan(studyPlan);
      setActiveStep('results');
    } catch (error) {
      console.error("Error generating study plan:", error);
      // If there's an error, fall back to mock data for demonstration purposes
      const mockStudyPlan: StudyPlan = {
        id: 'plan-' + Date.now(),
        title: file?.name.split('.')[0] || 'Study Plan',
        deadline: deadline,
        dailyHours: dailyHours,
        progress: 0,
        topics: generateMockTopics(),
        createdAt: new Date()
      };
      
      // Add some mock recommendations
      setRecommendations([
        "Focus on high-priority topics first, especially those that are foundational for other topics.",
        "Take regular breaks using the Pomodoro technique (25 min study, 5 min break).",
        "Review completed topics periodically to strengthen retention."
      ]);
      
      setStudyPlan(mockStudyPlan);
      setActiveStep('results');
      setUsingFallbackData(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockTopics = (): StudyTopic[] => {
    const topics = [];
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science', 'Literature', 'Economics', 'Psychology', 'Sociology'];
    const priorities = ['low', 'medium', 'high'] as const;
    const statuses = ['pending', 'in-progress', 'completed', 'needs-review'] as const;
    
    // Generate a random number of topics between 8-12 instead of hardcoded 6
    const numTopics = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < numTopics; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const subTopics: StudySubtopic[] = [];
      
      // Generate a random number of subtopics between 3-6
      const numSubtopics = 3 + Math.floor(Math.random() * 4);
      
      for (let j = 0; j < numSubtopics; j++) {
        subTopics.push({
          id: `subtopic-${i}-${j}`,
          title: `${subject} subtopic ${j+1}`,
          status: Math.random() > 0.7 ? 'completed' : 'pending',
          duration: 30 + Math.floor(Math.random() * 60)
        });
      }
      
      topics.push({
        id: `topic-${i}`,
        title: `${subject} ${i+1}`,
        description: `Study comprehensive ${subject} topics including fundamental concepts and problem-solving techniques.`,
        duration: 2 + Math.floor(Math.random() * 4),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        subtopics: subTopics,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        scheduledDate: new Date(Date.now() + (i * 24 * 60 * 60 * 1000))
      });
    }
    
    return topics;
  };

  const handleTopicStatusChange = (topicId: string, status: StudyTopic['status']) => {
    if (!studyPlan) return;
    
    const updatedTopics = studyPlan.topics.map(topic => {
      if (topic.id === topicId) {
        return { ...topic, status };
      }
      return topic;
    });
    
    // Calculate new progress percentage
    const completedTopics = updatedTopics.filter(t => t.status === 'completed').length;
    const totalTopics = updatedTopics.length;
    const newProgress = (completedTopics / totalTopics) * 100;
    
    setStudyPlan({
      ...studyPlan,
      topics: updatedTopics,
      progress: newProgress
    });
  };

  const handleRestart = () => {
    setFile(null);
    setStudyPlan(null);
    setActiveStep('upload');
    setUploadProgress(0);
  };

  const handleStartFocus = (topic: StudyTopic) => {
    setSelectedTopic(topic);
    setShowFocusMode(true);
  };

  const handleFocusComplete = () => {
    if (selectedTopic && studyPlan) {
      // Mark the topic as in-progress when focus session ends
      handleTopicStatusChange(selectedTopic.id, 'in-progress');
    }
    setShowFocusMode(false);
  };

  const handleRefreshRecommendations = async () => {
    if (!studyPlan) return;
    
    setIsRefreshing(true);
    
    try {
      // Get completed and in-progress topics
      const completedTopics = studyPlan.topics.filter(t => t.status === 'completed').map(t => t.title);
      const inProgressTopics = studyPlan.topics.filter(t => t.status === 'in-progress').map(t => t.title);
      const pendingTopics = studyPlan.topics.filter(t => t.status === 'pending').map(t => t.title);
      
      // Call API to get new recommendations based on progress
      const response = await fetch('/api/study-planner/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completedTopics,
          inProgressTopics,
          pendingTopics,
          deadline: studyPlan.deadline,
          dailyHours: studyPlan.dailyHours,
          progress: studyPlan.progress
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Simple animation for the steps
  useEffect(() => {
    if (activeStep === 'upload') {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [activeStep, controls]);

  // Calculate days left until deadline
  const getDaysLeft = () => {
    if (!studyPlan) return 0;
    const today = new Date();
    const deadlineDate = new Date(studyPlan.deadline);
    const diff = deadlineDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="min-h-screen relative">
      {/* Glowing particles background */}
      <GlowingParticles />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            AI Study Planner
          </h1>
          <p className="text-center text-text-secondary mt-2 max-w-2xl mx-auto">
            Upload your syllabus, set your goals, and let our AI create a personalized study plan optimized for your learning journey
          </p>
        </header>
        
        {/* Stepper */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-1 md:gap-2">
            <div 
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                activeStep === 'upload' 
                  ? "bg-primary text-white" 
                  : "bg-card-bg text-text-primary"
              )}
            >
              <Upload size={20} />
            </div>
            <div className={cn("h-1 w-10 md:w-16 transition-all", activeStep !== 'upload' ? "bg-primary" : "bg-card-bg")} />
            
            <div 
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                activeStep === 'configure' 
                  ? "bg-primary text-white" 
                  : activeStep === 'results' 
                    ? "bg-primary text-white" 
                    : "bg-card-bg text-text-primary"
              )}
            >
              <Clock size={20} />
            </div>
            <div className={cn("h-1 w-10 md:w-16 transition-all", activeStep === 'results' ? "bg-primary" : "bg-card-bg")} />
            
            <div 
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                activeStep === 'results' 
                  ? "bg-primary text-white" 
                  : "bg-card-bg text-text-primary"
              )}
            >
              <Calendar size={20} />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div 
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 mb-8 text-center transition-all",
                  "bg-white/20 dark:bg-card-bg/20 backdrop-blur-xl",
                  "shadow-lg dark:shadow-none",
                  "ring-1 ring-black/5 dark:ring-white/10",
                  isDragging ? "border-primary" : "border-black/10 dark:border-white/10",
                  file ? "pointer-events-none" : "cursor-pointer hover:bg-white/30 dark:hover:bg-card-bg/30"
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                <div className="relative z-10">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  />
                  {!file ? (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                        <Upload className="w-10 h-10 text-primary" />
                      </div>
                      <div className="text-2xl font-semibold text-black dark:text-white">
                        Drop your syllabus here
                      </div>
                      <p className="text-gray-600 dark:text-gray-200">
                        Upload PDF, Word document, text file or image of your syllabus
                      </p>
                      <button className="px-4 py-2 rounded-lg bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition-colors backdrop-blur-sm text-black dark:text-white">
                        Select File
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-center gap-4">
                        <FileText className="w-10 h-10 text-primary" />
                        <div className="text-left">
                          <div className="font-medium text-black dark:text-white">{file.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-white/10 dark:bg-black/20 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      
                      <div className="text-center text-black dark:text-white">
                        {uploadProgress < 100 ? `Uploading: ${uploadProgress}%` : 'Upload Complete!'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG</p>
                <p className="mt-1">Max file size: 10MB</p>
              </div>
            </motion.div>
          )}

          {activeStep === 'configure' && (
            <motion.div
              key="configure"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/20 dark:bg-card-bg/20 backdrop-blur-xl rounded-xl p-6 mb-8 shadow-lg dark:shadow-none ring-1 ring-black/5 dark:ring-white/10">
                  <h2 className="text-xl font-semibold mb-6 text-black dark:text-white">Configure Your Study Plan</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        When is your deadline?
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <CalendarIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input 
                          type="date" 
                          className="bg-white/10 dark:bg-black/20 border border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-primary/50 outline-none"
                          min={new Date().toISOString().split('T')[0]}
                          value={deadline.toISOString().split('T')[0]}
                          onChange={(e) => setDeadline(new Date(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        How many hours can you study daily? ({dailyHours} hours)
                      </label>
                      <input 
                        type="range" 
                        min="1" 
                        max="8" 
                        step="0.5"
                        value={dailyHours}
                        onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/20 dark:bg-black/20 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>1 hour</span>
                        <span>8 hours</span>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={cn(
                          "w-full py-3 px-4 rounded-lg font-medium text-white transition-all",
                          "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90",
                          "shadow-md hover:shadow-lg",
                          isGenerating ? "opacity-70 cursor-not-allowed" : ""
                        )}
                      >
                        {isGenerating ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Generating your plan...</span>
                          </div>
                        ) : (
                          <span>Generate Study Plan</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={handleRestart}
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    Upload a different file
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 'results' && studyPlan && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plan Overview Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white/20 dark:bg-card-bg/20 backdrop-blur-xl rounded-xl p-6 shadow-lg dark:shadow-none ring-1 ring-black/5 dark:ring-white/10 h-full">
                    <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Plan Overview</h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Plan Name</div>
                        <div className="font-medium text-black dark:text-white">{studyPlan.title}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Deadline</div>
                        <div className="font-medium text-black dark:text-white">
                          {new Date(studyPlan.deadline).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Daily Study Time</div>
                        <div className="font-medium text-black dark:text-white">{studyPlan.dailyHours} hours</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Days Remaining</div>
                        <div className="font-medium text-black dark:text-white">{getDaysLeft()} days</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</div>
                        <div className="w-full bg-white/10 dark:bg-black/20 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            initial={{ width: 0 }}
                            animate={{ width: `${studyPlan.progress}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                          {Math.round(studyPlan.progress)}% Complete
                        </div>
                      </div>
                      
                      <div className="pt-4 space-y-2">
                        <button
                          onClick={handleRestart}
                          className="w-full py-2 px-4 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
                        >
                          Create New Plan
                        </button>
                        
                        <a 
                          href="#" 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            // Here you would generate and download a PDF or calendar file
                            alert('Plan export feature will be implemented soon!');
                          }}
                          className="block w-full text-center py-2 px-4 rounded-lg font-medium border border-primary text-primary hover:bg-primary/10 transition-colors"
                        >
                          Export Study Plan
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Topics List */}
                <div className="lg:col-span-2">
                  <div className="bg-white/20 dark:bg-card-bg/20 backdrop-blur-xl rounded-xl p-6 shadow-lg dark:shadow-none ring-1 ring-black/5 dark:ring-white/10">
                    <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Study Topics</h2>
                    
                    {usingFallbackData && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Using example study plan</p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                              We couldn't analyze your syllabus completely. Try uploading a text-based syllabus or adding a description below.
                            </p>
                            
                            {!showManualInput ? (
                              <button 
                                onClick={() => setShowManualInput(true)}
                                className="mt-2 text-xs px-3 py-1 bg-yellow-100 dark:bg-yellow-800/40 text-yellow-800 dark:text-yellow-300 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800/60 transition-colors"
                              >
                                Add syllabus description
                              </button>
                            ) : (
                              <div className="mt-3 space-y-2">
                                <textarea
                                  value={manualSyllabusText}
                                  onChange={(e) => setManualSyllabusText(e.target.value)}
                                  placeholder="Describe your course syllabus or enter topic names to study..."
                                  className="w-full h-24 px-3 py-2 text-sm bg-white dark:bg-black/40 border border-yellow-300 dark:border-yellow-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <div className="flex gap-2">
                                  <button 
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !manualSyllabusText.trim()}
                                    className={cn(
                                      "text-xs px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors",
                                      (isGenerating || !manualSyllabusText.trim()) ? "opacity-50 cursor-not-allowed" : ""
                                    )}
                                  >
                                    {isGenerating ? "Generating..." : "Generate New Plan"}
                                  </button>
                                  <button 
                                    onClick={() => setShowManualInput(false)}
                                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {studyPlan.topics.map((topic, index) => (
                        <motion.div
                          key={topic.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className={cn(
                            "border rounded-lg p-4 transition-all",
                            "hover:shadow-md",
                            topic.status === 'completed' 
                              ? "border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10" 
                              : topic.status === 'in-progress'
                                ? "border-blue-200 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10"
                                : topic.status === 'needs-review'
                                  ? "border-amber-200 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10"
                                  : "border-gray-200 dark:border-gray-700 bg-white/10 dark:bg-black/10"
                          )}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-black dark:text-white">{topic.title}</h3>
                                <div 
                                  className={cn(
                                    "text-xs px-2 py-0.5 rounded-full",
                                    topic.priority === 'high' 
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" 
                                      : topic.priority === 'medium'
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                  )}
                                >
                                  {topic.priority} priority
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{topic.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{topic.duration} hours</span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  <span>
                                    {topic.scheduledDate ? new Date(topic.scheduledDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    }) : 'Not scheduled'}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Subtopics progress */}
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  <span>Subtopics</span>
                                  <span>
                                    {topic.subtopics.filter(st => st.status === 'completed').length}/{topic.subtopics.length} completed
                                  </span>
                                </div>
                                <div className="w-full bg-white/10 dark:bg-black/20 h-1.5 rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full bg-gradient-to-r from-primary to-secondary"
                                    initial={{ width: 0 }}
                                    animate={{ 
                                      width: `${(topic.subtopics.filter(st => st.status === 'completed').length / topic.subtopics.length) * 100}%` 
                                    }}
                                    transition={{ duration: 1 }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <select
                                value={topic.status}
                                onChange={(e) => handleTopicStatusChange(topic.id, e.target.value as StudyTopic['status'])}
                                className="text-sm p-1 rounded bg-white/10 dark:bg-black/10 border border-gray-200 dark:border-gray-700 text-black dark:text-white outline-none focus:ring-1 focus:ring-primary/50"
                              >
                                <option value="pending">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="needs-review">Needs Review</option>
                              </select>
                              
                              <button
                                onClick={() => handleStartFocus(topic)}
                                className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
                              >
                                <Clock className="w-3 h-3" />
                                <span>Focus Mode</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* AI Recommendations Section */}
              <div className="mt-8">
                <div className="bg-white/20 dark:bg-card-bg/20 backdrop-blur-xl rounded-xl p-6 shadow-lg dark:shadow-none ring-1 ring-black/5 dark:ring-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Brain className="text-primary w-5 h-5" />
                      <h2 className="text-xl font-semibold text-black dark:text-white">AI Recommendations</h2>
                    </div>
                    
                    <button
                      onClick={handleRefreshRecommendations}
                      disabled={isRefreshing}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {isRefreshing ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Refreshing...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          <span>Refresh</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {recommendations.length > 0 ? (
                      recommendations.map((recommendation, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg bg-white/20 dark:bg-black/20 text-black dark:text-white flex items-start gap-3"
                        >
                          <div className="mt-1 flex-shrink-0">
                            <LightbulbIcon className="w-4 h-4 text-amber-500" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {recommendation}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-lg bg-white/20 dark:bg-black/20 text-black dark:text-white">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          No recommendations available. Refresh to get personalized suggestions.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Study Schedule Section */}
              {scheduleData.length > 0 && (
                <div className="mt-8">
                  <div className="bg-white/20 dark:bg-card-bg/20 backdrop-blur-xl rounded-xl p-6 shadow-lg dark:shadow-none ring-1 ring-black/5 dark:ring-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="text-primary w-5 h-5" />
                      <h2 className="text-xl font-semibold text-black dark:text-white">Study Schedule</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {scheduleData.slice(0, 9).map((day, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg bg-white/20 dark:bg-black/20 text-black dark:text-white"
                        >
                          <div className="font-medium mb-2">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            {day.topics.map((topic: string, i: number) => (
                              <li key={i} className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/70"></div>
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      
                      {scheduleData.length > 9 && (
                        <div className="p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                          <button className="text-sm text-primary">
                            View Full Schedule
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Focus Mode Dialog */}
      <AnimatePresence>
        {showFocusMode && selectedTopic && (
          <FocusMode
            topicTitle={selectedTopic.title}
            topicId={selectedTopic.id}
            onComplete={handleFocusComplete}
            onClose={() => setShowFocusMode(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 