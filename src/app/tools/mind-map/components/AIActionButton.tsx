'use client';

import { motion } from 'framer-motion';

interface AIActionButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const AIActionButton: React.FC<AIActionButtonProps> = ({ onClick, isOpen }) => {
  return (
    <motion.button
      className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-primary to-secondary shadow-glow transition-transform ${
        isOpen ? 'rotate-45' : 'rotate-0'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {isOpen ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      )}
    </motion.button>
  );
};

export default AIActionButton; 