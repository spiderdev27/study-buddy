'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { X, Brain, Loader2, XCircle } from 'lucide-react';

export type AssessmentType = 'quiz' | 'flashcard';

interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface AssessmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, total: number) => void;
  messages: Array<{ role: string; content: string }>;
  type: AssessmentType;
}

interface QuizContentProps {
  questions: Question[];
  onComplete: (score: number, total: number) => void;
}

interface FlashcardContentProps {
  cards: Question[];
  onComplete: (score: number, total: number) => void;
}

// Quiz content component
function QuizContent({ questions, onComplete }: QuizContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === questions[currentIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      onComplete(score, questions.length);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>Score: {score}/{questions.length}</span>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <p className="text-lg font-medium">{questions[currentIndex].question}</p>
        
        {/* Options */}
        <div className="space-y-2">
          {questions[currentIndex].options?.map((option) => (
            <button
              key={option}
              onClick={() => !isAnswered && handleAnswer(option)}
              className={cn(
                "w-full p-3 rounded-lg border text-left transition-colors",
                isAnswered
                  ? option === questions[currentIndex].correctAnswer
                    ? "bg-green-100 border-green-500 dark:bg-green-900/30"
                    : option === selectedAnswer
                      ? "bg-red-100 border-red-500 dark:bg-red-900/30"
                      : "bg-gray-100 border-gray-300 dark:bg-gray-800"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
              )}
              disabled={isAnswered}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Explanation */}
        {isAnswered && (
          <div className={cn(
            "p-4 rounded-lg",
            isDark ? "bg-gray-800" : "bg-gray-100"
          )}>
            <p className="text-sm">{questions[currentIndex].explanation}</p>
          </div>
        )}

        {/* Next button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full p-3 rounded-lg bg-primary text-white hover:bg-primary/90"
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete'}
          </button>
        )}
      </div>
    </div>
  );
}

// Flashcard content component
function FlashcardContent({ cards, onComplete }: FlashcardContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const handleNext = (understood: boolean) => {
    if (understood) {
      setScore(score + 1);
    }
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      onComplete(score, cards.length);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span>Progress: {score}/{cards.length}</span>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={cn(
          "cursor-pointer p-6 rounded-lg min-h-[200px] flex items-center justify-center text-center transition-colors",
          isDark 
            ? "bg-gray-800 hover:bg-gray-700" 
            : "bg-white hover:bg-gray-50 border border-gray-200"
        )}
      >
        <div className="text-lg">
          {isFlipped ? cards[currentIndex].correctAnswer : cards[currentIndex].question}
        </div>
      </div>

      {/* Explanation */}
      {isFlipped && (
        <div className={cn(
          "p-4 rounded-lg",
          isDark ? "bg-gray-800" : "bg-gray-100"
        )}>
          <p className="text-sm">{cards[currentIndex].explanation}</p>
        </div>
      )}

      {/* Navigation buttons */}
      {isFlipped && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleNext(false)}
            className="p-3 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Need Review
          </button>
          <button
            onClick={() => handleNext(true)}
            className="p-3 rounded-lg bg-green-500 text-white hover:bg-green-600"
          >
            Got It!
          </button>
        </div>
      )}
    </div>
  );
}

export function AssessmentPopup({ isOpen, onClose, onComplete, messages, type }: AssessmentPopupProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = type === 'quiz' ? '/api/quiz/generate' : '/api/flashcards/generate';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          count: 5
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch questions');
      }
      
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch questions');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch questions when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchQuestions();
    }
  }, [isOpen]);

  const handleComplete = (score: number, total: number) => {
    onComplete(score, total);
    onClose(); // Close the popup after completion
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {type === 'quiz' ? 'Knowledge Check' : 'Flashcard Review'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="min-h-[300px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[300px] space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted-foreground">Generating {type === 'quiz' ? 'questions' : 'flashcards'}...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-[300px] space-y-4 text-center">
                  <XCircle className="w-12 h-12 text-destructive" />
                  <div>
                    <p className="text-lg font-semibold text-destructive">Error</p>
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                  <button
                    onClick={fetchQuestions}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : questions.length > 0 ? (
                type === 'quiz' ? (
                  <QuizContent questions={questions} onComplete={handleComplete} />
                ) : (
                  <FlashcardContent cards={questions} onComplete={handleComplete} />
                )
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">No questions available</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 