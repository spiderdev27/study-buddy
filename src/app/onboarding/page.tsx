'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { GlowingParticles } from '@/components/effects/GlowingParticles';

// Onboarding slide content
const slides = [
  {
    title: 'Learn Faster with AI',
    description: 'Transform notes, lectures, and materials into effective study tools',
    illustration: 'AIIllustration',
  },
  {
    title: 'Understand Complex Topics',
    description: 'Get instant summaries, explanations, and answers to your questions',
    illustration: 'UnderstandIllustration',
  },
  {
    title: 'Master Your Knowledge',
    description: 'Create personalized flashcards and quizzes to reinforce learning',
    illustration: 'MasteryIllustration',
  },
  {
    title: 'Access Resources Anywhere',
    description: 'Find toppers\' notes, books, papers, and more in our comprehensive library',
    illustration: 'LibraryIllustration',
  },
];

// Placeholder for illustrations - these would be replaced with proper SVGs
function AIIllustration() {
  return (
    <div className="w-64 h-64 relative">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse-slow" />
      <div className="absolute inset-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14V22M12 14L6 10M12 14L18 10M12 2V10M12 10L18 6M12 10L6 6" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="paint0_linear" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2B3AFF" />
              <stop offset="1" stopColor="#8C1AFE" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function UnderstandIllustration() {
  // Similar structure to AIIllustration but with different SVG
  return <AIIllustration />;
}

function MasteryIllustration() {
  // Similar structure to AIIllustration but with different SVG
  return <AIIllustration />;
}

function LibraryIllustration() {
  // Similar structure to AIIllustration but with different SVG
  return <AIIllustration />;
}

// Map illustration names to components
const illustrations = {
  AIIllustration,
  UnderstandIllustration,
  MasteryIllustration,
  LibraryIllustration,
};

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // Get current illustration component
  const CurrentIllustration = illustrations[slides[currentSlide].illustration as keyof typeof illustrations];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <GlowingParticles />
      
      <header className="p-6 flex justify-between items-center z-10">
        <div className="text-xl font-bold text-gradient">Study Buddy</div>
        <Link href="/login">
          <button className="text-text-secondary underline">Skip</button>
        </Link>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-lg">
          {/* Slide indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-gradient w-8' : 'bg-white/20'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          
          {/* Slide content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-8">
                <CurrentIllustration />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {slides[currentSlide].title}
              </h1>
              
              <p className="text-lg text-text-secondary mb-10 max-w-md">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={prevSlide}
              className={`button-secondary ${
                currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={currentSlide === 0}
            >
              Previous
            </button>
            
            {currentSlide < slides.length - 1 ? (
              <button onClick={nextSlide} className="button-primary">
                Next
              </button>
            ) : (
              <Link href="/login">
                <button className="button-primary">
                  Get Started
                </button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 