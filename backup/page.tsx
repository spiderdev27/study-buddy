'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { NavBar } from '@/components/navigation/NavBar';
import { Logo } from '@/components/ui/Logo';
import { useTheme } from '@/app/theme-selector';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/navigation/Header';

// ToolCard component to display individual tools
function ToolCard({ 
  id, 
  title, 
  description, 
  icon, 
  path, 
  category, 
  popularityScore 
}: {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  category: string;
  popularityScore: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Format category for display
  const formatCategory = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  // Popularity indicator
  const getPopularityIndicator = (score: number) => {
    if (score >= 90) return 'Popular';
    if (score >= 80) return 'Trending';
    return null;
  };
  
  const popularityLabel = getPopularityIndicator(popularityScore);

  // Get icon component based on icon name
  const getIcon = () => {
    switch (icon) {
      case 'NotesIcon':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="10" y1="9" x2="8" y2="9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'SummaryIcon':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="8" x2="9" y2="8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="16" x2="9" y2="16" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <Link href={path}>
      <motion.div 
        className="glass-card overflow-hidden rounded-xl group relative"
        whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)' }}
        transition={{ duration: 0.3 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Animated pattern overlay */}
        <motion.div 
          className="absolute inset-0 opacity-10 z-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '8px 8px'
          }}
          animate={{
            backgroundPosition: isHovered ? ['0px 0px', '8px 8px'] : ['0px 0px', '0px 0px'],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="p-5 flex gap-4 items-center relative">
          {/* Icon with gradient background */}
          <div className="relative">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl opacity-80"
              animate={{ 
                opacity: isHovered ? 1 : 0.8,
                scale: isHovered ? 1.05 : 1
              }}
              transition={{ duration: 0.3 }}
            />
            <div className="relative w-14 h-14 flex items-center justify-center text-primary">
              {getIcon()}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <motion.h3 
                className="font-bold text-base mb-1 pr-6"
                animate={{ color: isHovered ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
                transition={{ duration: 0.2 }}
              >
                {title}
              </motion.h3>
              
              {popularityLabel && (
                <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-2 py-0.5 rounded-full text-xs font-medium text-primary">
                  {popularityLabel}
                </div>
              )}
            </div>
            
            <p className="text-text-secondary text-sm">{description}</p>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-text-secondary">
                {formatCategory(category)}
              </span>
              
              <motion.div 
                className="flex items-center text-primary"
                animate={{
                  x: isHovered ? 5 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Tools() {
  const { theme, colors, toggleColorMode, colorMode } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const mainRef = useRef<HTMLDivElement>(null);
  
  // Set up scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        const scrollPos = mainRef.current.scrollTop;
        const maxScroll = mainRef.current.scrollHeight - mainRef.current.clientHeight;
        setScrollProgress(scrollPos / (maxScroll || 1));
      }
    };
    
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // AI Tools available in the app
  const tools = [
    {
      id: '1',
      title: 'Smart Notes',
      description: 'Create, organize, and enhance your notes with AI assistance',
      icon: 'NotesIcon',
      path: '/tools/smart-notes',
      category: 'organize',
      popularityScore: 98,
    },
    {
      id: '2',
      title: 'Summarize',
      description: 'Get concise summaries of any content in seconds',
      icon: 'SummaryIcon',
      path: '/tools/summarize',
      category: 'learn',
      popularityScore: 92,
    },
    {
      id: '3',
      title: 'Flashcards',
      description: 'Auto-generate flashcards from your study materials',
      icon: 'FlashcardIcon', 
      path: '/tools/flashcards',
      category: 'memorize',
      popularityScore: 85,
    },
    {
      id: '4',
      title: 'Create Quiz',
      description: 'Generate personalized quizzes to test your knowledge',
      icon: 'QuizIcon',
      path: '/tools/quiz',
      category: 'test',
      popularityScore: 88,
    },
    {
      id: '5',
      title: 'AI Tutor',
      description: 'Get instant answers and explanations for any question',
      icon: 'AIIcon',
      path: '/tools/ai-tutor',
      category: 'learn',
      popularityScore: 95,
    },
    {
      id: '6',
      title: 'Study Planner',
      description: 'Create a personalized study schedule to maximize your time',
      icon: 'PlannerIcon',
      path: '/tools/study-planner',
      category: 'organize',
      popularityScore: 82,
    },
    {
      id: '7',
      title: 'Mind Map',
      description: 'Create visual connection maps to organize complex concepts',
      icon: 'MindMapIcon',
      path: '/tools/mind-map',
      category: 'organize',
      popularityScore: 78,
    },
    {
      id: '8',
      title: 'Citation Generator',
      description: 'Generate proper citations in any format for your references',
      icon: 'CitationIcon',
      path: '/tools/citation',
      category: 'create',
      popularityScore: 75,
    },
    {
      id: '9',
      title: 'PDF Analyzer',
      description: 'Upload PDFs, view content, and ask AI questions about the document',
      icon: 'PDFIcon',
      path: '/tools/pdf-analyzer',
      category: 'learn',
      popularityScore: 90,
    },
  ];
  
  // Filter tools by category
  const filteredTools = activeCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === activeCategory);

  // Sort tools by popularity
  const sortedTools = [...filteredTools].sort((a, b) => b.popularityScore - a.popularityScore);
  
  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Tools' },
    { id: 'learn', name: 'Learning' },
    { id: 'organize', name: 'Organization' },
    { id: 'memorize', name: 'Memorization' },
    { id: 'test', name: 'Testing' },
    { id: 'create', name: 'Creation' },
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-60">
          <div className="absolute -top-20 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/3 left-10 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute bottom-0 right-10 w-[30rem] h-[30rem] rounded-full bg-accent/5 blur-3xl" />
        </div>
      </div>
      
      {/* Common Header Component */}
      <Header />
      
      {/* Main Scrollable Content */}
      <main 
        ref={mainRef} 
        className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-24"
      >
        <div className="px-4 py-6 md:px-6 max-w-5xl mx-auto">
          {/* Title Section */}
          <motion.section 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2 text-gradient">AI Learning Tools</h2>
            <p className="text-text-secondary text-sm md:text-base">
              Supercharge your learning with our powerful AI tools designed to help you study smarter, not harder.
            </p>
          </motion.section>
          
          {/* Category Tabs */}
          <motion.section 
            className="mb-8 overflow-x-auto scrollbar-hidden -mx-1 px-1 pb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex gap-2">
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    activeCategory === category.id 
                      ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/20 text-text-primary' 
                      : 'bg-bg-card border border-white/10 hover:bg-white/5'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>
          </motion.section>
          
          {/* Tools Grid */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AnimatePresence mode="wait">
                {sortedTools.map((tool) => (
                  <motion.div 
                    key={tool.id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ToolCard
                      id={tool.id}
                      title={tool.title}
                      description={tool.description}
                      icon={tool.icon}
                      path={tool.path}
                      category={tool.category}
                      popularityScore={tool.popularityScore}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
          
          {/* Suggest a Tool Section */}
          <motion.section 
            className="mt-10 pt-6 border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="glass-card p-6 text-center">
              <h3 className="text-lg font-bold mb-2">Can't find what you need?</h3>
              <p className="text-text-secondary text-sm mb-4">We're constantly adding new AI learning tools. Let us know what would help you!</p>
              <motion.button 
                className="button-primary mx-auto text-sm py-2 min-h-0"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>Suggest a Tool</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                  <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>
          </motion.section>
        </div>
      </main>
      
      {/* Navigation Bar */}
      <NavBar />
    </div>
  );
} 