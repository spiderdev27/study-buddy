"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { GlowingParticles } from '@/components/effects/GlowingParticles';

export function SplashScreen() {
  const [showGetStarted, setShowGetStarted] = useState(false);
  
  useEffect(() => {
    // Show get started button after a delay
    const timer = setTimeout(() => {
      setShowGetStarted(true);
    }, 1800);
    
    return () => clearTimeout(timer);
  }, []);

  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5 + i * 0.2,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }
    })
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden px-4">
      {/* Background particles effect */}
      <GlowingParticles />
      
      {/* Animated accent circles */}
      <motion.div 
        className="absolute top-1/4 -left-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.3], x: [0, 20, -20], y: [0, -30, 10] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
      />
      
      <motion.div 
        className="absolute bottom-1/4 -right-20 w-60 h-60 rounded-full bg-secondary/20 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0.2], x: [0, -40, 40], y: [0, 30, -10] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror", delay: 1 }}
      />
      
      {/* Logo and title with animation */}
      <div className="text-center z-10 mb-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-8 relative"
        >
          <div className="relative">
            <Logo size={150} />
            <motion.div
              className="absolute inset-0 bg-white opacity-20 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
            />
          </div>
        </motion.div>
        
        <motion.h1
          custom={0}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="text-6xl md:text-7xl font-bold mb-4 text-gradient"
        >
          Study Buddy
        </motion.h1>
        
        <motion.p
          custom={1}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="text-xl md:text-2xl text-text-secondary max-w-md mx-auto"
        >
          AI-Powered Learning Assistant
        </motion.p>
      </div>
      
      {/* Get started button with fade-in animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: showGetStarted ? 1 : 0, 
          y: showGetStarted ? 0 : 20 
        }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 relative"
      >
        <motion.div
          className="absolute inset-0 bg-white/5 blur-xl rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
        />
        
        <Link href="/onboarding">
          <motion.button 
            className="button-primary px-8 py-4 text-lg relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Get Started</span>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1L15 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 8H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
} 