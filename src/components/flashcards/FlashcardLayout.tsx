import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FlashcardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function FlashcardLayout({ children, className }: FlashcardLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "min-h-screen w-full bg-gradient-to-br from-background/95 via-background to-background/95",
        "relative overflow-hidden",
        className
      )}
    >
      {/* Ambient background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-spin-slow" />
      </div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative backdrop-blur-sm bg-background/30 rounded-2xl shadow-2xl border border-primary/10 p-6"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
} 