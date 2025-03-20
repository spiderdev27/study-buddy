'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/app/theme-selector';

// Interface for API response containing suggestion data
interface AISuggestion {
  id: string;
  text: string;
  type: 'main' | 'sub' | 'leaf';
  confidence: number;
}

interface AIAssistantPanelProps {
  activeNode: {
    id: string;
    text: string;
    type?: string;
  } | null;
  suggestions: string[];
  isLoading: boolean;
  onClose: () => void;
  onGenerateIdeas: (nodeId: string) => void;
  onAddSuggestion: (suggestion: string) => void;
  onExpandNode: (nodeId: string) => void;
  onApplySuggestion: (suggestion: AISuggestion) => void;
  currentNodeText: string;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  activeNode,
  suggestions,
  isLoading,
  onClose,
  onGenerateIdeas,
  onAddSuggestion,
  onExpandNode,
  onApplySuggestion,
  currentNodeText
}) => {
  const { colors } = useTheme();
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeSuggestionPanel, setActiveSuggestionPanel] = useState('ideas');
  const panelRef = useRef<HTMLDivElement>(null);
  const [promptHistory, setPromptHistory] = useState<Array<{prompt: string, timestamp: Date}>>([]);
  const [isCustomPromptLoading, setIsCustomPromptLoading] = useState(false);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Templates for different AI operations
  const promptTemplates = [
    { id: 'basic', text: 'Suggest related ideas for "{topic}"' },
    { id: 'detailed', text: 'Create a detailed breakdown of "{topic}" with examples' },
    { id: 'counter', text: 'Suggest opposing viewpoints to "{topic}"' },
    { id: 'questions', text: 'Generate questions about "{topic}" to explore further' },
    { id: 'examples', text: 'Provide real-world examples of "{topic}"' },
  ];
  
  // Mock history of AI interactions
  const [aiHistory, setAiHistory] = useState([
    { 
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      topic: 'Machine Learning',
      interaction: 'generated ideas'
    },
    { 
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      topic: 'Sustainable Energy',
      interaction: 'expanded subtopics'
    },
  ]);
  
  // Handle click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Handle custom prompt submission
  const handleSubmitCustomPrompt = () => {
    if (activeNode && customPrompt.trim()) {
      onGenerateIdeas(activeNode.id);
      setCustomPrompt('');
    }
  };
  
  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };
  
  // Submit custom prompt to get AI suggestions
  const handlePromptSubmit = () => {
    if (!customPrompt.trim()) return;
    
    // Simulate API call to get suggestions
    setIsCustomPromptLoading(true);
    
    // Add to prompt history
    setPromptHistory([
      { prompt: customPrompt, timestamp: new Date() },
      ...promptHistory
    ]);
    
    // Simulate API response delay
    setTimeout(() => {
      // Generate new mock suggestions based on the prompt
      const newSuggestions: AISuggestion[] = [
        {
          id: `custom-${Date.now()}-1`,
          text: `${customPrompt.split(' ').slice(0, 3).join(' ')}...`,
          type: 'main',
          confidence: 0.9 - Math.random() * 0.1,
        },
        {
          id: `custom-${Date.now()}-2`,
          text: `Implementation of ${customPrompt.split(' ').slice(-2).join(' ')}`,
          type: 'sub',
          confidence: 0.8 - Math.random() * 0.2,
        },
        {
          id: `custom-${Date.now()}-3`,
          text: `Analysis of ${customPrompt.split(' ').slice(1, 4).join(' ')}`,
          type: 'sub',
          confidence: 0.7 - Math.random() * 0.2,
        }
      ];
      
      onAddSuggestion(customPrompt);
      setCustomPrompt('');
      setIsCustomPromptLoading(false);
      setActiveSuggestionPanel('ideas');
    }, 1500);
  };
  
  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: AISuggestion) => {
    onApplySuggestion(suggestion);
  };
  
  // Format the confidence score as a percentage
  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };
  
  // Get the appropriate color for a confidence score
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return colors.green;
    if (confidence >= 0.6) return colors.orange;
    return colors.red;
  };
  
  return (
    <motion.div
      ref={panelRef}
      className="fixed right-6 bottom-24 w-80 max-h-[70vh] bg-bg-card backdrop-blur-xl rounded-xl border border-white/10 shadow-xl overflow-hidden z-50"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium">Gemini AI Assistant</h3>
            <p className="text-xs text-text-secondary">Helping you expand your ideas</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-text-secondary hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10">
        <button 
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeSuggestionPanel === 'ideas' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-text-secondary hover:text-white'
          }`}
          onClick={() => setActiveSuggestionPanel('ideas')}
        >
          AI Suggestions
        </button>
        <button 
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeSuggestionPanel === 'templates' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-text-secondary hover:text-white'
          }`}
          onClick={() => setActiveSuggestionPanel('templates')}
        >
          Templates
        </button>
        <button 
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeSuggestionPanel === 'history' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-text-secondary hover:text-white'
          }`}
          onClick={() => setActiveSuggestionPanel('history')}
        >
          History
        </button>
      </div>
      
      {/* Content Area */}
      <div className="overflow-y-auto custom-scrollbar max-h-[calc(70vh-8rem)]">
        {/* Active Node Info */}
        {activeNode && (
          <div className="p-4 bg-white/5 border-b border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-medium text-text-secondary">Selected Node</h4>
                <p className="text-sm font-medium mt-1">{activeNode.text}</p>
              </div>
              <div className="text-xs py-0.5 px-2 rounded-full bg-white/10 text-text-secondary">
                {activeNode.type}
              </div>
            </div>
            
            <div className="mt-3 flex gap-2">
              <button 
                className="text-xs py-1 px-2 rounded bg-primary text-white flex items-center gap-1"
                onClick={() => activeNode && onGenerateIdeas(activeNode.id)}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Generate Ideas
              </button>
              
              <button 
                className="text-xs py-1 px-2 rounded bg-secondary text-white flex items-center gap-1"
                onClick={() => activeNode && onExpandNode(activeNode.id)}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                </svg>
                Auto-Expand
              </button>
            </div>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {/* Ideas Panel */}
          {activeSuggestionPanel === 'ideas' && (
            <motion.div
              key="ideas-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              {!activeNode ? (
                <div className="text-center py-8 text-text-secondary text-sm">
                  Select a node to generate AI suggestions
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2"></div>
                  <p className="text-xs text-text-secondary">Generating ideas...</p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8 text-text-secondary text-sm">
                  <p>No suggestions yet.</p>
                  <p className="mt-2">Click "Generate Ideas" to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer flex justify-between items-center group"
                      onClick={() => handleSelectSuggestion({ 
                        id: `sugg-${index}`, 
                        text: suggestion, 
                        type: index === 0 ? 'main' : index < 3 ? 'sub' : 'leaf',
                        confidence: 0.9 - (index * 0.05)
                      })}
                    >
                      <span className="text-xs flex-1">{suggestion}</span>
                      <span className="text-text-tertiary text-xs opacity-0 group-hover:opacity-100 transition-opacity">Add</span>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Custom prompt input */}
              <div className="mt-4">
                <div className="relative">
                  <textarea
                    ref={promptInputRef}
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                    placeholder="Custom prompt..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handlePromptSubmit();
                      }
                    }}
                  ></textarea>
                  <div className="absolute right-2 bottom-2 text-[10px] text-text-tertiary">
                    Ctrl+Enter to submit
                  </div>
                </div>
                <p className="text-[10px] text-text-secondary mt-1">
                  Pro tip: Enter a custom prompt to get specific suggestions from Gemini AI
                </p>
              </div>
            </motion.div>
          )}
          
          {/* Templates Panel */}
          {activeSuggestionPanel === 'templates' && (
            <motion.div
              key="templates-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <h4 className="text-xs font-medium mb-3">Prompt Templates</h4>
              <div className="space-y-2">
                {promptTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => {
                      if (activeNode) {
                        const filledTemplate = template.text.replace('{topic}', activeNode.text);
                        setCustomPrompt(filledTemplate);
                        setActiveSuggestionPanel('ideas');
                      }
                    }}
                  >
                    <p className="text-xs">{template.text.replace('{topic}', activeNode ? activeNode.text : 'selected topic')}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-primary/20 text-xs">
                <h5 className="font-medium mb-1">Pro Tip</h5>
                <p className="text-text-secondary">
                  Templates help you get consistent, structured responses from the AI. Click any template to use it.
                </p>
              </div>
            </motion.div>
          )}
          
          {/* History Panel */}
          {activeSuggestionPanel === 'history' && (
            <motion.div
              key="history-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <h4 className="text-xs font-medium mb-3">Recent AI Interactions</h4>
              
              {aiHistory.length > 0 ? (
                <div className="space-y-2">
                  {aiHistory.map((item, index) => (
                    <div
                      key={`history-${index}`}
                      className="p-3 rounded-lg bg-white/5 border-l-2 border-primary"
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-medium">{item.topic}</p>
                        <span className="text-[10px] text-text-secondary">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1">
                        {item.interaction}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary text-sm">
                  No history yet
                </div>
              )}
              
              <div className="mt-4 text-center">
                <button className="text-xs text-primary hover:underline">
                  View Full History
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-white/10 bg-white/5 text-[10px] text-text-secondary flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Gemini Advanced
        </div>
        <div>
          <a href="#" className="hover:text-white transition-colors">Settings</a>
          <span className="mx-1">•</span>
          <a href="#" className="hover:text-white transition-colors">Help</a>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistantPanel; 