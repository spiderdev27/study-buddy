'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { NoteEditor } from '@/components/smart-notes/NoteEditor';
import { NotesList } from '@/components/smart-notes/NotesList';
import { SmartNote, NoteCategory, NoteTemplate } from '@/types/smart-notes';
import { TemplateSelectionModal, NOTE_TEMPLATES } from '@/components/smart-notes/NoteTemplates';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { FolderNavigation } from '@/components/smart-notes/FolderNavigation';
import { parseInternalLinks } from '@/components/smart-notes/BacklinksPanel';
import { Header } from '@/components/navigation/Header';
import { NavBar } from '@/components/navigation/NavBar';

// Icons
import { 
  Lightbulb, Brain, FileText, 
  ArrowLeft, Plus, AlertCircle, 
  X, Download, Check, Info, Tag
} from 'lucide-react';

// Mock data
const DEMO_NOTES: SmartNote[] = [
  {
    id: '1',
    title: 'Introduction to Quantum Computing',
    content: '<h2>Quantum Computing Fundamentals</h2><p>Quantum computing is an emerging field that utilizes quantum mechanics to perform computations. Unlike classical bits, quantum bits or qubits can exist in multiple states simultaneously due to superposition.</p><h3>Key Concepts</h3><ul><li>Superposition</li><li>Entanglement</li><li>Quantum Gates</li></ul>',
    tags: ['quantum', 'computing', 'physics'],
    category: 'lecture',
    createdAt: '2023-03-15T10:30:00Z',
    updatedAt: '2023-03-15T11:45:00Z',
    isPinned: true,
    isArchived: false,
    color: 'blue',
    aiSummary: 'An overview of quantum computing fundamentals including superposition, entanglement, and quantum gates.',
    aiKeyInsights: [
      'Quantum computers use qubits instead of classical bits',
      'Superposition allows qubits to be in multiple states simultaneously',
      'Quantum entanglement enables correlated measurements across distances'
    ],
    aiTopics: ['Quantum Mechanics', 'Computing Theory', 'Qubits', 'Quantum Gates'],
    version: 1
  },
  {
    id: '2',
    title: 'Neural Networks Architecture',
    content: '<h2>Understanding Neural Networks</h2><p>Neural networks are computational models inspired by the human brain. They consist of layers of neurons that process and transform input data to produce meaningful output.</p><h3>Network Layers</h3><ul><li>Input Layer</li><li>Hidden Layers</li><li>Output Layer</li></ul><p>Each connection between neurons has a weight that is adjusted during training.</p>',
    tags: ['ai', 'machine learning', 'neural networks'],
    category: 'research',
    createdAt: '2023-03-10T14:20:00Z',
    updatedAt: '2023-03-12T09:15:00Z',
    isPinned: false,
    isArchived: false,
    color: 'purple',
    version: 1
  },
  {
    id: '3',
    title: 'Calculus II Exam Review',
    content: '<h2>Integration Techniques</h2><p>This review covers advanced integration techniques that will be on the upcoming exam.</p><h3>Topics to Review</h3><ul><li>Integration by Parts</li><li>Trigonometric Substitution</li><li>Partial Fractions</li></ul><p><strong>Remember:</strong> Practice multiple examples of each type.</p>',
    tags: ['calculus', 'integration', 'exam prep'],
    category: 'exam',
    createdAt: '2023-03-05T16:45:00Z',
    updatedAt: '2023-03-14T20:30:00Z',
    isPinned: true,
    isArchived: false,
    color: 'red',
    version: 1
  },
  {
    id: '4',
    title: 'Research Paper Structure',
    content: '<h2>Academic Research Paper Format</h2><p>A standard research paper follows a specific structure to effectively communicate findings.</p><h3>Paper Sections</h3><ol><li>Abstract</li><li>Introduction</li><li>Literature Review</li><li>Methodology</li><li>Results</li><li>Discussion</li><li>Conclusion</li><li>References</li></ol>',
    tags: ['research', 'academic writing', 'paper'],
    category: 'assignment',
    createdAt: '2023-02-28T11:20:00Z',
    updatedAt: '2023-03-01T13:10:00Z',
    isPinned: false,
    isArchived: false,
    color: 'green',
    version: 1
  },
  {
    id: '5',
    title: 'Mobile App Development Project',
    content: '<h2>Project Timeline and Requirements</h2><p>Our team project involves developing a cross-platform mobile application using React Native.</p><h3>Milestones</h3><ul><li>UI/UX Design - Due March 25</li><li>Frontend Implementation - Due April 10</li><li>Backend Integration - Due April 25</li><li>Testing - Due May 5</li><li>Deployment - Due May 15</li></ul>',
    tags: ['project', 'mobile', 'react native'],
    category: 'project',
    createdAt: '2023-03-02T09:30:00Z',
    updatedAt: '2023-03-05T16:20:00Z',
    isPinned: false,
    isArchived: false,
    color: 'amber',
    version: 1
  }
];

