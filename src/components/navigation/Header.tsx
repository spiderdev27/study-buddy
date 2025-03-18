'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Logo } from '@/components/ui/Logo';
import { useTheme } from '@/app/theme-selector';

export function Header() {
  const { data: session } = useSession();
  const { theme, colors, toggleColorMode, colorMode, setTheme } = useTheme();
  const [greeting, setGreeting] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Get user's name or default to "there"
  const userName = session?.user?.name || 'there';
  // Get first letter of name for avatar
  const userInitial = userName !== 'there' ? userName.charAt(0) : 'U';
  
  // Set up scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(scrollPos / (maxScroll || 1));
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Mock notifications
  const notifications = [
    { id: 1, title: 'Study reminder', message: 'It\'s time for your daily algorithms practice', time: '5 min ago', unread: true },
    { id: 2, title: 'New resource', message: 'CS50 uploaded new lecture notes', time: '2 hours ago', unread: true },
    { id: 3, title: 'Quiz results', message: 'You scored 92% on Data Structures quiz', time: 'Yesterday', unread: false },
  ];
  
  // Theme options
  const themeOptions = [
    { id: 'default', name: 'Futuristic' },
    { id: 'dark-academia', name: 'Dark Academia' },
    { id: 'nature', name: 'Nature' },
    { id: 'minimalist', name: 'Minimalist' }
  ];

  return (
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
          {/* Theme Controls */}
          <div className="relative">
            {/* Theme Toggle Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-bg-card backdrop-blur-md border border-white/10 shadow-sm"
              aria-label="Theme settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
            
            {/* Theme Selector Dropdown */}
            <AnimatePresence>
              {showThemeSelector && (
                <motion.div 
                  className="absolute right-0 mt-2 w-56 bg-bg-card backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-50"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-3 border-b border-white/5">
                    <h4 className="text-sm font-medium">Theme Settings</h4>
                  </div>
                  
                  <div className="p-3 border-b border-white/5">
                    <div className="mb-2 text-xs text-text-secondary">Color Mode</div>
                    <button
                      onClick={toggleColorMode}
                      className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-md transition-colors"
                    >
                      <span className="flex items-center">
                        {colorMode === 'dark' ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {colorMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </span>
                      <span className="text-xs text-text-secondary">Click to toggle</span>
                    </button>
                  </div>
                  
                  <div className="p-3">
                    <div className="mb-2 text-xs text-text-secondary">Theme Style</div>
                    {themeOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id as any)}
                        className={`w-full flex items-center p-2 mb-1 rounded-md transition-colors ${
                          theme === option.id ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full mr-2 ${theme === option.id ? 'bg-primary' : 'bg-white/20'}`}></div>
                        {option.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
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
          <Link href="/profile">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center bg-gradient-to-r from-primary to-secondary rounded-full h-8 pr-2 pl-0.5 shadow-glow"
            >
              <span className="w-7 h-7 rounded-full bg-white text-primary font-medium text-xs flex items-center justify-center">{userInitial}</span>
              <span className="text-white text-xs font-medium ml-1 hidden md:block">{userName !== 'there' ? userName : 'User'}</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

// Animated panel component for dropdown menus
function AnimatedPanel({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 