'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

// Icons
import { Mic, MicOff, Pause, Play, Square, Save, Trash, Loader2 } from 'lucide-react';

// Utility function for formatting time - moved outside component to prevent issues
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Define the Web Speech API types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item: (index: number) => SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onCancel: () => void;
  className?: string;
}

export function VoiceRecorder({
  onTranscriptionComplete,
  onCancel,
  className
}: VoiceRecorderProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check browser support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = (
        window.SpeechRecognition || 
        (window as any).webkitSpeechRecognition ||
        null
      );
      
      if (!SpeechRecognitionAPI) {
        setIsBrowserSupported(false);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);
  
  const startRecording = () => {
    if (!isBrowserSupported) return;
    
    const SpeechRecognitionAPI = (
      window.SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
    
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      setFinalTranscript(prev => prev + finalTranscript);
      setInterimTranscript(interimTranscript);
      setTranscript(prev => prev + finalTranscript);
    };
    
    recognitionRef.current.onend = () => {
      if (isRecording && !isPaused) {
        // If it ended but we didn't stop it, restart it
        recognitionRef.current?.start();
      }
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event);
    };
    
    recognitionRef.current.start();
    setIsRecording(true);
    setIsPaused(false);
  };
  
  const pauseRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsPaused(true);
    }
  };
  
  const resumeRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsPaused(false);
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };
  
  const handleSave = () => {
    onTranscriptionComplete(transcript);
  };
  
  const handleCancel = () => {
    stopRecording();
    onCancel();
  };
  
  if (!isBrowserSupported) {
    return (
      <div className={cn(
        "p-4 rounded-lg border text-center",
        isDark 
          ? "bg-gray-800 border-gray-700 text-gray-300" 
          : "bg-white border-gray-200 text-gray-700",
        className
      )}>
        <h3 className="font-medium mb-2">Speech Recognition Not Supported</h3>
        <p className="text-sm">
          Your browser doesn't support speech recognition. Please try using Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "p-4 rounded-lg border",
      isDark 
        ? "bg-gray-800 border-gray-700 text-white" 
        : "bg-white border-gray-200 text-gray-900",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Voice Note Recorder</h3>
        <div className={cn(
          "px-2 py-1 rounded-full text-xs",
          isRecording 
            ? isPaused 
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        )}>
          {isRecording 
            ? isPaused 
              ? "Paused" 
              : "Recording..." 
            : "Ready"
          }
        </div>
      </div>
      
      {isRecording && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Recording time</span>
            <span>{formatTime(recordingDuration)}</span>
          </div>
          
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-red-500"
              animate={{ width: isPaused ? "100%" : ["0%", "100%"] }}
              transition={{ 
                duration: 2, 
                repeat: isPaused ? 0 : Infinity,
                ease: "linear"
              }}
            />
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <div className={cn(
          "p-3 rounded-md min-h-[100px] max-h-[200px] overflow-y-auto text-sm",
          isDark 
            ? "bg-gray-900 border border-gray-700" 
            : "bg-gray-50 border border-gray-200"
        )}>
          {transcript || interimTranscript ? (
            <>
              <span>{transcript}</span>
              <span className="opacity-50">{interimTranscript}</span>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 italic">
              {isRecording 
                ? "Start speaking..." 
                : "Press the record button to start"
              }
            </span>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <div className="flex space-x-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className={cn(
                "p-2 rounded-full transition-colors",
                isDark 
                  ? "bg-red-900/30 text-red-300 hover:bg-red-900/50" 
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              )}
            >
              <Mic className="w-5 h-5" />
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeRecording}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark 
                      ? "bg-green-900/30 text-green-300 hover:bg-green-900/50" 
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  )}
                >
                  <Play className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={pauseRecording}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark 
                      ? "bg-amber-900/30 text-amber-300 hover:bg-amber-900/50" 
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  )}
                >
                  <Pause className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={stopRecording}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isDark 
                    ? "bg-red-900/30 text-red-300 hover:bg-red-900/50" 
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                )}
              >
                <Square className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleCancel}
            className={cn(
              "px-3 py-1 rounded-md text-sm transition-colors",
              isDark 
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={!transcript}
            className={cn(
              "px-3 py-1 rounded-md text-sm transition-colors flex items-center",
              !transcript
                ? "opacity-50 cursor-not-allowed"
                : "",
              isDark 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
          >
            <Save className="w-4 h-4 mr-1" />
            Insert
          </button>
        </div>
      </div>
    </div>
  );
} 