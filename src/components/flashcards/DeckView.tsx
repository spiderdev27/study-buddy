'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FlashcardView } from './FlashcardView';
import { Deck, StudySession, Flashcard } from '@/types/flashcards';
import { cn } from '@/lib/utils';

interface DeckViewProps {
  deck: Deck;
  onClose: () => void;
  onUpdateDeck: (updatedDeck: Deck) => void;
}

export function DeckView({ deck, onClose, onUpdateDeck }: DeckViewProps) {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === 'dark';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [isEditingDeckName, setIsEditingDeckName] = useState(false);
  const [editedDeckName, setEditedDeckName] = useState(deck.name);
  const [studySession, setStudySession] = useState<StudySession>({
    deckId: deck.id,
    startTime: new Date().toISOString(),
    cardsStudied: 0,
    correctAnswers: 0,
    averageConfidence: 0,
  });

  const handleConfidenceChange = (confidence: number) => {
    // Update the current flashcard's confidence
    const updatedDeck = {
      ...deck,
      flashcards: deck.flashcards.map((card, index) =>
        index === currentIndex
          ? { ...card, confidence, lastReviewed: new Date().toISOString() }
          : card
      ),
      lastStudied: new Date().toISOString(),
    };

    // Update study session stats
    setStudySession((prev) => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
      correctAnswers: prev.correctAnswers + (confidence >= 2 ? 1 : 0),
      averageConfidence:
        (prev.averageConfidence * prev.cardsStudied + confidence) /
        (prev.cardsStudied + 1),
    }));

    onUpdateDeck(updatedDeck);
  };

  const handleNext = () => {
    if (currentIndex < deck.flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // End of deck
      setStudySession((prev) => ({
        ...prev,
        endTime: new Date().toISOString(),
      }));
    }
  };

  const handleAddCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) return;

    const newCard: Flashcard = {
      id: Math.random().toString(36).substr(2, 9),
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      confidence: 0,
      lastReviewed: null,
    };

    const updatedDeck = {
      ...deck,
      flashcards: [...deck.flashcards, newCard],
    };

    onUpdateDeck(updatedDeck);
    setNewCardFront('');
    setNewCardBack('');
    setShowAddCard(false);
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setNewCardFront(card.front);
    setNewCardBack(card.back);
    setShowEditCard(true);
  };

  const handleSaveCardEdit = () => {
    if (!editingCard || !newCardFront.trim() || !newCardBack.trim()) return;

    const updatedDeck = {
      ...deck,
      flashcards: deck.flashcards.map(card =>
        card.id === editingCard.id
          ? { ...card, front: newCardFront.trim(), back: newCardBack.trim() }
          : card
      ),
    };

    onUpdateDeck(updatedDeck);
    setShowEditCard(false);
    setEditingCard(null);
    setNewCardFront('');
    setNewCardBack('');
  };

  const handleSaveDeckName = () => {
    if (!editedDeckName.trim()) return;

    const updatedDeck = {
      ...deck,
      name: editedDeckName.trim(),
    };

    onUpdateDeck(updatedDeck);
    setIsEditingDeckName(false);
  };

  const toggleMode = () => {
    setIsStudyMode(!isStudyMode);
  };

  const resetStudySession = () => {
    setCurrentIndex(0);
    setStudySession({
      deckId: deck.id,
      startTime: new Date().toISOString(),
      cardsStudied: 0,
      correctAnswers: 0,
      averageConfidence: 0,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 h-full w-full overflow-hidden"
      data-theme={currentTheme}
    >
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 backdrop-blur-sm",
          isDark ? "bg-black/70" : "bg-black/30"
        )}
        onClick={onClose} 
      />
      
      {/* Scrollable content wrapper */}
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden pt-6 pb-12">
        <div className="relative z-10 w-full max-w-6xl mx-auto p-4">
          <div className={cn(
            "rounded-2xl border shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-60px)]",
            "backdrop-blur-md",
            isDark 
              ? "bg-gray-900 border-white/10" 
              : "bg-white border-gray-200"
          )}>
            {/* Header - Fixed at the top with higher z-index */}
            <div className={cn(
              "p-6 border-b sticky top-0 z-20",
              isDark ? "border-white/10 bg-gray-900" : "border-gray-200 bg-white"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={cn(
                    "text-2xl font-semibold",
                    isDark ? "text-white" : "text-gray-900"
                  )}>{deck.name}</h2>
                  <p className={cn(
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    {deck.flashcards.length} cards
                    {deck.lastStudied && ` • Last studied ${new Date(deck.lastStudied).toLocaleDateString()}`}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Mode toggle */}
                  <button
                    onClick={toggleMode}
                    className={cn(
                      "px-4 py-2 rounded-lg transition-colors",
                      isDark 
                        ? "bg-gray-800 text-gray-300 hover:text-white border border-white/10" 
                        : "bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200"
                    )}
                  >
                    {isStudyMode ? 'View All Cards' : 'Study Mode'}
                  </button>
                  
                  {/* Close button */}
                  <motion.button
                    onClick={onClose}
                    className={cn(
                      "p-2 transition-colors",
                      isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* Content - Scrollable container */}
            <div className={cn(
              "p-6 overflow-y-auto",
              isDark ? "bg-gray-900" : "bg-white"
            )}>
              <div className="flex-1">
                {isStudyMode ? (
                  <>
                    {/* Progress bar - Sticky just below the header */}
                    <div className={cn(
                      "mb-8 sticky top-[92px] pt-2 pb-4 z-10",
                      isDark ? "bg-gray-900" : "bg-white"
                    )}>
                      <div className={cn(
                        "flex justify-between text-sm mb-2",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}>
                        <span>Progress</span>
                        <span>
                          {currentIndex + 1} / {deck.flashcards.length} cards
                        </span>
                      </div>
                      <div className={cn(
                        "h-2 rounded-full overflow-hidden",
                        isDark 
                          ? "bg-gray-800 border border-white/5" 
                          : "bg-gray-100 border border-gray-200"
                      )}>
                        <motion.div
                          className="h-full bg-blue-500"
                          initial={{ width: '0%' }}
                          animate={{
                            width: `${((currentIndex + 1) / deck.flashcards.length) * 100}%`,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* Study mode view */}
                    <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px] mb-8">
                      <AnimatePresence mode="wait">
                        {currentIndex < deck.flashcards.length ? (
                          <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full"
                          >
                            <FlashcardView
                              flashcard={deck.flashcards[currentIndex]}
                              onConfidenceChange={handleConfidenceChange}
                              onNext={handleNext}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                          >
                            <h3 className="text-2xl font-semibold mb-4">Study Session Complete!</h3>
                            <p className="text-text-secondary mb-6">
                              You've reviewed all {deck.flashcards.length} cards in this deck.
                            </p>
                            <button
                              onClick={resetStudySession}
                              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-text-primary transition-colors"
                            >
                              Study Again
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  // View all cards mode
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                    {deck.flashcards.length > 0 ? (
                      deck.flashcards.map((card) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "group relative rounded-lg p-4 backdrop-blur-sm min-h-[150px] flex flex-col",
                            isDark ? "bg-gray-800 border border-white/10" : "bg-gray-50 border border-gray-200"
                          )}
                          onClick={() => handleEditCard(card)}
                        >
                          <div className={cn(
                            "font-medium mb-2", 
                            isDark ? "text-text-primary" : "text-gray-900"
                          )}>
                            <div className="line-clamp-2 break-words">{card.front}</div>
                          </div>
                          <div className={cn(
                            "flex-1",
                            isDark ? "text-text-secondary" : "text-gray-600"
                          )}>
                            <div className="line-clamp-3 break-words">{card.back}</div>
                          </div>
                          <motion.button
                            className="absolute top-2 right-2 p-2 text-text-secondary hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCard(card);
                            }}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </motion.button>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full text-center p-12"
                      >
                        <p className={cn(
                          "text-lg mb-6",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          This deck doesn't have any flashcards yet. Add your first card!
                        </p>
                        <button
                          onClick={() => setShowAddCard(true)}
                          className={cn(
                            "px-6 py-3 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors",
                            "flex items-center justify-center mx-auto"
                          )}
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Your First Card
                        </button>
                      </motion.div>
                    )}
                    
                    {deck.flashcards.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddCard(true)}
                        className={cn(
                          "rounded-lg border-2 border-dashed p-4 flex flex-col items-center justify-center min-h-[150px] transition-colors",
                          isDark ? "border-white/10 hover:border-white/20 text-white/50 hover:text-white/80" : "border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700"
                        )}
                      >
                        <svg className="w-8 h-8 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Card
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            data-theme={currentTheme}
          >
            <div className="fixed inset-0" onClick={() => setShowAddCard(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "relative rounded-xl p-6 w-full max-w-md m-4 z-10",
                isDark ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-900"
              )}
            >
              <h3 className="text-xl font-semibold mb-4">Add New Flashcard</h3>
              <div className="space-y-4">
                <div>
                  <label className={cn(
                    "block text-sm mb-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    Front
                  </label>
                  <textarea
                    value={newCardFront}
                    onChange={(e) => setNewCardFront(e.target.value)}
                    placeholder="Enter the question or front of the card"
                    className={cn(
                      "w-full px-4 py-2 rounded-lg resize-none",
                      isDark ? "bg-gray-700 text-white placeholder-gray-400" : "bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-300"
                    )}
                    rows={3}
                  />
                </div>
                <div>
                  <label className={cn(
                    "block text-sm mb-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    Back
                  </label>
                  <textarea
                    value={newCardBack}
                    onChange={(e) => setNewCardBack(e.target.value)}
                    placeholder="Enter the answer or back of the card"
                    className={cn(
                      "w-full px-4 py-2 rounded-lg resize-none",
                      isDark ? "bg-gray-700 text-white placeholder-gray-400" : "bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-300"
                    )}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors",
                    isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                  )}
                  onClick={() => setShowAddCard(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  onClick={handleAddCard}
                >
                  Add Card
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Card Modal */}
      <AnimatePresence>
        {showEditCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            data-theme={currentTheme}
          >
            <div className="fixed inset-0" onClick={() => {
              setShowEditCard(false);
              setEditingCard(null);
              setNewCardFront('');
              setNewCardBack('');
            }} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "relative rounded-xl p-6 w-full max-w-md m-4 z-10",
                isDark ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-900"
              )}
            >
              <h3 className="text-xl font-semibold mb-4">Edit Flashcard</h3>
              <div className="space-y-4">
                <div>
                  <label className={cn(
                    "block text-sm mb-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    Front
                  </label>
                  <textarea
                    value={newCardFront}
                    onChange={(e) => setNewCardFront(e.target.value)}
                    placeholder="Enter the question or front of the card"
                    className={cn(
                      "w-full px-4 py-2 rounded-lg resize-none",
                      isDark ? "bg-gray-700 text-white placeholder-gray-400" : "bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-300"
                    )}
                    rows={3}
                  />
                </div>
                <div>
                  <label className={cn(
                    "block text-sm mb-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    Back
                  </label>
                  <textarea
                    value={newCardBack}
                    onChange={(e) => setNewCardBack(e.target.value)}
                    placeholder="Enter the answer or back of the card"
                    className={cn(
                      "w-full px-4 py-2 rounded-lg resize-none",
                      isDark ? "bg-gray-700 text-white placeholder-gray-400" : "bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-300"
                    )}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors",
                    isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                  )}
                  onClick={() => {
                    setShowEditCard(false);
                    setEditingCard(null);
                    setNewCardFront('');
                    setNewCardBack('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  onClick={handleSaveCardEdit}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 