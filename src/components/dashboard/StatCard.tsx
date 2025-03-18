'use client';

import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
}

export function StatCard({ title, value, icon, change, isPositive, subtitle }: StatCardProps) {
  // Icons for different stats
  const getIcon = () => {
    switch (icon) {
      case 'ClockIcon':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
          </svg>
        );
      case 'BookIcon':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" fill="currentColor"/>
          </svg>
        );
      case 'CardIcon':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H2V20C2 21.1 2.9 22 4 22H18V20H4V6ZM20 2H8C6.9 2 6 2.9 6 4V16C6 17.1 6.9 18 8 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H8V4H20V16ZM10 9H18V11H10V9ZM10 12H14V14H10V12ZM10 6H18V8H10V6Z" fill="currentColor"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H4.99C3.89 3 3 3.89 3 4.99V19C3 20.1 3.89 21 4.99 21H19C20.1 21 21 20.1 21 19V4.99C21 3.89 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
          </svg>
        );
    }
  };

  return (
    <motion.div 
      className="glass-card p-4 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background glow effect */}
      <div className="card-glow opacity-30" />
      
      <div className="flex items-start justify-between mb-3 z-10 relative">
        <div className="bg-white/10 rounded-full p-1.5">
          {getIcon()}
        </div>
        
        {change && (
          <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isPositive ? 'bg-success/10 text-success' : 'bg-white/10 text-text-secondary'
          }`}>
            {isPositive && '+'}{change}
          </div>
        )}
      </div>
      
      <div className="z-10 relative">
        <h3 className="text-2xl md:text-3xl font-bold">{value}</h3>
        <p className="text-xs text-text-secondary mt-1">
          {subtitle || title}
        </p>
      </div>
    </motion.div>
  );
} 