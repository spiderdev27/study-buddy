import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, XCircle, Volume2, VolumeX } from 'lucide-react';

// Export the props type so it can be imported elsewhere
export type FocusModeProps = {
  topicTitle: string;
  topicId: string;
  onClose: () => void;
  onComplete: (studyDuration: number) => void;
};

export default function FocusMode({ topicTitle, topicId, onClose, onComplete }: FocusModeProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Setup audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/bell.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            clearInterval(interval as NodeJS.Timeout);
            setIsActive(false);
            setTotalStudyMinutes(prev => prev + 25); // Assuming default session is 25 mins
            if (audioRef.current) {
              audioRef.current.play();
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval as NodeJS.Timeout);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, minutes, seconds]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };
  
  const handleComplete = () => {
    // Pass the total study time in minutes to the parent component
    if (totalStudyMinutes > 0) {
      onComplete(totalStudyMinutes);
    } else {
      onComplete(0);
    }
  };
  
  const toggleSound = () => {
    setIsPlaying(!isPlaying);
  };
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-md w-full p-6"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black dark:text-white">Focus Mode</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Currently studying:
          </p>
          <p className="font-medium text-black dark:text-white text-lg">
            {topicTitle}
          </p>
        </div>
        
        <div className="flex justify-center mb-10">
          <div className="relative w-48 h-48 rounded-full border-4 border-primary flex items-center justify-center">
            <div className="text-3xl font-bold tracking-widest text-black dark:text-white">
              {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
            </div>
            
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-200 dark:text-gray-700 stroke-current"
                strokeWidth="4"
                cx="50"
                cy="50"
                r="46"
                fill="transparent"
              />
              <circle
                className="text-primary stroke-current"
                strokeWidth="4"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="46"
                fill="transparent"
                strokeDasharray="289.02652413026095"
                strokeDashoffset={289.02652413026095 * (1 - (seconds / 60 + minutes) / 25)}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={toggleTimer}
            className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          
          <button
            onClick={resetTimer}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2h4m-2 0v10m6.5 5a9 9 0 1 1-17.98 0" />
            </svg>
          </button>
          
          <button
            onClick={toggleSound}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isPlaying ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          {totalStudyMinutes > 0 ? (
            <p>Total time studied: {totalStudyMinutes} minutes</p>
          ) : (
            <p>Study session in progress</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Complete Session
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 