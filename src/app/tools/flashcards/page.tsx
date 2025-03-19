'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeckView } from '@/components/flashcards/DeckView';
import { useSession } from 'next-auth/react';
import { generateFlashcards, generateFlashcardsFromImage, generateFlashcardsFromPDF } from '@/lib/gemini';
import { Flashcard, Deck } from '@/types/flashcards';
import { Header } from '@/components/navigation/Header';
import { NavBar } from '@/components/navigation/NavBar';
import { cn } from '@/lib/utils';

// Animation variants for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Animation variants for deck cards
const deckVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  },
  hover: {
    scale: 1.05,
    rotateY: 5,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: {
      duration: 0.2
    }
  }
};

export default function FlashcardsPage() {
  const { data: session } = useSession();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [numCards, setNumCards] = useState(10);
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);

  // Load decks from localStorage on mount
  useEffect(() => {
    const savedDecks = localStorage.getItem('flashcard-decks');
    if (savedDecks) {
      setDecks(JSON.parse(savedDecks));
    }
  }, []);

  // Save decks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('flashcard-decks', JSON.stringify(decks));
  }, [decks]);

  const handleFileSelect = async (files: FileList) => {
    setPendingFiles(files);
    setShowConfig(true);
  };

  const processFiles = async () => {
    if (!pendingFiles) return;
    
    setIsUploading(true);
    setShowConfig(false);
    
    for (const file of pendingFiles) {
      try {
        let flashcards: Flashcard[] = [];
        setUploadProgress(25);
        
      if (file.type === 'application/pdf') {
          flashcards = await generateFlashcardsFromPDF(file, numCards);
        } else if (file.type.startsWith('image/')) {
          flashcards = await generateFlashcardsFromImage(file, numCards);
      } else {
          const text = await file.text();
          flashcards = await generateFlashcards(text, numCards);
        }
        
        setUploadProgress(75);
        
        const newDeck: Deck = {
          id: Date.now().toString(),
          name: file.name.split('.')[0],
          flashcards: flashcards.map(card => ({
            ...card,
            id: Math.random().toString(36).substr(2, 9)
          })),
          createdAt: new Date().toISOString(),
          lastStudied: null
        };
        
        setDecks(prev => [...prev, newDeck]);
        setUploadProgress(100);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }
    
    setPendingFiles(null);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;
    
    setIsUploading(true);
    setShowTextInput(false);
    setUploadProgress(25);
    
    try {
      const flashcards = await generateFlashcards(inputText, numCards);
      setUploadProgress(75);
      
      const newDeck: Deck = {
        id: Date.now().toString(),
        name: `Notes ${new Date().toLocaleDateString()}`,
        flashcards: flashcards.map(card => ({
          ...card,
          id: Math.random().toString(36).substr(2, 9)
        })),
        createdAt: new Date().toISOString(),
        lastStudied: null
      };
      
      setDecks(prev => [...prev, newDeck]);
      setUploadProgress(100);
      setInputText('');
    } catch (error) {
      console.error('Error processing text:', error);
    }
    
    setIsUploading(false);
    setUploadProgress(0);
  };

  // Handle file drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  // Handle deck updates
  const handleUpdateDeck = (updatedDeck: Deck) => {
    setDecks(prev =>
      prev.map(deck => (deck.id === updatedDeck.id ? updatedDeck : deck))
    );
  };

  // Handle deck deletion
  const handleDeleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== deckId));
  };

  // Create new empty deck
  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;

    const newDeck: Deck = {
      id: Date.now().toString(),
      name: newDeckName,
      flashcards: [],
      createdAt: new Date().toISOString(),
      lastStudied: null
    };

    setDecks(prev => [...prev, newDeck]);
    setNewDeckName('');
    setShowCreateDeck(false);
  };

  // Prevent default drag behaviors
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 pb-24">
        {/* Create Deck Button */}
        <div className="flex justify-end mb-6">
          <motion.button
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateDeck(true)}
          >
            Create Deck
          </motion.button>
        </div>

        {/* Upload Zone */}
        <div 
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 mb-8 text-center transition-all",
            "bg-white/20 dark:bg-card-bg/20 backdrop-blur-xl",
            "shadow-lg dark:shadow-none",
            "ring-1 ring-black/5 dark:ring-white/10",
            isDragging ? "border-primary" : "border-black/10 dark:border-white/10",
            isUploading ? "pointer-events-none" : "cursor-pointer hover:bg-white/30 dark:hover:bg-card-bg/30"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {/* Upload Progress */}
          {isUploading && (
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-xl overflow-hidden"
              initial={{ width: "0%" }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          )}

          <div className="relative z-10">
              <input
                type="file"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                multiple
                accept=".txt,.pdf,image/*"
                disabled={isUploading}
              />
              <div className="space-y-4">
                <div className="text-2xl font-semibold text-black dark:text-white">
                  {isUploading ? (
                    "Processing your files..."
                  ) : (
                    "Drop your study materials here"
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-200">
                  {isUploading
                    ? `${uploadProgress}% complete`
                    : "Upload PDFs, images, or text files to create flashcards"}
                </p>
                {!isUploading && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTextInput(true);
                    }}
                    className="px-4 py-2 rounded-lg bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition-colors backdrop-blur-sm text-black dark:text-white"
                  >
                    Or paste text directly
                  </button>
                )}
              </div>
            </div>
          </div>

        {/* Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {decks.map((deck) => (
              <motion.div
                key={deck.id}
                variants={deckVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="group relative bg-card-bg backdrop-blur-lg rounded-xl p-6 cursor-pointer border border-white/10"
                onClick={() => setSelectedDeck(deck)}
              >
                <h3 className="text-xl font-semibold mb-2">{deck.name}</h3>
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>{deck.flashcards.length} cards</span>
                  <span>
                    {deck.lastStudied
                      ? `Last studied ${new Date(deck.lastStudied).toLocaleDateString()}`
                      : 'Not studied yet'}
                          </span>
                        </div>
                
                {/* Preview of first card */}
                {deck.flashcards[0] && (
                  <div className="mt-4 p-4 bg-card-bg/50 rounded-lg border border-white/5">
                    <p className="text-sm text-text-secondary truncate">
                      {deck.flashcards[0].front}
                    </p>
                  </div>
                )}

                {/* Delete button */}
                <motion.button
                  className="absolute top-2 right-2 p-2 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDeck(deck.id);
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Create Deck Modal */}
      <AnimatePresence>
        {showCreateDeck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card-bg backdrop-blur-md rounded-xl p-6 w-full max-w-md border border-white/10"
            >
              <h3 className="text-xl font-semibold mb-4">Create New Deck</h3>
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="Enter deck name"
                className="w-full px-4 py-2 rounded-lg bg-card-bg/50 text-text-primary placeholder-text-secondary border border-white/10 mb-4"
                autoFocus
              />
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                  onClick={() => setShowCreateDeck(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-text-primary transition-colors"
                  onClick={handleCreateDeck}
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card-bg backdrop-blur-md rounded-xl p-6 w-full max-w-md m-4 border border-white/10"
            >
              <h3 className="text-xl font-semibold mb-4">Configure Flashcard Generation</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Number of Flashcards to Generate
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={numCards}
                      onChange={(e) => setNumCards(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-card-bg/50 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-text-primary font-medium w-12 text-center">
                      {numCards}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">
                  Select how many flashcards you want to generate from your study material.
                  More cards will cover more content but may take longer to process.
                </p>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  className="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                  onClick={() => {
                    setShowConfig(false);
                    setPendingFiles(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-text-primary transition-colors"
                  onClick={processFiles}
                >
                  Generate Flashcards
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Input Modal */}
      <AnimatePresence>
        {showTextInput && (
          <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowTextInput(false)}
          >
                    <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-white/20 dark:bg-card-bg/20 backdrop-blur-xl",
                "rounded-xl p-6 w-full max-w-2xl m-4",
                "ring-1 ring-black/5 dark:ring-white/10",
                "border border-black/10 dark:border-white/10",
                "shadow-lg dark:shadow-none"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Create Flashcards from Text</h3>
              <div className="space-y-6">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your text here..."
                  className={cn(
                    "w-full h-64 px-4 py-2 rounded-lg resize-none",
                    "bg-white/20 dark:bg-card-bg/20 backdrop-blur-sm",
                    "ring-1 ring-black/5 dark:ring-white/10",
                    "border border-black/10 dark:border-white/10",
                    "placeholder-text-secondary/50",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                  )}
                />
                  <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Number of Flashcards to Generate
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={numCards}
                      onChange={(e) => setNumCards(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-white/20 dark:bg-card-bg/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-text-primary font-medium w-12 text-center">
                      {numCards}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors",
                    "bg-white/10 dark:bg-card-bg/40",
                    "hover:bg-white/20 dark:hover:bg-card-bg/60"
                  )}
                  onClick={() => {
                    setShowTextInput(false);
                    setInputText('');
                  }}
                  >
                    Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 transition-colors"
                  onClick={handleTextSubmit}
                >
                  Create Flashcards
                </button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Study Mode */}
      <AnimatePresence>
        {selectedDeck && (
          <DeckView
            deck={selectedDeck}
            onClose={() => setSelectedDeck(null)}
            onUpdateDeck={handleUpdateDeck}
          />
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <NavBar />
    </div>
  );
} 