import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, Brain, BookOpen, Code, Lightbulb, Palette, Music } from 'lucide-react';

const DECK_ICONS = [
  { icon: Brain, color: 'text-violet-500', label: 'Brain' },
  { icon: BookOpen, color: 'text-blue-500', label: 'Book' },
  { icon: Code, color: 'text-green-500', label: 'Code' },
  { icon: Lightbulb, color: 'text-yellow-500', label: 'Idea' },
  { icon: Palette, color: 'text-pink-500', label: 'Art' },
  { icon: Music, color: 'text-purple-500', label: 'Music' },
];

interface CreateDeckProps {
  onClose: () => void;
  onSave: (deck: { name: string; description: string; icon: React.ReactNode }) => void;
  className?: string;
}

export function CreateDeck({ onClose, onSave, className }: CreateDeckProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description) {
      const Icon = DECK_ICONS[selectedIcon].icon;
      onSave({
        name,
        description,
        icon: <Icon className={cn('h-5 w-5', DECK_ICONS[selectedIcon].color)} />,
      });
      setName('');
      setDescription('');
      setSelectedIcon(0);
    }
  };

  return (
    <>
      {/* Modal Backdrop - no blur */}
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />

      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'w-full max-w-lg pointer-events-auto',
            'bg-white/60 dark:bg-zinc-900/60',
            'backdrop-blur-xl backdrop-saturate-150',
            'border border-white/20 dark:border-zinc-800/20',
            'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
            'rounded-2xl',
            className
          )}
        >
          <div className="p-6 relative overflow-hidden">
            {/* Glassmorphism decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Create New Deck
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Add a new collection of flashcards
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-white/20 dark:hover:bg-zinc-800/50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Deck Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter deck name"
                    className="bg-white/80 dark:bg-zinc-800/80 border-white/20 dark:border-zinc-700/50 mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter deck description"
                    className="min-h-[100px] bg-white/80 dark:bg-zinc-800/80 border-white/20 dark:border-zinc-700/50 resize-none p-4 mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                    Choose an Icon
                  </label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {DECK_ICONS.map((icon, index) => {
                      const Icon = icon.icon;
                      return (
                        <motion.button
                          key={icon.label}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedIcon(index)}
                          className={cn(
                            'p-4 rounded-xl border transition-colors duration-200',
                            'flex flex-col items-center gap-2',
                            selectedIcon === index
                              ? 'bg-white/40 dark:bg-zinc-800/60 border-white/40 dark:border-zinc-700/60'
                              : 'bg-white/20 dark:bg-zinc-800/20 border-white/20 dark:border-zinc-700/20 hover:border-white/30 dark:hover:border-zinc-700/40'
                          )}
                        >
                          <Icon className={cn('w-6 h-6', icon.color)} />
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">
                            {icon.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-white/20 dark:border-zinc-700/50 hover:bg-white/20 dark:hover:bg-zinc-800/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="gap-2 bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-sm text-white"
                  disabled={!name || !description}
                >
                  <Save className="w-4 h-4" />
                  Create Deck
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
} 