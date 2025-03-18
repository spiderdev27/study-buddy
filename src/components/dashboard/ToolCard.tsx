'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/app/theme-selector';

interface ToolCardProps {
  title: string;
  icon: string;
  path: string;
}

export function ToolCard({ title, icon, path }: ToolCardProps) {
  const { colors } = useTheme();
  
  // Icons for different tools
  const getIcon = () => {
    switch (icon) {
      case 'NotesIcon':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="10 9 9 9 8 9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'SummaryIcon':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <line x1="17" y1="10" x2="3" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="21" y1="6" x2="3" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="21" y1="14" x2="3" y2="14" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="17" y1="18" x2="3" y2="18" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'FlashcardIcon':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="21" x2="16" y2="21" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'QuizIcon':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'LibraryIcon':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'AIIcon':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12l0 10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16V12" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8h.01" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <Link href={path}>
      <motion.div 
        className="glass-card overflow-hidden rounded-xl relative group cursor-pointer"
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2 }}
      >
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Icon background blob */}
        <motion.div 
          className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-2xl"
          animate={{ 
            scale: [1, 1.1, 1], 
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="relative z-10 p-4 flex flex-col items-center text-center">
          {/* Icon with animated background */}
          <div className="mb-3 relative">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 200%" }}
            />
            <div className="relative w-12 h-12 flex items-center justify-center bg-bg-card rounded-full border border-white/10 shadow-sm text-primary">
              {getIcon()}
            </div>
          </div>
          
          {/* Title */}
          <h4 className="font-medium text-sm group-hover:text-primary transition-colors duration-300">{title}</h4>
          
          {/* Subtle accent underline that appears on hover */}
          <motion.div 
            className="h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ width: 0 }}
            whileHover={{ width: '60%' }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </Link>
  );
} 