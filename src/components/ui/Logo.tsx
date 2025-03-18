"use client";

import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 48, className = '' }: LogoProps) {
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow */}
      <motion.div
        animate={{ 
          boxShadow: [
            '0 0 15px rgba(140, 26, 254, 0.7)',
            '0 0 25px rgba(140, 26, 254, 0.5)',
            '0 0 15px rgba(140, 26, 254, 0.7)'
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/60 to-secondary/70"
      />
      
      {/* Main logo shape */}
      <div className="absolute inset-[3px] bg-background rounded-lg flex items-center justify-center overflow-hidden">
        {/* Inner content */}
        <div className="w-full h-full relative">
          {/* Brain icon */}
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            className="w-full h-full p-1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 9.5C12 8.12 10.88 7 9.5 7C8.12 7 7 8.12 7 9.5V10C6.45 10 6 10.45 6 11C6 11.55 6.45 12 7 12H12C12.55 12 13 11.55 13 11C13 10.45 12.55 10 12 10V9.5Z" 
              fill="url(#paint0_linear)" 
            />
            <path 
              d="M19 15C19.55 15 20 14.55 20 14C20 13.45 19.55 13 19 13H17V12C17 11.45 16.55 11 16 11C15.45 11 15 11.45 15 12V13H14C13.45 13 13 13.45 13 14C13 14.55 13.45 15 14 15H19Z" 
              fill="url(#paint0_linear)" 
            />
            <path 
              d="M16.54 6.05L16.04 4.11C15.96 3.8 15.68 3.59 15.37 3.59C14.98 3.59 14.66 3.91 14.66 4.3C14.66 4.37 14.67 4.43 14.69 4.5L15.21 6.58C15.3 6.96 15.63 7.25 16.02 7.25C16.47 7.25 16.83 6.89 16.83 6.44C16.83 6.3 16.8 6.17 16.74 6.05H16.54Z" 
              fill="url(#paint0_linear)" 
            />
            <path 
              d="M15.5 17C16.33 17 17 16.33 17 15.5C17 14.67 16.33 14 15.5 14C14.67 14 14 14.67 14 15.5C14 16.33 14.67 17 15.5 17Z" 
              fill="url(#paint0_linear)" 
            />
            <path 
              d="M18 21H14C13.45 21 13 20.55 13 20C13 19.45 13.45 19 14 19H18C18.55 19 19 19.45 19 20C19 20.55 18.55 21 18 21Z" 
              fill="url(#paint0_linear)" 
            />
            <path 
              d="M9.5 7C8.12 7 7 8.12 7 9.5C7 10.88 8.12 12 9.5 12C10.88 12 12 10.88 12 9.5C12 8.12 10.88 7 9.5 7ZM9.5 10C9.22 10 9 9.78 9 9.5C9 9.22 9.22 9 9.5 9C9.78 9 10 9.22 10 9.5C10 9.78 9.78 10 9.5 10Z" 
              fill="url(#paint0_linear)" 
            />
            <path 
              d="M20.92 15.62C20.27 13.58 18.41 12.25 16.7 12.04C16.89 11.57 17 11.05 17 10.5C17 8.02 14.99 6 12.5 6C12.32 6 12.15 6.01 11.98 6.03C11.3 4.81 9.99 4 8.5 4C6.57 4 5 5.57 5 7.5C5 8.89 5.86 10.1 7.08 10.68C6.64 11.04 6.26 11.47 5.95 11.95C4.53 14.4 6.16 18 9.14 18H10C10.55 18 11 17.55 11 17C11 16.45 10.55 16 10 16H9.14C7.52 16 6.7 13.83 7.46 12.55C7.95 11.71 9.17 11.41 10.12 11.71C10.72 11.89 11.29 11.85 11.76 11.61C12.71 11.11 13.17 10.03 12.67 9.09C12.27 8.36 11.33 8.03 10.6 8.43C10.41 8.52 10.26 8.65 10.15 8.81C10.05 8.6 10 8.36 10 8.12C10 6.95 10.95 6 12.12 6C12.96 6 13.69 6.49 13.93 7.2C14.03 7.52 14.31 7.76 14.65 7.81C14.99 7.87 15.33 7.73 15.53 7.46C15.8 7.1 16.22 6.87 16.7 6.87C17.56 6.87 18.26 7.56 18.26 8.42C18.26 9.28 17.57 9.97 16.7 9.97C16.15 9.97 15.7 10.42 15.7 10.97C15.7 11.52 16.15 11.97 16.7 11.97C16.78 11.97 16.85 11.97 16.92 11.96C18.11 11.91 19.21 12.89 19.59 14.09C20.02 15.42 19.13 16.87 17.75 16.99C17.71 16.99 17.67 17 17.63 17H17C16.45 17 16 17.45 16 18C16 18.55 16.45 19 17 19H17.63C20.18 18.82 21.85 16.3 20.92 15.62Z" 
              fill="url(#paint0_linear)" 
            />
            
            <defs>
              <linearGradient id="paint0_linear" x1="5" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2B3AFF" />
                <stop offset="1" stopColor="#8C1AFE" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
} 