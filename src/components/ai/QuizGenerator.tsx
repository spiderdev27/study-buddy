'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Brain, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { QuizQuestion } from '@/lib/gemini';

interface QuizGeneratorProps {
  subject: string;
  topic: string;
}

export function QuizGenerator({ subject, topic }: QuizGeneratorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questionCount, setQuestionCount] = useState(3);

  const generateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setQuizCompleted(false);
    setShowAnswer(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    
    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          topic,
          count: questionCount
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }
      
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleCheckAnswer = () => {
    setShowAnswer(true);
  };

  const handleUserAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  const calculateScore = () => {
    if (questions.length === 0) return 0;
    const correctAnswers = questions.filter((q, i) => 
      userAnswers[i]?.toLowerCase().includes(q.answer.toLowerCase())
    ).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };

  return (
    <Card className="p-6 w-full">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Quiz Generator
          </h3>
          
          <div className="flex items-center gap-2">
            <Select
              value={questionCount.toString()}
              onValueChange={(value) => setQuestionCount(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="# Questions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Questions</SelectItem>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={generateQuiz} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Quiz'
              )}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}
        
        {questions.length > 0 && !quizCompleted ? (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
              </span>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg mb-4">
              <p className="font-medium">{currentQuestion.question}</p>
            </div>
            
            <div className="mb-4">
              <Input
                placeholder="Type your answer here..."
                value={userAnswers[currentQuestionIndex] || ''}
                onChange={(e) => handleUserAnswer(e.target.value)}
                disabled={showAnswer}
              />
            </div>
            
            {showAnswer ? (
              <div className="p-4 bg-primary/10 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Correct Answer:</h4>
                <p>{currentQuestion.answer}</p>
                
                <div className="mt-4 flex items-center gap-2">
                  {userAnswers[currentQuestionIndex]?.toLowerCase().includes(currentQuestion.answer.toLowerCase()) ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-600">Your answer is correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-600">Your answer needs improvement.</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <Button onClick={handleCheckAnswer} className="w-full mb-4">
                Check Answer
              </Button>
            )}
            
            {showAnswer && (
              <Button onClick={handleNextQuestion} className="w-full">
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            )}
          </div>
        ) : quizCompleted ? (
          <div className="p-6 bg-muted/20 rounded-lg flex flex-col items-center">
            <Trophy className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Quiz Completed!</h3>
            <p className="text-center mb-4">
              You scored {calculateScore()}% on this quiz.
            </p>
            <Button onClick={generateQuiz}>Generate New Quiz</Button>
          </div>
        ) : (
          <div className="p-6 bg-muted/20 rounded-lg text-center">
            <p className="text-muted-foreground mb-4">
              Generate a quiz to test your knowledge about {topic} in {subject}.
            </p>
            <p className="text-sm text-muted-foreground">
              The quiz will be personalized based on your topic and will include questions of varying difficulty.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 