import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Bell, Play, Pause, SkipForward, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusModeProps {
  topicTitle: string;
  topicId: string;
  onComplete: () => void;
  onClose: () => void;
}

export default function FocusMode({ topicTitle, topicId, onComplete, onClose }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [distractionDetected, setDistractionDetected] = useState(false);
  const [tabFocused, setTabFocused] = useState(true);
  const [distractionCount, setDistractionCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveRef = useRef<number>(Date.now());
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progress = isBreak 
    ? ((5 * 60) - timeLeft) / (5 * 60) * 100
    : ((25 * 60) - timeLeft) / (25 * 60) * 100;
  
  // Start/pause timer
  const toggleTimer = () => {
    if (!isActive && !isBreak) {
      // Starting a new focus session
      setSessionStartTime(new Date());
    }
    
    setIsActive(!isActive);
  };
  
  // Skip to next phase (work/break)
  const skipPhase = () => {
    if (isBreak) {
      // If currently on break, start a new work session
      setTimeLeft(25 * 60);
      setIsBreak(false);
      setSessionStartTime(new Date());
    } else {
      // If currently working, skip to break - log the session
      logStudySession();
      setTimeLeft(5 * 60);
      setIsBreak(true);
      setCycles(cycles + 1);
    }
  };
  
  // Log the study session to the API
  const logStudySession = async () => {
    if (!sessionStartTime || !topicId) return;
    
    try {
      const response = await fetch('/api/study-planner/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studyTopicId: topicId,
          startTime: sessionStartTime,
          endTime: new Date(),
          distractionCount
        })
      });
      
      if (!response.ok) {
        console.error('Failed to log study session');
      }
      
      // Reset for next session
      setSessionStartTime(null);
      setDistractionCount(0);
      
    } catch (error) {
      console.error('Error logging study session:', error);
    }
  };
  
  // Handle close with cleanup
  const handleClose = () => {
    // If active and not on break, log the session
    if (isActive && !isBreak && sessionStartTime) {
      logStudySession();
    }
    onClose();
  };
  
  // Handle completion
  const handleComplete = () => {
    // If active and not on break, log the session
    if (isActive && !isBreak && sessionStartTime) {
      logStudySession();
    }
    onComplete();
  };
  
  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabFocused(false);
        if (isActive && !isBreak) {
          lastActiveRef.current = Date.now();
        }
      } else {
        setTabFocused(true);
        if (isActive && !isBreak) {
          const awayTime = (Date.now() - lastActiveRef.current) / 1000;
          if (awayTime > 30) { // If away for more than 30 seconds
            setDistractionDetected(true);
            setDistractionCount(prev => prev + 1);
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, isBreak]);
  
  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            
            // Play sound
            const audio = new Audio('/sounds/bell.mp3');
            audio.play().catch(e => console.log('Error playing sound', e));
            
            if (isBreak) {
              // End of break - start new work session
              setIsBreak(false);
              setSessionStartTime(new Date());
              return 25 * 60;
            } else {
              // End of work session - log and start break
              logStudySession();
              setIsBreak(true);
              setCycles(c => c + 1);
              return 5 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, isBreak, topicId]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive && !isBreak && sessionStartTime) {
        logStudySession();
      }
    };
  }, []);
  
  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };
  
  const alertVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <motion.div 
        className="w-full max-w-md bg-white dark:bg-card-bg rounded-2xl shadow-xl overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="relative">
          <div 
            className={cn(
              "absolute inset-0 transition-colors duration-500",
              isBreak ? "bg-blue-500/10" : "bg-primary/10"
            )}
            style={{ transform: `translateY(${100 - progress}%)` }}
          />
          
          <div className="p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                {isBreak ? "Take a Break" : "Focus Time"}
              </h2>
              <button 
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="text-center mb-8">
              <div className="w-44 h-44 mx-auto relative">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#e5e7eb" 
                    strokeWidth="5"
                    className="dark:opacity-30"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke={isBreak ? "#3b82f6" : "#8B5CF6"} 
                    strokeWidth="5"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * progress) / 100}
                    className="transition-all duration-1000"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-black dark:text-white">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {isBreak ? "Break" : "Focus"}
                  </div>
                </div>
              </div>
              
              <h3 className="mt-4 text-lg font-medium text-black dark:text-white">
                {isBreak ? "Take a moment to relax" : topicTitle}
              </h3>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {cycles} {cycles === 1 ? 'cycle' : 'cycles'} completed
              </div>
            </div>
            
            <AnimatePresence>
              {distractionDetected && (
                <motion.div 
                  className="mb-4 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 flex items-center gap-2"
                  variants={alertVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="text-sm">
                    Distraction detected! Try to stay focused on your current task.
                  </div>
                  <button 
                    onClick={() => setDistractionDetected(false)}
                    className="ml-auto p-1 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleTimer}
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
                  isActive
                    ? "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    : "bg-primary text-white hover:bg-primary/90"
                )}
              >
                {isActive ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>
              
              <button
                onClick={skipPhase}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <SkipForward className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isBreak 
                  ? "Get ready to start the next focus session" 
                  : "Stay focused on your current task"}
              </div>
              
              {distractionCount > 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {distractionCount} {distractionCount === 1 ? 'distraction' : 'distractions'} detected
                </div>
              )}
              
              <button
                onClick={handleComplete}
                className="mt-4 px-4 py-2 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Complete Session
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 