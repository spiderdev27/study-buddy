'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { NavBar } from '@/components/navigation/NavBar';
import { ToolCard } from '@/components/dashboard/ToolCard';
import { ResourceCard } from '@/components/dashboard/ResourceCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { useTheme } from '@/app/theme-selector';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/navigation/Header';

export default function Dashboard() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState<string>('');
  const mainRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [userSchedule, setUserSchedule] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  
  // Set up scroll progress tracking for the scrollable content
  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        const scrollPos = mainRef.current.scrollTop;
        const maxScroll = mainRef.current.scrollHeight - mainRef.current.clientHeight;
        // We're not using scrollProgress anymore since the Header component has its own
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
      
      {/* Common Header Component */}
      <Header />
      
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
                {greeting}, <span className="text-gradient">{session?.user?.name || 'there'}</span>
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