'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { 
  SmartNote, 
  AIStudyPlan, 
  AISuggestedReference 
} from '@/types/smart-notes';

// Icons
import {
  Brain, HelpCircle, Link, GraduationCap, 
  Book, CheckCircle, Clock, Sparkles,
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';

interface AdvancedAIProps {
  note: SmartNote;
  onUpdateNote: (updatedNote: SmartNote) => void;
  className?: string;
}

export function AdvancedAI({ note, onUpdateNote, className }: AdvancedAIProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [activeTab, setActiveTab] = useState<
    'questions' | 'related-concepts' | 'references' | 'study-plan'
  >('questions');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Generate quiz questions based on note content
  const generateQuestions = async () => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would be an API call to an AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI-generated questions
      const questions = [
        "What are the key differences between classical and quantum computing?",
        "How does superposition contribute to a quantum computer's processing power?",
        "Why is quantum entanglement important for quantum information processing?",
        "What challenges need to be overcome for quantum computing to become practical?",
        "How would you explain the concept of quantum gates to someone with a background in classical computing?"
      ];
      
      // Update the note with generated questions
      onUpdateNote({
        ...note,
        aiQuestions: questions
      });
      
      setShowResults(true);
    } catch (error) {
      console.error("Error generating questions:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Find related concepts
  const findRelatedConcepts = async () => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI-generated related concepts
      const concepts = [
        "Quantum Cryptography",
        "Quantum Teleportation",
        "Error Correction in Quantum Systems",
        "Quantum Supremacy",
        "Quantum Machine Learning",
        "Quantum Algorithms (Shor's, Grover's)",
        "Quantum Logic Gates"
      ];
      
      // Update the note
      onUpdateNote({
        ...note,
        aiRelatedConcepts: concepts
      });
      
      setShowResults(true);
    } catch (error) {
      console.error("Error finding related concepts:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Suggest academic references
  const suggestReferences = async () => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI-generated references
      const references: AISuggestedReference[] = [
        {
          title: "Quantum Computing: An Applied Approach",
          authors: "Jack D. Hidary",
          year: 2021,
          url: "https://example.com/quantum-computing",
          description: "Comprehensive introduction to quantum computing principles."
        },
        {
          title: "Quantum Computation and Quantum Information",
          authors: "Michael A. Nielsen & Isaac L. Chuang",
          year: 2010,
          description: "The definitive textbook on quantum computing."
        },
        {
          title: "Programming Quantum Computers: Essential Algorithms and Code Samples",
          authors: "Eric R. Johnston, Nic Harrigan, and Mercedes Gimeno-Segovia",
          year: 2019,
          url: "https://example.com/programming-quantum-computers"
        },
        {
          title: "Dancing with Qubits: How Quantum Computing Works",
          authors: "Robert S. Sutor",
          year: 2022,
          description: "Accessible introduction to quantum computing concepts."
        }
      ];
      
      // Update the note
      onUpdateNote({
        ...note,
        aiSuggestedReferences: references
      });
      
      setShowResults(true);
    } catch (error) {
      console.error("Error suggesting references:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Generate study plan
  const generateStudyPlan = async () => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI-generated study plan
      const studyPlan: AIStudyPlan = {
        topics: [
          "Fundamentals of Quantum Mechanics",
          "Qubits and Quantum States",
          "Quantum Gates and Circuits", 
          "Quantum Algorithms",
          "Quantum Error Correction"
        ],
        estimatedStudyTime: "4 weeks (10 hours/week)",
        recommendedSequence: [
          "Start with understanding classical vs quantum computing paradigms",
          "Master the mathematical foundations of quantum states and operations",
          "Practice implementing basic quantum circuits",
          "Study the major quantum algorithms and their applications",
          "Explore emerging research in quantum error correction"
        ],
        exercises: [
          "Implement a quantum circuit simulator",
          "Solve quantum algorithm problems",
          "Design a quantum error correction scheme",
          "Create quantum system visualizations"
        ]
      };
      
      // Update the note
      onUpdateNote({
        ...note,
        aiStudyPlan: studyPlan
      });
      
      setShowResults(true);
    } catch (error) {
      console.error("Error generating study plan:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setShowResults(false);
  };
  
  // Get active feature function based on tab
  const getActiveFeature = () => {
    switch (activeTab) {
      case 'questions':
        return {
          action: generateQuestions,
          title: 'Generate Practice Questions',
          description: 'Create quiz questions based on your note content',
          hasData: !!note.aiQuestions?.length,
          icon: <HelpCircle className="w-5 h-5" />
        };
      case 'related-concepts':
        return {
          action: findRelatedConcepts,
          title: 'Find Related Concepts',
          description: 'Discover related topics and ideas to explore',
          hasData: !!note.aiRelatedConcepts?.length,
          icon: <Link className="w-5 h-5" />
        };
      case 'references':
        return {
          action: suggestReferences,
          title: 'Suggest Academic References',
          description: 'Get recommended books, papers, and resources',
          hasData: !!note.aiSuggestedReferences?.length,
          icon: <Book className="w-5 h-5" />
        };
      case 'study-plan':
        return {
          action: generateStudyPlan,
          title: 'Create Study Plan',
          description: 'Generate a structured learning path based on this content',
          hasData: !!note.aiStudyPlan,
          icon: <GraduationCap className="w-5 h-5" />
        };
    }
  };
  
  const activeFeature = getActiveFeature();
  
  // Render each result type
  const renderResults = () => {
    switch (activeTab) {
      case 'questions':
        return renderQuestions();
      case 'related-concepts':
        return renderRelatedConcepts();
      case 'references':
        return renderReferences();
      case 'study-plan':
        return renderStudyPlan();
    }
  };
  
  // Render questions
  const renderQuestions = () => {
    if (!note.aiQuestions?.length) return null;
    
    return (
      <div className="space-y-3">
        {note.aiQuestions.map((question, index) => (
          <div 
            key={index}
            className={cn(
              "p-3 rounded-lg border",
              isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}
          >
            <div className="flex items-start">
              <span className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2",
                isDark ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700"
              )}>
                {index + 1}
              </span>
              <span>{question}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render related concepts
  const renderRelatedConcepts = () => {
    if (!note.aiRelatedConcepts?.length) return null;
    
    return (
      <div className="flex flex-wrap gap-2">
        {note.aiRelatedConcepts.map((concept, index) => (
          <div 
            key={index}
            className={cn(
              "px-3 py-2 rounded-full text-sm",
              isDark ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-800"
            )}
          >
            {concept}
          </div>
        ))}
      </div>
    );
  };
  
  // Render references
  const renderReferences = () => {
    if (!note.aiSuggestedReferences?.length) return null;
    
    return (
      <div className="space-y-3">
        {note.aiSuggestedReferences.map((reference, index) => (
          <div 
            key={index}
            className={cn(
              "p-3 rounded-lg border",
              isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}
          >
            <div className="flex justify-between">
              <h4 className="font-medium">{reference.title}</h4>
              {reference.url && (
                <a 
                  href={reference.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "p-1 rounded-full",
                    isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  )}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {reference.authors}, {reference.year}
            </div>
            {reference.description && (
              <p className="mt-1 text-sm">{reference.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render study plan
  const renderStudyPlan = () => {
    if (!note.aiStudyPlan) return null;
    
    const { topics, estimatedStudyTime, recommendedSequence, exercises } = note.aiStudyPlan;
    
    return (
      <div className="space-y-4">
        <div>
          <h4 className={cn(
            "text-sm font-medium mb-2 flex items-center",
            isDark ? "text-gray-300" : "text-gray-700"
          )}>
            <span className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Key Topics
            </span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <div 
                key={index}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm",
                  isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"
                )}
              >
                {topic}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className={cn(
            "text-sm font-medium mb-2 flex items-center",
            isDark ? "text-gray-300" : "text-gray-700"
          )}>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5" />
              Estimated Study Time
            </span>
          </h4>
          <div className={cn(
            "px-3 py-2 rounded-lg border",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            {estimatedStudyTime}
          </div>
        </div>
        
        <div>
          <h4 className={cn(
            "text-sm font-medium mb-2 flex items-center",
            isDark ? "text-gray-300" : "text-gray-700"
          )}>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Recommended Learning Sequence
            </span>
          </h4>
          <ol className="space-y-2 pl-5 list-decimal">
            {recommendedSequence.map((step, index) => (
              <li key={index} className="text-sm">
                {step}
              </li>
            ))}
          </ol>
        </div>
        
        <div>
          <h4 className={cn(
            "text-sm font-medium mb-2 flex items-center",
            isDark ? "text-gray-300" : "text-gray-700"
          )}>
            <span className="flex items-center">
              <GraduationCap className="w-4 h-4 mr-1.5" />
              Recommended Exercises
            </span>
          </h4>
          <ul className="space-y-2 pl-5 list-disc">
            {exercises.map((exercise, index) => (
              <li key={index} className="text-sm">
                {exercise}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn(
        "flex w-full border-b overflow-x-auto scrollbar-thin",
        isDark ? "border-gray-700" : "border-gray-200"
      )}>
        <button
          className={cn(
            "px-4 py-2 border-b-2 text-sm font-medium whitespace-nowrap",
            activeTab === 'questions'
              ? isDark 
                ? "border-blue-500 text-blue-400" 
                : "border-blue-500 text-blue-600"
              : isDark 
                ? "border-transparent text-gray-400 hover:text-gray-300" 
                : "border-transparent text-gray-500 hover:text-gray-800"
          )}
          onClick={() => handleTabChange('questions')}
        >
          <div className="flex items-center">
            <HelpCircle className="w-4 h-4 mr-1.5" />
            Questions
          </div>
        </button>
        
        <button
          className={cn(
            "px-4 py-2 border-b-2 text-sm font-medium whitespace-nowrap",
            activeTab === 'related-concepts'
              ? isDark 
                ? "border-purple-500 text-purple-400" 
                : "border-purple-500 text-purple-600"
              : isDark 
                ? "border-transparent text-gray-400 hover:text-gray-300" 
                : "border-transparent text-gray-500 hover:text-gray-800"
          )}
          onClick={() => handleTabChange('related-concepts')}
        >
          <div className="flex items-center">
            <Link className="w-4 h-4 mr-1.5" />
            Related Concepts
          </div>
        </button>
        
        <button
          className={cn(
            "px-4 py-2 border-b-2 text-sm font-medium whitespace-nowrap",
            activeTab === 'references'
              ? isDark 
                ? "border-amber-500 text-amber-400" 
                : "border-amber-500 text-amber-600"
              : isDark 
                ? "border-transparent text-gray-400 hover:text-gray-300" 
                : "border-transparent text-gray-500 hover:text-gray-800"
          )}
          onClick={() => handleTabChange('references')}
        >
          <div className="flex items-center">
            <Book className="w-4 h-4 mr-1.5" />
            References
          </div>
        </button>
        
        <button
          className={cn(
            "px-4 py-2 border-b-2 text-sm font-medium whitespace-nowrap",
            activeTab === 'study-plan'
              ? isDark 
                ? "border-green-500 text-green-400" 
                : "border-green-500 text-green-600"
              : isDark 
                ? "border-transparent text-gray-400 hover:text-gray-300" 
                : "border-transparent text-gray-500 hover:text-gray-800"
          )}
          onClick={() => handleTabChange('study-plan')}
        >
          <div className="flex items-center">
            <GraduationCap className="w-4 h-4 mr-1.5" />
            Study Plan
          </div>
        </button>
      </div>
      
      <div>
        {/* Feature Action Button */}
        {activeFeature && !activeFeature.hasData && !showResults && (
          <button
            onClick={activeFeature.action}
            disabled={isProcessing}
            className={cn(
              "w-full py-3 px-4 rounded-lg text-sm border flex items-center justify-center gap-2 mb-4",
              isProcessing ? "opacity-70 cursor-not-allowed" : "",
              isDark 
                ? "bg-gray-800 border-gray-700 hover:bg-gray-750 text-white" 
                : "bg-white border-gray-200 hover:bg-gray-50 text-gray-900",
            )}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-blue-500" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {activeFeature.icon}
                <span>{activeFeature.title}</span>
              </>
            )}
          </button>
        )}
        
        {/* Feature Description */}
        {!isProcessing && !showResults && !activeFeature.hasData && (
          <div className={cn(
            "p-4 text-sm rounded-lg border text-center",
            isDark 
              ? "bg-gray-800/30 border-gray-700 text-gray-400" 
              : "bg-gray-50 border-gray-200 text-gray-600",
            )}
          >
            <p>{activeFeature.description}</p>
          </div>
        )}
        
        {/* Results Section */}
        {(showResults || activeFeature.hasData) && (
          <div className="mt-4 space-y-4">
            {/* Result Header */}
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "text-base font-medium flex items-center",
                isDark ? "text-gray-200" : "text-gray-800"
              )}>
                <Brain className="w-4 h-4 mr-1.5" />
                AI-Generated Results
              </h3>
              
              <button
                onClick={() => activeFeature.action()}
                className={cn(
                  "text-xs px-2 py-1 rounded-md",
                  isDark 
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                )}
              >
                Regenerate
              </button>
            </div>
            
            {/* Result Content */}
            <div className="space-y-4">
              {renderResults()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 