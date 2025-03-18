'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface ResourceCardProps {
  title: string;
  type: 'notes' | 'flashcards' | 'book' | 'quiz' | string;
  coverColor: string;
  progress: number;
}

export function ResourceCard({ title, type, coverColor, progress }: ResourceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Icons for different resource types
  const getTypeIcon = () => {
    switch (type) {
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
      case 'flashcards':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="21" x2="16" y2="21" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="17" x2="12" y2="21" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'book':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'quiz':
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

  return (
    <Link href={`/library/${type}/${encodeURIComponent(title)}`}>
      <motion.div 
        className="glass-card rounded-xl overflow-hidden relative group"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Dynamic Background */}
        <div className={`h-28 bg-gradient-to-br ${coverColor} relative overflow-hidden`}>
          {/* Animated Circles */}
          <motion.div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10"
            animate={{ 
              x: isHovered ? -10 : 50, 
              y: isHovered ? -10 : 30,
              scale: isHovered ? 1.2 : 1
            }}
            transition={{ duration: 0.7 }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white opacity-10"
            animate={{ 
              x: isHovered ? 10 : -30, 
              y: isHovered ? 10 : -20,
              scale: isHovered ? 1.1 : 0.8
            }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Type Badge */}
          <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-full p-2 text-white flex items-center justify-center">
            {getTypeIcon()}
          </div>
          
          {/* Optional: Decorative Element */}
          <motion.div 
            className="absolute right-4 bottom-4 h-8 w-16 rounded-lg border border-white/20 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.8,
              y: isHovered ? 0 : 10
            }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-xs font-medium text-white">View</span>
          </motion.div>
        </div>
        
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <motion.h4 
            className="font-semibold text-base line-clamp-2 mb-3 leading-tight"
            animate={{ 
              color: isHovered ? 'var(--color-primary)' : 'var(--color-text-primary)'
            }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h4>
          
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-text-secondary capitalize flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary"></span>
                {type}
              </span>
              <motion.span 
                className="font-medium"
                animate={{ 
                  color: isHovered ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                }}
                transition={{ duration: 0.3 }}
              >
                {progress}% complete
              </motion.span>
            </div>
            
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
} 