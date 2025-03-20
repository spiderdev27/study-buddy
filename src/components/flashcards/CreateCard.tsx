import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Save, Wand2, Upload, File, FileText, Image, BookOpen, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Deck {
  id: string;
  name: string;
}

interface CreateCardProps {
  decks: Deck[];
  onClose: () => void;
  onSave: (card: { front: string; back: string; deckId: string }) => void;
  onGenerateWithAI?: (topic: string, file?: File) => void;
  className?: string;
}

export function CreateCard({
  decks,
  onClose,
  onSave,
  onGenerateWithAI,
  className,
}: CreateCardProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front && back && selectedDeck) {
      onSave({ front, back, deckId: selectedDeck });
      setFront('');
      setBack('');
      setSelectedDeck('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return;
    }

    const fileType = file.type.split('/')[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    // Validate file types
    if (
      activeTab === 'image' && fileType !== 'image' ||
      activeTab === 'pdf' && fileExt !== 'pdf' ||
      activeTab === 'document' && !['doc', 'docx', 'txt', 'rtf', 'pdf'].includes(fileExt || '')
    ) {
      setError(`Invalid file type for ${activeTab} upload`);
      return;
    }

    setUploadedFile(file);
  };

  const handleGenerateWithAI = async () => {
    setError(null);
    
    if (activeTab === 'text' && !front) {
      setError("Please enter some text to generate flashcards");
      return;
    }

    if (['image', 'pdf', 'document'].includes(activeTab) && !uploadedFile) {
      setError(`Please upload a ${activeTab} file to generate flashcards`);
      return;
    }

    setIsGenerating(true);
    try {
      if (activeTab === 'text') {
        await onGenerateWithAI?.(front);
      } else if (uploadedFile) {
        await onGenerateWithAI?.('', uploadedFile);
      }
    } catch (error) {
      console.error("Error generating cards:", error);
      setError("Failed to generate flashcards. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = () => {
    switch (activeTab) {
      case 'image': return <Image className="w-8 h-8 text-blue-500" />;
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'document': return <File className="w-8 h-8 text-green-500" />;
      default: return <BookOpen className="w-8 h-8 text-purple-500" />;
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
            'w-full max-w-2xl pointer-events-auto',
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
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Create New Flashcard
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Add a new card or generate from study material
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
              {/* Deck Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Select Deck
                </label>
                <Select
                  value={selectedDeck}
                  onValueChange={setSelectedDeck}
                >
                  <SelectTrigger className="w-full bg-white/80 dark:bg-zinc-800/80 border-white/20 dark:border-zinc-700/50">
                    <SelectValue placeholder="Choose a deck for this card" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-white/20 dark:border-zinc-700/50">
                    {decks.map((deck) => (
                      <SelectItem 
                        key={deck.id} 
                        value={deck.id}
                        className="hover:bg-white/50 dark:hover:bg-zinc-800/50"
                      >
                        {deck.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Input Method Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4 bg-white/20 dark:bg-zinc-800/20">
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="image">Image</TabsTrigger>
                  <TabsTrigger value="pdf">PDF</TabsTrigger>
                  <TabsTrigger value="document">Document</TabsTrigger>
                </TabsList>

                {/* Text Input */}
                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Enter your text or topic
                    </label>
                    <div className="relative">
                      <Textarea
                        value={front}
                        onChange={(e) => setFront(e.target.value)}
                        placeholder="Enter your question, topic, or text to generate cards from..."
                        className="min-h-[120px] bg-white/80 dark:bg-zinc-800/80 border-white/20 dark:border-zinc-700/50 resize-none p-4"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* File Upload Content */}
                {['image', 'pdf', 'document'].map(tabId => (
                  <TabsContent key={tabId} value={tabId}>
                    <div className="border-2 border-dashed border-white/30 dark:border-zinc-700/50 rounded-xl p-8 text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        accept={tabId === 'image' ? 'image/*' : 
                                tabId === 'pdf' ? 'application/pdf' : 
                                '.doc,.docx,.txt,.rtf,.pdf'}
                      />
                      
                      {uploadedFile && activeTab === tabId ? (
                        <div className="flex flex-col items-center gap-2">
                          {getFileIcon()}
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {uploadedFile.name}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={triggerFileUpload}
                            className="mt-2"
                          >
                            Replace File
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="flex flex-col items-center gap-2 cursor-pointer" 
                          onClick={triggerFileUpload}
                        >
                          <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                          <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                            Click to upload {tabId === 'document' ? 'a document' : `a ${tabId}`}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {tabId === 'image' ? 'PNG, JPG or GIF' : 
                             tabId === 'pdf' ? 'PDF file' : 
                             'DOC, DOCX, TXT, RTF, or PDF'} (max 10MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Manual Answer Input */}
              {activeTab === 'text' && !isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Back (Answer)
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 hover:bg-white/20 dark:hover:bg-zinc-800/50"
                      onClick={handleGenerateWithAI}
                      disabled={!front || isGenerating}
                    >
                      <Wand2 className="w-3 h-3" />
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    placeholder="Enter the answer or definition here..."
                    className="min-h-[120px] bg-white/80 dark:bg-zinc-800/80 border-white/20 dark:border-zinc-700/50 resize-none p-4"
                  />
                </div>
              )}

              {/* Generate with AI Button for File Uploads */}
              {['image', 'pdf', 'document'].includes(activeTab) && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="gap-2 w-full hover:bg-white/20 dark:hover:bg-zinc-800/50"
                    onClick={handleGenerateWithAI}
                    disabled={!uploadedFile || isGenerating}
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Wand2 className="w-5 h-5" />
                        </motion.div>
                        Generating Flashcards...
                      </span>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Generate Flashcards from {activeTab}
                      </>
                    )}
                  </Button>
                  {!uploadedFile && (
                    <p className="text-xs text-zinc-500 mt-2">
                      Upload a {activeTab} file to generate flashcards with AI
                    </p>
                  )}
                </div>
              )}

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
                {activeTab === 'text' && (
                  <Button
                    type="submit"
                    className="gap-2 bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-sm text-white"
                    disabled={!front || !back || !selectedDeck}
                  >
                    <Save className="w-4 h-4" />
                    Save Card
                  </Button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
} 