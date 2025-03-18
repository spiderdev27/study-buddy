"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { NavBar } from '@/components/navigation/NavBar';
import { Logo } from '@/components/ui/Logo';
import { useTheme } from '@/app/theme-selector';

export default function Chat() {
  const { data: session, status } = useSession();
  const { colors } = useTheme();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/chat');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchChatHistory();
    }
  }, [session]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch('/api/chat/history');
      const data = await response.json();
      
      if (data.chatSessions) {
        setChatSessions(data.chatSessions);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const loadChatSession = async (chatId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat/history?chatId=${chatId}`);
      const data = await response.json();
      
      if (data.chatSession) {
        const formattedMessages = data.chatSession.messages.map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }));
        
        setChatHistory(formattedMessages);
        setCurrentChatId(chatId);
        setShowSidebar(false);
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    };
    
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          chatId: currentChatId,
        }),
      });
      
      const data = await response.json();
      
      if (data.message) {
        // Add AI response to chat
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
          },
        ]);
        
        // If this is a new chat, set the current chat ID
        if (!currentChatId && data.chatId) {
          setCurrentChatId(data.chatId);
          fetchChatHistory(); // Refresh the chat list
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedMessageClick = (text: string) => {
    setMessage(text);
  };

  const suggestedMessages = [
    "Explain the concept of mitochondria in cells",
    "Help me understand the pythagorean theorem",
    "What are the key events of World War II?",
    "Summarize the process of photosynthesis",
    "What is the difference between DNA and RNA?",
  ];

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="mr-4 p-2 rounded-full hover:bg-white/5 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <Logo size={28} className="mr-3" />
            <h1 className="text-xl font-bold text-text-primary">AI Chat Assistant</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              href="/dashboard"
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
              aria-label="Go to dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Chat History Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="absolute top-0 bottom-0 left-0 z-30 w-80 border-r border-white/10 overflow-y-auto"
            >
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4 text-text-primary">Chat History</h2>
                
                <button
                  onClick={() => {
                    setChatHistory([]);
                    setCurrentChatId(null);
                    setShowSidebar(false);
                  }}
                  className="w-full py-3 px-4 mb-4 hover:bg-white/5 text-text-primary rounded-lg flex items-center justify-center transition-colors border border-white/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Chat
                </button>
                
                <div className="space-y-2">
                  {chatSessions.length > 0 ? (
                    chatSessions.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => loadChatSession(chat.id)}
                        className={`w-full py-3 px-4 rounded-lg text-left transition-colors ${
                          currentChatId === chat.id 
                            ? 'border border-primary/50' 
                            : 'hover:bg-white/5 border border-white/10'
                        }`}
                      >
                        <p className="font-medium text-text-primary truncate">{chat.title || "Untitled Chat"}</p>
                        {chat.messages[0] && (
                          <p className="text-sm text-text-secondary truncate">
                            {new Date(chat.updatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="text-text-secondary text-center py-4">No chat history yet</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 overflow-y-auto p-4 space-y-4 pb-48"
          >
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="p-8 rounded-3xl border border-white/10 max-w-2xl w-full">
                  <h2 className="text-2xl font-bold text-center mb-6 text-text-primary">
                    Welcome to Study Buddy AI Chat
                  </h2>
                  <p className="text-text-secondary text-center mb-8">
                    Ask me anything about your studies, and I'll help you understand concepts, solve problems, or prepare for exams.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {suggestedMessages.map((msg, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedMessageClick(msg)}
                        className="hover:bg-white/5 border border-white/10 p-3 rounded-lg text-left transition-colors text-text-primary"
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <motion.div
                  key={index}
                  variants={messageVariants}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'border border-primary/50 text-text-primary'
                        : 'border border-white/10 text-text-primary'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                          msg.role === 'user'
                            ? 'border border-primary/50 text-text-primary'
                            : 'border border-accent/50 text-text-primary'
                        }`}
                      >
                        {msg.role === 'user' ? 'U' : 'AI'}
                      </div>
                      <span className="text-xs opacity-70">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3 mt-4" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-2 mt-3" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
                            em: ({node, ...props}) => <em className="text-secondary italic" {...props} />,
                            code: ({node, children, className, ...props}: {node?: any, children?: React.ReactNode, className?: string, inline?: boolean}) => 
                              props.inline ? (
                                <code className="border border-white/10 rounded px-1">{children}</code>
                              ) : (
                                <code className="block border border-white/10 rounded p-4 mb-4 overflow-x-auto">{children}</code>
                              ),
                            blockquote: ({node, ...props}) => (
                              <blockquote className="border-l-4 border-primary pl-4 italic mb-4" {...props} />
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="border border-white/10 rounded-2xl p-4 max-w-[80%] md:max-w-[70%]">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full border border-accent/50 flex items-center justify-center mr-2 text-text-primary">
                      AI
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full border border-accent/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 rounded-full border border-accent/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 rounded-full border border-accent/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </motion.div>
          
          {/* Message Input */}
          <div className="fixed bottom-28 left-0 right-0 p-4 border-t border-white/10 bg-background">
            <form onSubmit={handleSubmit} className="flex space-x-2 max-w-4xl mx-auto">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className={`px-4 py-3 rounded-xl flex items-center justify-center border ${
                  isLoading || !message.trim()
                    ? 'border-white/10 cursor-not-allowed'
                    : 'border-primary hover:bg-white/5'
                } text-white transition-colors`}
                aria-label="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <NavBar />
    </div>
  );
} 