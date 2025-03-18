'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavBar } from '@/components/navigation/NavBar';
import { Logo } from '@/components/ui/Logo';
import { useTheme } from '@/app/theme-selector';
import Link from 'next/link';

export default function Library() {
  const { theme, colors, toggleColorMode, colorMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
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
  
  // Mock data for library resources (in a real app, this would come from an API)
  const resources = [
    {
      id: '1',
      title: 'Operating Systems Complete Notes',
      type: 'notes',
      branch: 'computer-science',
      year: '3',
      author: 'Amit Singh',
      rating: 4.8,
      downloadCount: 342,
      coverColor: 'from-blue-500 to-purple-500',
    },
    {
      id: '2',
      title: 'Data Structures & Algorithms Handbook',
      type: 'book',
      branch: 'computer-science',
      year: '2',
      author: 'Priya Sharma',
      rating: 4.9,
      downloadCount: 567,
      coverColor: 'from-purple-500 to-pink-500',
    },
    {
      id: '3',
      title: 'Digital Electronics Solved Papers',
      type: 'paper',
      branch: 'electrical-engineering',
      year: '2',
      author: 'Rahul Verma',
      rating: 4.6,
      downloadCount: 231,
      coverColor: 'from-green-500 to-teal-500',
    },
    {
      id: '4',
      title: 'Machine Learning Fundamentals',
      type: 'notes',
      branch: 'computer-science',
      year: '4',
      author: 'Neha Gupta',
      rating: 4.7,
      downloadCount: 412,
      coverColor: 'from-red-500 to-orange-500',
    },
    {
      id: '5',
      title: 'Calculus II Practice Problems',
      type: 'solution',
      branch: 'mathematics',
      year: '1',
      author: 'Prof. D.K. Sharma',
      rating: 4.5,
      downloadCount: 289,
      coverColor: 'from-yellow-500 to-amber-500',
    },
    {
      id: '6',
      title: 'Artificial Intelligence & Neural Networks',
      type: 'notes',
      branch: 'computer-science',
      year: '3',
      author: 'Vijay Kumar',
      rating: 4.9,
      downloadCount: 478,
      coverColor: 'from-cyan-500 to-blue-500',
    },
  ];
  
  // Filter resources based on search and filters
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'all' || resource.branch === selectedBranch;
    const matchesYear = selectedYear === 'all' || resource.year === selectedYear;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    
    return matchesSearch && matchesBranch && matchesYear && matchesType;
  });

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
          <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute bottom-0 left-10 w-[30rem] h-[30rem] rounded-full bg-accent/5 blur-3xl" />
        </div>
      </div>
      
      {/* Header - Fixed & Compact */}
      <motion.header 
        className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center h-16 px-4 md:px-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Logo size={32} />
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm -z-10" />
            </div>
            <h1 className="text-xl font-bold hidden md:block text-gradient">Study Buddy</h1>
          </div>
          
          {/* Progress Indicator */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-secondary"
              style={{ scaleX: scrollProgress, transformOrigin: 'left' }} 
            />
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleColorMode}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-card backdrop-blur-md border border-white/10 shadow-sm"
            >
              {colorMode === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </motion.button>
            
            {/* Notifications */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-card backdrop-blur-md border border-white/10 shadow-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
            
            {/* Profile */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center bg-gradient-to-r from-primary to-secondary rounded-full h-8 pr-2 pl-0.5 shadow-glow"
            >
              <span className="w-7 h-7 rounded-full bg-white text-primary font-medium text-xs flex items-center justify-center">A</span>
              <span className="text-white text-xs font-medium ml-1 hidden md:block">Alex</span>
            </motion.button>
          </div>
        </div>
      </motion.header>
      
      {/* Main Scrollable Content */}
      <main 
        ref={mainRef} 
        className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-24"
      >
        <div className="px-4 py-6 md:px-6">
          <div className="md:grid md:grid-cols-4 md:gap-6">
            {/* Sidebar for Filters - Desktop */}
            <motion.div 
              className="hidden md:block md:col-span-1 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="glass-card p-5 rounded-xl space-y-4">
                <h3 className="text-lg font-bold">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-text-secondary block mb-2">Branch</label>
                    <select 
                      className="input-field w-full text-sm"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                      <option value="all">All Branches</option>
                      <option value="computer-science">Computer Science</option>
                      <option value="electrical-engineering">Electrical Engineering</option>
                      <option value="mechanical-engineering">Mechanical Engineering</option>
                      <option value="civil-engineering">Civil Engineering</option>
                      <option value="mathematics">Mathematics</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-text-secondary block mb-2">Year</label>
                    <select 
                      className="input-field w-full text-sm"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="all">All Years</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-text-secondary block mb-2">Resource Type</label>
                    <select 
                      className="input-field w-full text-sm"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="notes">Notes</option>
                      <option value="book">Books</option>
                      <option value="paper">Papers</option>
                      <option value="solution">Solutions</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button 
                    className="w-full button-secondary text-sm py-2 min-h-0"
                    onClick={() => {
                      setSelectedBranch('all'); 
                      setSelectedYear('all'); 
                      setSelectedType('all');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
              
              <div className="glass-card p-5 rounded-xl">
                <h3 className="text-lg font-bold mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['Programming', 'Math', 'AI', 'Networks', 'Data Science', 'Circuits', 'Web Dev', 'Calculus'].map(tag => (
                    <div key={tag} className="bg-white/5 px-3 py-1 rounded-full text-xs hover:bg-white/10 cursor-pointer transition-colors">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Main Content */}
            <div className="md:col-span-3">
              {/* Title and Search */}
              <motion.section 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-4">Library Resources</h2>
                
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search by title, author, subject..."
                    className={`input-field w-full pl-11 pr-4 transition-all duration-300 ${isSearchFocused ? 'shadow-glow' : ''}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </motion.section>
              
              {/* Mobile Filters */}
              <motion.section 
                className="mb-6 md:hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hidden">
                  <select 
                    className="input-field text-sm min-w-[120px] h-10"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    <option value="all">All Branches</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="electrical-engineering">Electrical</option>
                    <option value="mechanical-engineering">Mechanical</option>
                    <option value="civil-engineering">Civil</option>
                    <option value="mathematics">Mathematics</option>
                  </select>
                  
                  <select 
                    className="input-field text-sm min-w-[100px] h-10"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="all">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  
                  <select 
                    className="input-field text-sm min-w-[100px] h-10"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="notes">Notes</option>
                    <option value="book">Books</option>
                    <option value="paper">Papers</option>
                    <option value="solution">Solutions</option>
                  </select>
                </div>
              </motion.section>
              
              {/* Resources Grid */}
              <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredResources.map((resource) => (
                    <motion.div key={resource.id} variants={itemVariants}>
                      <LibraryResourceCard resource={resource} />
                    </motion.div>
                  ))}
                </div>
                
                {filteredResources.length === 0 && (
                  <motion.div 
                    className="glass-card p-8 text-center rounded-xl my-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-text-secondary" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-text-secondary text-lg mb-2">No resources found</p>
                    <p className="text-text-secondary text-sm">Try adjusting your search criteria</p>
                  </motion.div>
                )}
              </motion.section>
            </div>
          </div>
        </div>
      </main>
      
      {/* Add Resource Button */}
      <motion.button 
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-glow z-40"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0, rotate: 180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 10 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
          <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>
      
      {/* Navigation Bar */}
      <NavBar />
    </div>
  );
}

interface LibraryResourceCardProps {
  resource: {
    id: string;
    title: string;
    type: string;
    branch: string;
    year: string;
    author: string;
    rating: number;
    downloadCount: number;
    coverColor: string;
  };
}

function LibraryResourceCard({ resource }: LibraryResourceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format branch name for display
  const formatBranch = (branch: string) => {
    return branch.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Icons for different resource types
  const getTypeIcon = () => {
    switch (resource.type) {
      case 'notes':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="10 9 9 9 8 9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'book':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'paper':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 13h8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 17h8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'solution':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  // Star component for ratings
  const RatingStars = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg width="12" height="12" viewBox="0 0 24 24" className="text-yellow-400">
            <defs>
              <linearGradient id="half-star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#half-star-gradient)" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-yellow-400/40">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      className="glass-card overflow-hidden rounded-xl group"
      whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)' }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="grid grid-cols-[120px,1fr] h-full">
        {/* Left - Cover */}
        <div className={`bg-gradient-to-br ${resource.coverColor} relative overflow-hidden`}>
          {/* Animated pattern overlay */}
          <motion.div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '8px 8px'
            }}
            animate={{
              backgroundPosition: isHovered ? ['0px 0px', '8px 8px'] : ['0px 0px', '0px 0px'],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="absolute inset-0 flex flex-col justify-between p-3">
            <div className="bg-black/30 backdrop-blur-sm rounded-full p-1.5 w-fit">
              {getTypeIcon()}
            </div>
            
            <motion.div
              className="bg-black/30 backdrop-blur-sm rounded-md p-1 text-xs font-medium text-white text-center"
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 5, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {formatBranch(resource.branch)}
            </motion.div>
          </div>
        </div>
        
        {/* Right - Content */}
        <div className="p-4 flex flex-col justify-between relative">
          <motion.div
            className="absolute right-2 top-2 text-text-secondary text-xs flex items-center gap-1"
            animate={{ opacity: isHovered ? 0 : 1 }}
          >
            <span>Year {resource.year}</span>
          </motion.div>
          
          <div>
            <motion.h3 
              className="font-bold text-base line-clamp-2 mb-1 pr-8"
              animate={{ color: isHovered ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
              transition={{ duration: 0.2 }}
            >
              {resource.title}
            </motion.h3>
            
            <p className="text-text-secondary text-xs mb-2">{resource.author}</p>
            
            <div className="flex items-center gap-2 mb-1">
              <RatingStars rating={resource.rating} />
              <span className="text-text-secondary text-xs">({resource.rating})</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-text-secondary text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{resource.downloadCount}</span>
            </div>
            
            <motion.div 
              className="flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button 
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-text-primary transition-colors"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
              
              <motion.button 
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-text-primary transition-colors"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 