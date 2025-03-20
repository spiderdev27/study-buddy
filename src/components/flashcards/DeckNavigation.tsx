import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, FolderTree, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Deck {
  id: string;
  name: string;
  description: string;
  totalCards: number;
  masteredCards: number;
  icon: React.ReactNode;
}

interface DeckNavigationProps {
  decks: Deck[];
  selectedDeck: string;
  onDeckSelect: (deckId: string) => void;
  onCreateDeck?: () => void;
  className?: string;
}

export function DeckNavigation({
  decks,
  selectedDeck,
  onDeckSelect,
  onCreateDeck,
  className,
}: DeckNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'w-full max-w-5xl mx-auto p-4',
        'bg-background/30 backdrop-blur-md rounded-2xl',
        'border border-primary/10 shadow-lg',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Your Decks</h2>
        </div>
        {onCreateDeck && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateDeck}
            className="gap-2 hover:bg-primary/10"
          >
            <Plus className="w-4 h-4" />
            New Deck
          </Button>
        )}
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {decks.map((deck) => (
            <motion.div
              key={deck.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex-shrink-0 w-64 p-4 rounded-xl cursor-pointer',
                'bg-gradient-to-br border transition-colors duration-200',
                selectedDeck === deck.id
                  ? 'from-primary/20 to-primary/10 border-primary/30'
                  : 'from-background/50 to-background/30 border-primary/10 hover:border-primary/20'
              )}
              onClick={() => onDeckSelect(deck.id)}
            >
              <div className="flex items-center gap-3 mb-2">
                {deck.icon}
                <h3 className="font-medium truncate">{deck.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {deck.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {deck.totalCards} cards
                </span>
                <span className="text-primary">
                  {Math.round((deck.masteredCards / deck.totalCards) * 100)}% mastered
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1 bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(deck.masteredCards / deck.totalCards) * 100}%`,
                  }}
                  transition={{ duration: 0.8, type: 'spring' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll indicators */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-full pointer-events-none bg-gradient-to-r from-background to-transparent" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-full pointer-events-none bg-gradient-to-l from-background to-transparent" />
      </div>
    </motion.div>
  );
} 