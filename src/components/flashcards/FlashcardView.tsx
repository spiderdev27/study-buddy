'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard } from '@/types/flashcards';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface FlashcardViewProps {
  flashcard: Flashcard;
  onConfidenceChange: (confidence: number) => void;
  onNext: () => void;
}

export function FlashcardView({ flashcard, onConfidenceChange, onNext }: FlashcardViewProps) {
  const { theme, resolvedTheme } = useTheme();
  // Use resolvedTheme for more reliable theme detection
  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === 'dark';
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const handleConfidenceRate = (confidence: number) => {
    if (hasRated) return;
    setHasRated(true);
    onConfidenceChange(confidence);
    setTimeout(() => {
      setIsFlipped(false);
      setHasRated(false);
      onNext();
    }, 500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto" data-theme={currentTheme}>
      {/* Card */}
      <motion.div
        className="relative w-full min-h-[300px] cursor-pointer perspective-1000"
        onClick={() => !hasRated && setIsFlipped(!isFlipped)}
      >
        <AnimatePresence initial={false} mode="wait">
          {isFlipped ? (
            <motion.div
              key="back"
              className={cn(
                "absolute inset-0 w-full h-full rounded-xl p-6 flex flex-col",
                "backdrop-blur-sm border overflow-hidden",
                isDark 
                  ? "bg-gray-800 border-white/10 text-white" 
                  : "bg-white border-gray-200 text-gray-900"
              )}
              initial={{ rotateY: -180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 180, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex-1 flex items-center justify-center text-center overflow-y-auto max-h-[220px] p-2">
                <p className={cn(
                  "text-lg break-words w-full",
                  isDark ? "text-white" : "text-gray-900"
                )}>{flashcard.back}</p>
              </div>
              
              {/* Confidence Rating */}
              {!hasRated && (
                <div className="mt-6">
                  <p className={cn(
                    "text-sm mb-4 text-center",
                    isDark ? "text-gray-300" : "text-gray-600"
                  )}>How well did you know this?</p>
                  <div className="flex justify-center gap-4 flex-wrap">
                    <motion.button
                      className="px-4 py-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleConfidenceRate(1)}
                    >
                      Not at all
                    </motion.button>
                    <motion.button
                      className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleConfidenceRate(2)}
                    >
                      Somewhat
                    </motion.button>
                    <motion.button
                      className="px-4 py-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleConfidenceRate(3)}
                    >
                      Perfectly
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="front"
              className={cn(
                "absolute inset-0 w-full h-full rounded-xl p-6 flex flex-col justify-center",
                "backdrop-blur-sm border overflow-hidden",
                isDark 
                  ? "bg-gray-800 border-white/10 text-white" 
                  : "bg-white border-gray-200 text-gray-900"
              )}
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -180, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center overflow-y-auto max-h-[250px] p-2">
                <p className={cn(
                  "text-lg mb-4 break-words",
                  isDark ? "text-white" : "text-gray-900"
                )}>{flashcard.front}</p>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>Click to flip</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 