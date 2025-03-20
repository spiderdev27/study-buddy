'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Brain, ArrowRight, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { SessionAnalysis } from '@/lib/gemini';

interface SessionAnalyzerProps {
  session: {
    duration: number;
    productivity: number;
    notes: string;
  };
  task: {
    title: string;
    subject: string;
  };
}

export function SessionAnalyzer({ session, task }: SessionAnalyzerProps) {
  const [analysis, setAnalysis] = useState<SessionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState(session.notes || '');

  const analyzeSession = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const sessionWithNotes = {
        ...session,
        notes: sessionNotes
      };
      
      const response = await fetch('/api/ai/session-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: sessionWithNotes,
          task
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze session');
      }
      
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing session:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 w-full">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Session Analysis
          </h3>
        </div>
        
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/20 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p className="text-lg font-semibold">{session.duration} minutes</p>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Productivity</p>
              <p className="text-lg font-semibold">{session.productivity}%</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Session Notes</p>
            <Textarea
              placeholder="What did you study? What went well? What was challenging?"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add detailed notes about your session for better analysis
            </p>
          </div>
          
          <Button 
            onClick={analyzeSession} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Session
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
        
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}
        
        {analysis && (
          <div className="mt-4 space-y-4">
            <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
              <h4 className="font-medium mb-2 flex items-center text-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Strengths
              </h4>
              <ul className="space-y-1">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-sm ml-6 list-disc text-green-800">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg">
              <h4 className="font-medium mb-2 flex items-center text-amber-700">
                <AlertCircle className="h-4 w-4 mr-2" />
                Areas for Improvement
              </h4>
              <ul className="space-y-1">
                {analysis.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm ml-6 list-disc text-amber-800">
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
              <h4 className="font-medium mb-2 flex items-center text-blue-700">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Next Steps
              </h4>
              <ul className="space-y-1">
                {analysis.nextSteps.map((step, index) => (
                  <li key={index} className="text-sm ml-6 list-disc text-blue-800">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 