'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Logo } from '@/components/ui/Logo';
import { NavBar } from '@/components/navigation/NavBar';
import { ToolCard } from '@/components/dashboard/ToolCard';
import { ResourceCard } from '@/components/dashboard/ResourceCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { useTheme } from '@/app/theme-selector';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { theme, colors, toggleColorMode, colorMode } = useTheme();
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [userSchedule, setUserSchedule] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  
  // Get user's name or default to "there"
  const userName = session?.user?.name || 'there';
  // Get first letter of name for avatar
  const userInitial = userName !== 'there' ? userName.charAt(0) : 'U';
  
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
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Fetch user's schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!session?.user) {
        setIsLoadingSchedule(false);
        return;
      }
      
      try {
        setIsLoadingSchedule(true);
        const response = await fetch('/api/schedule', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }

        const data = await response.json();
        
        if (data.schedule && data.schedule.length > 0) {
          setUserSchedule(data.schedule);
          
          // Filter classes for today
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const classesToday = data.schedule.filter((item: any) => 
            item.day === today
          ).map((item: any, index: number) => ({
            id: index + 1,
            title: item.className,
            time: `${item.startTime} - ${item.endTime}`,
            location: item.location,
            startTime: item.startTime,
            isUpcoming: isTimeUpcoming(item.startTime)
          }));
          
          setTodayClasses(classesToday);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setIsLoadingSchedule(false);
      }
    };

    fetchSchedule();
  }, [session]);

  // Helper to determine if a class time is upcoming based on current time
  const isTimeUpcoming = (startTime: string) => {
    if (!startTime) return false;
    
    const now = new Date();
    const [hours, minutes] = startTime.split(':').map(Number);
    
    const classTime = new Date();
    classTime.setHours(hours, minutes, 0);
    
    return now < classTime;
  };

  // Get time until next class
  const getTimeUntilNextClass = () => {
    if (!todayClasses || todayClasses.length === 0) return null;
    
    const upcomingClasses = todayClasses.filter(cls => cls.isUpcoming);
    if (upcomingClasses.length === 0) return null;
    
    // Sort by start time
    upcomingClasses.sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      
      const dateA = new Date();
      dateA.setHours(timeA[0], timeA[1], 0);
      
      const dateB = new Date();
      dateB.setHours(timeB[0], timeB[1], 0);
      
      return dateA.getTime() - dateB.getTime();
    });
    
    const nextClass = upcomingClasses[0];
    const [hours, minutes] = nextClass.startTime.split(':').map(Number);
    
    const nextClassTime = new Date();
    nextClassTime.setHours(hours, minutes, 0);
    
    const now = new Date();
    const diffMs = nextClassTime.getTime() - now.getTime();
    
    if (diffMs < 0) return null;
    
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minutes`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      
      if (remainingMins === 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      } else {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} and ${remainingMins} minutes`;
      }
    }
  };
  
  // Mock notifications
  const notifications = [
    { id: 1, title: 'Study reminder', message: 'It\'s time for your daily algorithms practice', time: '5 min ago', unread: true },
    { id: 2, title: 'New resource', message: 'CS50 uploaded new lecture notes', time: '2 hours ago', unread: true },
    { id: 3, title: 'Quiz results', message: 'You scored 92% on Data Structures quiz', time: 'Yesterday', unread: false },
  ];
  
  // Mock data for recently viewed resources
  const recentResources = [
    {
      id: '1',
      title: 'Operating Systems Notes',
      type: 'notes',
      coverColor: 'from-blue-500 to-purple-500',
      progress: 65,
    },
    {
      id: '2',
      title: 'Data Structures Flashcards',
      type: 'flashcards',
      coverColor: 'from-purple-500 to-pink-500',
      progress: 42,
    },
    {
      id: '3',
      title: 'Algorithm Design Manual',
      type: 'book',
      coverColor: 'from-green-500 to-teal-500',
      progress: 28,
    },
    {
      id: '4',
      title: 'Machine Learning Fundamentals',
      type: 'notes',
      coverColor: 'from-yellow-500 to-red-500',
      progress: 15,
    }
  ];
  
  // Fallback schedule if no classes today
  const fallbackSchedule = [
    { id: 1, title: 'No classes scheduled for today', time: '', location: '', isUpcoming: false },
  ];
  
  // Mock data for learning tools
  const learningTools = [
    { id: '1', title: 'Smart Notes', icon: 'NotesIcon', path: '/tools/smart-notes' },
    { id: '2', title: 'Summarize', icon: 'SummaryIcon', path: '/tools/summarize' },
    { id: '3', title: 'Flashcards', icon: 'FlashcardIcon', path: '/tools/flashcards' },
    { id: '4', title: 'Create Quiz', icon: 'QuizIcon', path: '/tools/quiz' },
    { id: '5', title: 'Library', icon: 'LibraryIcon', path: '/library' },
    { id: '6', title: 'AI Tutor', icon: 'AIIcon', path: '/tools/ai-tutor' },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
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

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-60">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/4 right-10 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] rounded-full bg-accent/5 blur-3xl" />
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
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-card backdrop-blur-md border border-white/10 shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" fill="currentColor"/>
                </svg>
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </motion.button>
              
              {/* Notifications Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-72 bg-bg-card backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-50"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 border-b border-white/5 flex justify-between items-center">
                      <h4 className="text-sm font-medium">Notifications</h4>
                      <button className="text-xs text-primary">Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.map(notification => (
                        <motion.div 
                          key={notification.id} 
                          className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${notification.unread ? 'bg-primary/5' : ''}`}
                          whileHover={{ x: 3 }}
                        >
                          <div className="flex justify-between">
                            <h5 className="text-sm font-medium">{notification.title}</h5>
                            <span className="text-xs text-text-secondary">{notification.time}</span>
                          </div>
                          <p className="text-xs text-text-secondary mt-1">{notification.message}</p>
                        </motion.div>
                      ))}
                    </div>
                    <div className="p-2 text-center">
                      <button className="text-xs text-primary">View all</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Profile */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center bg-gradient-to-r from-primary to-secondary rounded-full h-8 pr-2 pl-0.5 shadow-glow"
            >
              <span className="w-7 h-7 rounded-full bg-white text-primary font-medium text-xs flex items-center justify-center">{userInitial}</span>
              <span className="text-white text-xs font-medium ml-1 hidden md:block">{userName !== 'there' ? userName : 'User'}</span>
            </motion.button>
          </div>
        </div>
      </motion.header>
      
      {/* Main Scrollable Content */}
      <main 
        ref={mainRef} 
        className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pb-24"
      >
        {/* Welcome Banner */}
        <motion.section 
          className="px-4 pt-6 pb-4 md:px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-card py-6 px-5 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {greeting}, <span className="text-gradient">{userName}</span>
              </h2>
              <p className="text-text-secondary text-sm md:text-base max-w-md">
                {isLoadingSchedule ? (
                  "Loading your schedule..."
                ) : todayClasses.length > 0 ? (
                  getTimeUntilNextClass() ? 
                    `You have ${todayClasses.length} class${todayClasses.length > 1 ? 'es' : ''} scheduled for today. Your next class starts in ${getTimeUntilNextClass()}.` :
                    `You have ${todayClasses.length} class${todayClasses.length > 1 ? 'es' : ''} scheduled for today. No upcoming classes remaining.`
                ) : (
                  "You have no classes scheduled for today."
                )}
              </p>
              <motion.button 
                className="button-primary text-sm mt-4 px-4 py-1.5 min-h-0"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/schedule')}
              >
                <span>View Schedule</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                </svg>
              </motion.button>
            </div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-radial from-primary/10 to-transparent blur-xl" />
          </div>
        </motion.section>
        
        {/* Two-Column Layout for Larger Screens */}
        <div className="md:grid md:grid-cols-3 md:gap-4 md:px-4 px-0">
          {/* Main Content Column */}
          <div className="md:col-span-2 p-4 space-y-6 md:p-2">
            {/* Stats Row */}
            <motion.section 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 gap-2 md:gap-4"
            >
              <motion.div variants={itemVariants}>
                <StatCard 
                  title="Study Hours" 
                  value="12.5" 
                  icon="ClockIcon"
                  change={"+2.3"}
                  isPositive={true}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard 
                  title="Resources" 
                  value="34" 
                  icon="BookIcon"
                  change={"+5"}
                  isPositive={true}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard 
                  title="Flashcards" 
                  value="156" 
                  icon="CardIcon"
                  change={"70%"}
                  subtitle="Mastered"
                />
              </motion.div>
            </motion.section>
            
            {/* Continue Learning */}
            <motion.section 
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">Continue Learning</h3>
                <Link href="/library" className="text-xs text-primary font-medium flex items-center gap-1">
                  View All
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                  </svg>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentResources.slice(0, 2).map((resource, index) => (
                  <motion.div 
                    key={resource.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <ResourceCard 
                      title={resource.title}
                      type={resource.type}
                      coverColor={resource.coverColor}
                      progress={resource.progress}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>
            
            {/* Quick Access Tools */}
            <motion.section 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delayChildren: 0.4 }}
            >
              <h3 className="text-lg font-bold mb-3">Quick Tools</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {learningTools.slice(0, 6).map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    variants={itemVariants}
                    custom={index}
                  >
                    <ToolCard 
                      title={tool.title}
                      icon={tool.icon}
                      path={tool.path}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>
          
          {/* Sidebar Content */}
          <div className="md:block px-4 py-4 md:p-2 space-y-6">
            {/* Today's Schedule */}
            <motion.section 
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold mb-3">Today's Schedule</h3>
              <div className="glass-card p-4 space-y-3 relative">
                <div className="absolute right-4 top-4">
                  <div className="text-xs text-text-secondary">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
                
                {isLoadingSchedule ? (
                  <div className="py-6 flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : todayClasses.length > 0 ? (
                  todayClasses.map((item, index) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className={`flex gap-3 p-3 rounded-lg ${item.isUpcoming ? 'bg-primary/5 border border-primary/10' : 'bg-white/5'}`}
                    >
                      <div className="min-w-10 mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary mx-auto" />
                        <div className="h-full w-0.5 bg-white/10 mx-auto mt-1" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <div className="flex justify-between text-xs text-text-secondary mt-1">
                          <span>{item.time}</span>
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-4 text-center text-text-secondary text-sm">
                    No classes scheduled for today
                  </div>
                )}
                
                <div className="text-center pt-2">
                  <button 
                    onClick={() => router.push('/schedule')}
                    className="text-xs text-primary font-medium"
                  >
                    View Full Calendar
                  </button>
                </div>
              </div>
            </motion.section>
            
            {/* Recent Resources - Alternative View */}
            <motion.section 
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold mb-3">Other Resources</h3>
              
              <div className="space-y-3">
                {recentResources.slice(2).map((resource, index) => (
                  <motion.div 
                    key={resource.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className="glass-card p-3 flex gap-4 items-center"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${resource.coverColor} flex items-center justify-center text-white`}>
                      {resource.type === 'notes' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 3H4.99C3.89 3 3 3.89 3 4.99V19C3 20.1 3.89 21 4.99 21H19C20.1 21 21 20.1 21 19V4.99C21 3.89 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
                        </svg>
                      )}
                      {resource.type === 'book' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2Z" fill="currentColor"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{resource.title}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-text-secondary capitalize">{resource.type}</span>
                        <span className="text-xs text-primary">{resource.progress}%</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: 0 }}
                          animate={{ width: `${resource.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </main>
      
      {/* Navigation Bar */}
      <NavBar />
    </div>
  );
} 