// Create empty note template
const createEmptyNote = (template?: NoteTemplate, parentId?: string | null): SmartNote => {
  const now = new Date().toISOString();
  
  if (template) {
    return {
      id: uuidv4(),
      title: '',
      content: template.content,
      tags: [...template.tags],
      category: template.category,
      createdAt: now,
      updatedAt: now,
      isPinned: false,
      isArchived: false,
      version: 1,
      color: template.color,
      templateId: template.id,
      parentId: parentId || null
    };
  }
  
  // Default empty note
  return {
    id: uuidv4(),
    title: '',
    content: '',
    tags: [],
    category: 'personal',
    createdAt: now,
    updatedAt: now,
    isPinned: false,
    isArchived: false,
    version: 1,
    parentId: parentId || null
  };
};

export default function SmartNotesPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // State for notes data
  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for editing
  const [currentNote, setCurrentNote] = useState<SmartNote | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);
  
  // State for template selection
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  // State for hierarchical organization
  const [currentFolder, setCurrentFolder] = useState<SmartNote | null>(null);
  const [showFolderNavigation, setShowFolderNavigation] = useState(true);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderParentId, setFolderParentId] = useState<string | null>(null);
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  
  // Initialize with demo data
  useEffect(() => {
    // In a real app, this would load from a database or API
    try {
      // Simulate network delay
      setTimeout(() => {
        // Check local storage for saved notes
        const savedNotes = localStorage.getItem('study-buddy-smart-notes');
        
        if (savedNotes) {
          try {
            const parsedNotes = JSON.parse(savedNotes);
            if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
              setNotes(parsedNotes);
            } else {
              // If the saved data is invalid, use demo data
              console.log('Invalid saved notes data, using demo data');
              setNotes(DEMO_NOTES);
              localStorage.setItem('study-buddy-smart-notes', JSON.stringify(DEMO_NOTES));
            }
          } catch (parseError) {
            console.error('Error parsing saved notes:', parseError);
            setNotes(DEMO_NOTES);
            localStorage.setItem('study-buddy-smart-notes', JSON.stringify(DEMO_NOTES));
          }
        } else {
          // Use demo data for first-time users
          console.log('No saved notes found, using demo data');
          setNotes(DEMO_NOTES);
          localStorage.setItem('study-buddy-smart-notes', JSON.stringify(DEMO_NOTES));
        }
        setIsLoading(false);
      }, 500); // Reduced delay for better UX
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Failed to load notes. Please try again later.');
      setIsLoading(false);
    }
  }, []);
  
  // Save notes to local storage when they change
  useEffect(() => {
    if (notes.length > 0 && !isLoading) {
      try {
        localStorage.setItem('study-buddy-smart-notes', JSON.stringify(notes));
        console.log('Notes saved to local storage:', notes.length);
      } catch (err) {
        console.error('Error saving notes to local storage:', err);
        setError('Failed to save notes. Your changes may not persist.');
      }
    }
  }, [notes, isLoading]);
  
  // Process backlinks when notes change
  useEffect(() => {
    if (notes.length > 0) {
      const updatedNotes = [...notes];
      let hasChanges = false;
      
      // First, reset all backlinks
      updatedNotes.forEach(note => {
        note.backlinks = [];
      });
      
      // Then, find all internal links and update backlinks
      updatedNotes.forEach(note => {
        const linkedTitles = parseInternalLinks(note.content);
        linkedTitles.forEach(title => {
          const targetNote = updatedNotes.find(
            n => n.title.toLowerCase() === title.toLowerCase()
          );
          
          if (targetNote && !targetNote.backlinks?.includes(note.id)) {
            if (!targetNote.backlinks) targetNote.backlinks = [];
            targetNote.backlinks.push(note.id);
            hasChanges = true;
          }
        });
      });
      
      if (hasChanges) {
        setNotes(updatedNotes);
      }
    }
  }, [notes]);
  
  // Handle note selection
  const handleNoteSelect = (note: SmartNote) => {
    setCurrentNote(note);
    setIsEditorOpen(true);
  };
  
  // Handle create new note
  const handleCreateNote = () => {
    // Open template selection modal instead of immediately creating a note
    setIsTemplateModalOpen(true);
    setIsWelcomeVisible(false);
  };
  
  // Handle template selection
  const handleTemplateSelect = (template: NoteTemplate) => {
    const newNote = createEmptyNote(template, currentFolder?.id || null);
    setCurrentNote(newNote);
    setIsEditorOpen(true);
    setIsTemplateModalOpen(false);
  };
  
  // Handle cancel template selection
  const handleCancelTemplateSelection = () => {
    setIsTemplateModalOpen(false);
  };
  
  // Handle save note
  const handleSaveNote = (updatedNote: SmartNote) => {
    setNotes(prevNotes => {
      const index = prevNotes.findIndex(note => note.id === updatedNote.id);
      if (index !== -1) {
        // Update existing note
        const newNotes = [...prevNotes];
        newNotes[index] = updatedNote;
        return newNotes;
      } else {
        // Add new note
        return [...prevNotes, updatedNote];
      }
    });
  };
  
  // Handle delete note
  const handleDeleteNote = (noteId: string) => {
    // If the note being deleted is currently open, close the editor
    if (currentNote && currentNote.id === noteId) {
      setIsEditorOpen(false);
      setCurrentNote(null);
    }
    
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };
  
  // Handle close editor
  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setCurrentNote(null);
  };
  
  // Handle export all notes
  const handleExportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `smart_notes_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Handle dismiss welcome
  const handleDismissWelcome = () => {
    setIsWelcomeVisible(false);
    localStorage.setItem('study-buddy-welcome-dismissed', 'true');
  };
  
  // Check if welcome should be shown
  useEffect(() => {
    const welcomeDismissed = localStorage.getItem('study-buddy-welcome-dismissed') === 'true';
    setIsWelcomeVisible(!welcomeDismissed);
  }, []);
  
  // Handle folder navigation
  const handleFolderNavigation = (folder: SmartNote | null) => {
    setCurrentFolder(folder);
    // If we're navigating to a note (not a folder), open it
    if (folder && !folder.isFolder) {
      handleNoteSelect(folder);
    }
  };
  
  // Create a new folder
  const handleCreateFolder = (parentId: string | null) => {
    setFolderParentId(parentId);
    setNewFolderName('');
    setShowFolderModal(true);
  };
  
  // Save new folder
  const handleSaveFolder = () => {
    if (newFolderName.trim()) {
      const now = new Date().toISOString();
      
      if (renameFolderId) {
        // Rename existing folder
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === renameFolderId 
              ? { ...note, title: newFolderName, updatedAt: now }
              : note
          )
        );
        setRenameFolderId(null);
      } else {
        // Create new folder
        const newFolder: SmartNote = {
          id: uuidv4(),
          title: newFolderName,
          content: '',
          tags: [],
          category: 'personal',
          createdAt: now,
          updatedAt: now,
          isPinned: false,
          isArchived: false,
          isFolder: true,
          parentId: folderParentId,
          children: [],
          version: 1
        };
        
        setNotes(prevNotes => [...prevNotes, newFolder]);
      }
      
      setShowFolderModal(false);
    }
  };
  
  // Rename folder
  const handleRenameFolder = (folderId: string) => {
    const folder = notes.find(note => note.id === folderId);
    if (folder) {
      setNewFolderName(folder.title);
      setRenameFolderId(folderId);
      setShowFolderModal(true);
    }
  };
  
  // Delete folder
  const handleDeleteFolder = (folderId: string) => {
    // Check if the folder contains any notes
    const hasChildren = notes.some(note => note.parentId === folderId);
    
    if (hasChildren) {
      if (!confirm('This folder contains notes. Deleting it will move all contents to the parent folder. Continue?')) {
        return;
      }
      
      // Get the parent ID to move children to
      const folderToDelete = notes.find(note => note.id === folderId);
      const parentId = folderToDelete?.parentId || null;
      
      // Move all children to the parent folder
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.parentId === folderId 
            ? { ...note, parentId }
            : note
        )
      );
    }
    
    // Remove the folder
    setNotes(prevNotes => prevNotes.filter(note => note.id !== folderId));
    
    // If we're in the deleted folder, navigate to parent
    if (currentFolder?.id === folderId) {
      const parentFolder = notes.find(note => note.id === currentFolder.parentId);
      setCurrentFolder(parentFolder || null);
    }
  };
  
  // Get notes for the current folder view
  const getCurrentFolderNotes = () => {
    if (!currentFolder) {
      // Root level - show all notes that don't have a parent
      return notes.filter(note => 
        !note.isFolder && 
        (!note.parentId || note.parentId === '')
      );
    } else {
      // Show notes within the current folder
      return notes.filter(note => 
        !note.isFolder && 
        note.parentId === currentFolder.id
      );
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-screen max-h-screen bg-gradient-to-br overflow-hidden",
      isDark 
        ? "from-gray-900 to-gray-800" 
        : "from-gray-50 to-gray-100"
    )}>
      {/* Common Header */}
      <Header />
      
      {/* Smart Notes Header */}
      <header className={cn(
        "py-4 px-6 flex items-center justify-between border-b sticky top-0 z-20",
        isDark ? "bg-gray-900/90 border-gray-700" : "bg-white/90 border-gray-200",
        "backdrop-blur-sm"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isDark ? "bg-blue-600" : "bg-blue-500"
          )}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={cn(
              "text-xl font-bold",
              isDark ? "text-white" : "text-gray-800"
            )}>
              Smart Notes
            </h1>
            <p className={cn(
              "text-xs",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>
              AI-powered note-taking for enhanced productivity
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditorOpen ? (
            <button
              onClick={handleCloseEditor}
              className={cn(
                "flex items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isDark 
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-200" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Notes</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleExportNotes}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isDark 
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-200" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                )}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={handleCreateNote}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isDark 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                )}
              >
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </button>
            </>
          )}
        </div>
      </header>
      
      {/* Main content area with folder navigation */}
      <main className="flex-1 overflow-hidden flex">
        {/* Folder navigation sidebar */}
        {showFolderNavigation && !isEditorOpen && (
          <div className={cn(
            "w-64 flex-shrink-0 border-r",
            isDark ? "bg-gray-900/60 border-gray-700" : "bg-white/60 border-gray-200"
          )}>
            <FolderNavigation
              notes={notes}
              currentFolder={currentFolder}
              onNavigate={handleFolderNavigation}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
            />
          </div>
        )}
        
        {/* Notes content area */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className={cn(
                "flex flex-col items-center",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4" 
                  style={{ borderTopColor: 'transparent', borderRightColor: 'currentColor', borderBottomColor: 'currentColor', borderLeftColor: 'currentColor' }} 
                />
                <p>Loading your notes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className={cn(
                "flex flex-col items-center text-center max-w-md p-6",
                isDark ? "text-red-300" : "text-red-600"
              )}>
                <AlertCircle className="w-16 h-16 mb-4" />
                <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                <p className="mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className={cn(
                    "px-4 py-2 rounded-lg",
                    isDark ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  )}
                >
                  Refresh Page
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <AnimatePresence mode="wait">
                {isEditorOpen && currentNote ? (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full p-4"
                  >
                    <NoteEditor 
                      note={currentNote} 
                      onSave={handleSaveNote} 
                      onClose={handleCloseEditor}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <NotesList 
                      notes={getCurrentFolderNotes()}
                      onNoteSelect={handleNoteSelect}
                      onCreateNote={handleCreateNote}
                      onDeleteNote={handleDeleteNote}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      
      {/* Welcome guide */}
      <AnimatePresence>
        {isWelcomeVisible && !isLoading && !error && !isEditorOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-2xl px-4"
          >
            <div className={cn(
              "rounded-xl p-6 border shadow-lg",
              isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    isDark ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-600"
                  )}>
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h3 className={cn(
                    "text-lg font-semibold",
                    isDark ? "text-white" : "text-gray-800"
                  )}>
                    Welcome to Smart Notes
                  </h3>
                </div>
                <button 
                  onClick={handleDismissWelcome}
                  className={cn(
                    "p-1 rounded-full transition-colors",
                    isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className={cn(
                "mb-4",
                isDark ? "text-gray-300" : "text-gray-600"
              )}>
                This is your AI-enhanced note-taking tool. Here's what makes it special:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className={cn(
                  "p-3 rounded-lg border",
                  isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                )}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className={cn(
                      "p-1 rounded-full mt-0.5",
                      isDark ? "bg-indigo-900/50 text-indigo-300" : "bg-indigo-100 text-indigo-600"
                    )}>
                      <Brain className="w-4 h-4" />
                    </div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-800"
                    )}>
                      AI Enhancements
                    </h4>
                  </div>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    Generate summaries, extract key insights, and identify main topics with AI assistance.
                  </p>
                </div>
                
                <div className={cn(
                  "p-3 rounded-lg border",
                  isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                )}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className={cn(
                      "p-1 rounded-full mt-0.5",
                      isDark ? "bg-emerald-900/50 text-emerald-300" : "bg-emerald-100 text-emerald-600"
                    )}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-800"
                    )}>
                      Rich Formatting
                    </h4>
                  </div>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    Full-featured editor with support for headings, lists, code blocks, and more.
                  </p>
                </div>
                
                <div className={cn(
                  "p-3 rounded-lg border",
                  isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"
                )}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className={cn(
                      "p-1 rounded-full mt-0.5",
                      isDark ? "bg-amber-900/50 text-amber-300" : "bg-amber-100 text-amber-600"
                    )}>
                      <Tag className="w-4 h-4" />
                    </div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-800"
                    )}>
                      Organization
                    </h4>
                  </div>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    Categorize, tag, and filter your notes for easy retrieval when you need them.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCreateNote}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors",
                    isDark 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Note</span>
                </button>
                <button
                  onClick={handleDismissWelcome}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors",
                    isDark 
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  )}
                >
                  <Check className="w-4 h-4" />
                  <span>Got It</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Template Selection Modal */}
      <AnimatePresence>
        {isTemplateModalOpen && (
          <TemplateSelectionModal
            onSelectTemplate={handleTemplateSelect}
            onClose={handleCancelTemplateSelection}
          />
        )}
      </AnimatePresence>
      
      {/* Folder Create/Rename Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "relative w-full max-w-md p-6 rounded-lg shadow-xl",
                isDark ? "bg-gray-900" : "bg-white"
              )}
            >
              <h2 className="text-xl font-bold mb-4">
                {renameFolderId ? 'Rename Folder' : 'Create New Folder'}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className={cn(
                    "w-full p-2 rounded-md border",
                    isDark 
                      ? "bg-gray-800 border-gray-700 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  )}
                  placeholder="Enter folder name"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowFolderModal(false)}
                  className={cn(
                    "px-4 py-2 rounded-md",
                    isDark 
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFolder}
                  disabled={!newFolderName.trim()}
                  className={cn(
                    "px-4 py-2 rounded-md",
                    !newFolderName.trim() && "opacity-50 cursor-not-allowed",
                    isDark 
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  )}
                >
                  {renameFolderId ? 'Rename' : 'Create'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Common NavBar */}
      <NavBar />
    </div>
  );
}