'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { 
  Send, Mic, MicOff, Bot, User, 
  ThumbsUp, ThumbsDown, Copy, Loader2,
  Sparkles, BrainCircuit, BookOpen
} from 'lucide-react';
import { LearningPreferences } from './LearningSettings';
import { generateGeminiResponse, GeminiMessage } from '@/services/gemini';
import ReactMarkdown from 'react-markdown';

// Message type for the chat
type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isProcessing?: boolean;
  hasBeenRated?: boolean;
  rating?: 'up' | 'down';
};

interface AIChatInterfaceProps {
  subject?: string;
  topic?: string;
  preferences?: LearningPreferences;
}

export function AIChatInterface({ subject, topic, preferences }: AIChatInterfaceProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Add welcome message on first load or when subject/topic changes
  useEffect(() => {
    if (messages.length === 0 || (subject && topic)) {
      const welcomeMessage = subject && topic
        ? `Hi there! I'm your AI tutor for ${topic} in ${subject}. What would you like to learn about this topic today?`
        : "Hello! I'm your AI tutor. What subject and topic would you like to learn about today?";
      
      setMessages([{
        id: Date.now().toString(),
        role: 'ai',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [subject, topic]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Show AI thinking indicator
    setIsLoading(true);
    
    // Add AI thinking message
    const aiThinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: '',
      timestamp: new Date(),
      isProcessing: true
    };
    
    setMessages(prev => [...prev, aiThinkingMessage]);
    
    try {
      // Convert previous messages to Gemini format (excluding the thinking message)
      const geminiMessages: GeminiMessage[] = messages
        .filter(m => !m.isProcessing)
        .map(message => ({
          role: message.role === 'user' ? 'user' : 'model',
          parts: [{ text: message.content }]
        }));
      
      // Add the new user message
      geminiMessages.push({
        role: 'user',
        parts: [{ text: userMessage.content }]
      });
      
      // Get response from Gemini API
      const response = await generateGeminiResponse(
        geminiMessages,
        subject,
        topic,
        preferences
      );
      
      // Update the thinking message with the actual response
      setMessages(prev => {
        const newMessages = [...prev];
        const thinkingMessageIndex = newMessages.findIndex(m => m.isProcessing);
        
        if (thinkingMessageIndex !== -1) {
          newMessages[thinkingMessageIndex] = {
            ...newMessages[thinkingMessageIndex],
            content: response,
            isProcessing: false
          };
        }
        
        return newMessages;
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Update the thinking message with an error message
      setMessages(prev => {
        const newMessages = [...prev];
        const thinkingMessageIndex = newMessages.findIndex(m => m.isProcessing);
        
        if (thinkingMessageIndex !== -1) {
          newMessages[thinkingMessageIndex] = {
            ...newMessages[thinkingMessageIndex],
            content: "I'm having trouble connecting to my knowledge base. Please try again in a moment.",
            isProcessing: false
          };
        }
        
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  // Handle pressing Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // This would normally start/stop recording via the Web Speech API
    if (!isRecording) {
      // Start recording
      console.log('Started recording');
    } else {
      // Stop recording and process the result
      console.log('Stopped recording');
      setInputValue(inputValue + ' [Voice transcription would appear here]');
    }
  };
  
  // Rate a message
  const rateMessage = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, hasBeenRated: true, rating } 
          : message
      )
    );
  };
  
  // Copy message to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // Would normally show a toast notification
    console.log('Copied to clipboard');
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Message display area */}
      <div className={cn(
        "flex-1 overflow-y-auto p-4 space-y-4 rounded-t-xl border",
        isDark ? "bg-gray-800/30 border-gray-700" : "bg-gray-50 border-gray-200"
      )}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-start gap-3 px-4 py-3 rounded-xl max-w-3xl",
                message.role === 'ai' 
                  ? isDark 
                    ? "bg-gray-800 border border-gray-700 ml-0 mr-auto" 
                    : "bg-white border border-gray-200 shadow-sm ml-0 mr-auto"
                  : isDark 
                    ? "bg-indigo-500/20 border border-indigo-500/40 ml-auto mr-0" 
                    : "bg-indigo-50 border border-indigo-200 ml-auto mr-0"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                message.role === 'ai'
                  ? isDark
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-emerald-100 text-emerald-600"
                  : isDark
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-indigo-100 text-indigo-600"
              )}>
                {message.role === 'ai' 
                  ? message.isProcessing 
                    ? <Loader2 className="h-5 w-5 animate-spin" /> 
                    : <Bot className="h-5 w-5" />
                  : <User className="h-5 w-5" />}
              </div>
              
              {/* Message content */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm prose prose-sm max-w-none",
                  message.role === 'ai'
                    ? isDark 
                      ? "prose-invert prose-gray-200" 
                      : "prose-gray-700"
                    : isDark 
                      ? "prose-invert prose-indigo-100" 
                      : "prose-indigo-900"
                )}>
                  {message.isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-medium mb-2">{children}</h3>,
                        p: ({ children }) => <p className="mb-2">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        code: ({ children }) => (
                          <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-gray-100 dark:bg-gray-800 rounded p-2 mb-2 overflow-x-auto">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
                
                {/* Message actions for AI messages */}
                {message.role === 'ai' && !message.isProcessing && (
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => rateMessage(message.id, 'up')}
                      className={cn(
                        "p-1 rounded-full transition-colors",
                        message.rating === 'up'
                          ? isDark ? "text-green-400 bg-green-900/30" : "text-green-600 bg-green-100"
                          : isDark ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => rateMessage(message.id, 'down')}
                      className={cn(
                        "p-1 rounded-full transition-colors",
                        message.rating === 'down'
                          ? isDark ? "text-red-400 bg-red-900/30" : "text-red-600 bg-red-100"
                          : isDark ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className={cn(
                        "p-1 rounded-full transition-colors",
                        isDark ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                
                {/* Timestamp */}
                <div className={cn(
                  "text-xs mt-1",
                  isDark ? "text-gray-500" : "text-gray-400"
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-4",
              isDark ? "bg-gray-800 text-indigo-400" : "bg-indigo-50 text-indigo-600"
            )}>
              <BrainCircuit className="h-8 w-8" />
            </div>
            <h3 className={cn(
              "text-lg font-medium mb-2",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Your AI Tutor Assistant
            </h3>
            <p className={cn(
              "text-sm max-w-md mb-6",
              isDark ? "text-gray-300" : "text-gray-600"
            )}>
              Ask questions, request explanations, or get help with specific problems in any subject.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
              {[
                { title: "Explain a concept", desc: "How does photosynthesis work?", icon: <Sparkles className="h-4 w-4" /> },
                { title: "Solve a problem", desc: "Solve: 3x + 5 = 14", icon: <Bot className="h-4 w-4" /> },
                { title: "Request examples", desc: "Show examples of metaphors", icon: <BookOpen className="h-4 w-4" /> },
                { title: "Get study tips", desc: "How to memorize the periodic table?", icon: <BrainCircuit className="h-4 w-4" /> }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(item.desc)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                    isDark
                      ? "bg-gray-800 border border-gray-700 hover:bg-gray-700"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    isDark ? "bg-gray-700 text-indigo-400" : "bg-gray-100 text-indigo-600"
                  )}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className={cn(
                      "text-sm font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>
                      {item.title}
                    </h4>
                    <p className={cn(
                      "text-xs",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className={cn(
        "p-4 border rounded-b-xl",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      )}>
        <div className={cn(
          "flex items-center gap-2 rounded-xl border p-2",
          isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
        )}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your question or message..."
            className={cn(
              "flex-1 bg-transparent border-0 focus:ring-0 outline-none text-sm px-2 py-1",
              isDark ? "text-white placeholder-gray-400" : "text-gray-800 placeholder-gray-500"
            )}
            disabled={isLoading}
          />
          
          <button
            onClick={toggleRecording}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isRecording
                ? isDark ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-500"
                : isDark ? "text-gray-300 hover:bg-gray-600" : "text-gray-500 hover:bg-gray-200"
            )}
            disabled={isLoading}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          
          <button
            onClick={handleSendMessage}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark
                ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-600/50"
                : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400"
            )}
            disabled={inputValue.trim() === '' || isLoading}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        {/* Character limit indicator */}
        <div className={cn(
          "text-xs mt-1 text-right",
          isDark ? "text-gray-500" : "text-gray-400"
        )}>
          {inputValue.length}/1000 characters
        </div>
      </div>
    </div>
  );
} 