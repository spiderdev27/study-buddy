'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Extension } from '@tiptap/core';
import { common, createLowlight } from 'lowlight';
import { cn } from '@/lib/utils';
import { SmartNote, NoteCategory, NoteTemplate } from '@/types/smart-notes';
import { useTheme } from 'next-themes';

// Utility function for formatting timestamps
const formatTime = (date: Date): string => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

// Toolbar icons and components
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo,
  ChevronDown, Tag, Save, X, Clock, Share, Download, Mic
} from 'lucide-react';

import { NOTE_TEMPLATES } from '@/components/smart-notes/NoteTemplates';
import { BacklinksPanel, parseInternalLinks } from '@/components/smart-notes/BacklinksPanel';
import { VoiceRecorder } from '@/components/smart-notes/VoiceRecorder';
import { AdvancedAI } from '@/components/smart-notes/AdvancedAI';
import WikiLinksExtension from '@/components/smart-notes/WikiLinksExtension';

interface NoteEditorProps {
  note: SmartNote;
  onSave: (note: SmartNote) => void;
  onClose?: () => void;
  autoSave?: boolean;
}

const lowlight = createLowlight(common);

export function NoteEditor({ note, onSave, onClose, autoSave = true }: NoteEditorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [currentNote, setCurrentNote] = useState<SmartNote>(note);
  const [isSaving, setIsSaving] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [showTemplateInfo, setShowTemplateInfo] = useState(!!note.templateId);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [activeTab, setActiveTab] = useState<'format' | 'ai' | 'backlinks'>('format');
  
  // Get template information if this note was created from a template
  const template = note.templateId ? 
    NOTE_TEMPLATES.find(t => t.id === note.templateId) || null : null;
  
  // TipTap editor setup
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable the built-in codeBlock to avoid conflicts with CodeBlockLowlight
        codeBlock: false,
      }),
      Highlight,
      Typography,
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2 my-2',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder: template 
          ? 'Fill in the template with your content...' 
          : 'Start writing your brilliant ideas...',
      }),
      // Add custom extension for wiki-style links
      WikiLinksExtension,
    ],
    content: currentNote.content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none',
          'p-4 min-h-[300px] h-full overflow-y-auto',
          isDark ? 'prose-invert' : ''
        ),
      },
    },
    onUpdate: ({ editor }) => {
      setCurrentNote({
        ...currentNote, 
        content: editor.getHTML(),
        updatedAt: new Date().toISOString(),
      });
      
      // Handle auto-save
      if (autoSave) {
        handleAutoSave(editor.getHTML());
      }
    },
    // Fix for SSR hydration issues
    immediatelyRender: false,
  });
  
  // Auto-save functionality
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  
  const handleAutoSave = useCallback(
    (() => {
      let timeout: NodeJS.Timeout;
      return (content: string) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setIsSaving(true);
          const updatedNote = {
            ...currentNote, 
            content,
            updatedAt: new Date().toISOString(),
          };
          onSave(updatedNote);
          setLastSavedAt(new Date());
          setIsSaving(false);
        }, 2000);
      };
    })(),
    [currentNote, onSave]
  );
  
  // Update the editor when the note changes from outside
  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content);
    }
    setCurrentNote(note);
  }, [note, editor]);
  
  // Handle save
  const handleSave = () => {
    setIsSaving(true);
    onSave(currentNote);
    setLastSavedAt(new Date());
    setTimeout(() => setIsSaving(false), 800);
  };
  
  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentNote({
      ...currentNote,
      title: e.target.value,
      updatedAt: new Date().toISOString(),
    });
  };
  
  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentNote({
      ...currentNote,
      category: e.target.value as NoteCategory,
      updatedAt: new Date().toISOString(),
    });
  };
  
  // Handle tag addition
  const handleAddTag = () => {
    if (newTag.trim() && !currentNote.tags.includes(newTag.trim())) {
      setCurrentNote({
        ...currentNote,
        tags: [...currentNote.tags, newTag.trim()],
        updatedAt: new Date().toISOString(),
      });
      setNewTag('');
    }
  };
  
  // Handle tag removal
  const handleRemoveTag = (tag: string) => {
    setCurrentNote({
      ...currentNote,
      tags: currentNote.tags.filter(t => t !== tag),
      updatedAt: new Date().toISOString(),
    });
  };
  
  // Handle pin/unpin
  const handleTogglePin = () => {
    setCurrentNote({
      ...currentNote,
      isPinned: !currentNote.isPinned,
      updatedAt: new Date().toISOString(),
    });
  };
  
  // AI enhancements (simulated)
  const handleAIEnhance = async (type: 'summary' | 'insights' | 'topics') => {
    setAiProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (type === 'summary') {
      setCurrentNote({
        ...currentNote,
        aiSummary: `This note covers ${currentNote.category} material related to ${currentNote.tags.join(', ')}. The main points include key concepts and applications in the field.`,
        updatedAt: new Date().toISOString(),
      });
    } else if (type === 'insights') {
      setCurrentNote({
        ...currentNote,
        aiKeyInsights: [
          'Important connection to previous concepts explored',
          'Novel approach to problem-solving in this domain',
          'Potential application in related fields',
        ],
        updatedAt: new Date().toISOString(),
      });
    } else if (type === 'topics') {
      setCurrentNote({
        ...currentNote,
        aiTopics: [
          'Main concept',
          'Supporting theory',
          'Practical application',
          'Future research',
        ],
        updatedAt: new Date().toISOString(),
      });
    }
    
    setAiProcessing(false);
  };
  
  // Handle voice transcription
  const handleTranscriptionComplete = (text: string) => {
    if (editor) {
      editor.commands.insertContent(text);
      setShowVoiceRecorder(false);
    }
  };
  
  if (!editor) {
    return <div className="flex items-center justify-center h-96">Loading editor...</div>;
  }
  
  return (
    <div className={cn(
      "flex flex-col h-full w-full rounded-lg overflow-hidden",
      isDark ? "bg-gray-900" : "bg-white",
      isDark ? "shadow-lg shadow-black/30" : "shadow-xl shadow-gray-300/30"
    )}>
      {/* Note header */}
      <div className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b",
        isDark ? "border-gray-800" : "border-gray-200"
      )}>
        <div className="flex-1 w-full mb-2 sm:mb-0">
          <input
            type="text"
            placeholder="Note Title"
            value={currentNote.title}
            onChange={handleTitleChange}
            className={cn(
              "w-full text-2xl font-bold border-b-2 border-transparent focus:outline-none focus:border-blue-500 bg-transparent",
              isDark ? "text-white" : "text-gray-900"
            )}
          />
        </div>
        
        <div className="flex items-center space-x-1 w-full sm:w-auto justify-end">
          {isSaving ? (
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" /> Saving...
            </span>
          ) : lastSavedAt && (
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" /> Saved {formatTime(lastSavedAt)}
            </span>
          )}
          
          <button
            onClick={handleSave}
            className={cn(
              "p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-500",
              "transition-colors duration-200"
            )}
          >
            <Save className="w-5 h-5" />
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900 text-red-500",
                "transition-colors duration-200"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Template info banner - show if this note was created from a template */}
      {showTemplateInfo && template && (
        <div className={cn(
          "px-4 py-2 text-sm flex items-center justify-between",
          `bg-${template.color || 'blue'}-100 dark:bg-${template.color || 'blue'}-900/30`,
          `text-${template.color || 'blue'}-700 dark:text-${template.color || 'blue'}-300`
        )}>
          <div className="flex items-center">
            <span className="font-medium">Template:</span>
            <span className="ml-1">{template.name}</span>
          </div>
          <button 
            onClick={() => setShowTemplateInfo(false)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Main Toolbar */}
      <div className={cn(
        "sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 border-b",
        isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      )}>
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('bold') 
              ? (isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900")
              : (isDark ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100")
          )}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('italic') ? "bg-gray-700 text-white" : 
              isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
          )}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('strike') ? "bg-gray-700 text-white" : 
              isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
          )}
        >
          <Strikethrough className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('codeBlock') ? "bg-gray-700 text-white" : 
              isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
          )}
        >
          <Code className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('heading', { level: 1 }) ? "bg-gray-700 text-white" : 
              isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
          )}
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('heading', { level: 2 }) ? "bg-gray-700 text-white" : 
              isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
          )}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('heading', { level: 3 }) ? "bg-gray-700 text-white" : 
              isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
          )}
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('bulletList') ? "bg-gray-700 text-white" : 
              isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
          )}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('orderedList') ? "bg-gray-700 text-white" : 
              isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            editor.isActive('taskList') ? "bg-gray-700 text-white" : 
              isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
          )}
        >
          <CheckSquare className="h-4 w-4" />
        </button>
        
        <div className="flex-grow" />
        
        {/* Voice Recorder button */}
        <button
          onClick={() => setShowVoiceRecorder(true)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isDark ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-500 hover:bg-indigo-600 text-white"
          )}
          title="Record Voice Note"
        >
          <Mic className="h-4 w-4" />
        </button>
        
        {/* Undo/Redo buttons */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            !editor.can().undo() 
              ? "opacity-50 cursor-not-allowed" 
              : isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
          )}
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            !editor.can().redo() 
              ? "opacity-50 cursor-not-allowed" 
              : isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
          )}
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>
      
      {/* Sidebar and editor container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor main content */}
        <div className="flex-1 overflow-hidden">
          <EditorContent editor={editor} className="h-full overflow-auto" />
        </div>
        
        {/* Right sidebar for metadata and AI features */}
        <div className={cn(
          "w-72 border-l overflow-y-auto flex-shrink-0",
          isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
        )}>
          <div className="p-4 space-y-6">
            {/* Category selector */}
            <div>
              <label className={cn(
                "block text-sm font-medium mb-2",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Category
              </label>
              <select
                value={currentNote.category}
                onChange={handleCategoryChange}
                className={cn(
                  "w-full p-2 rounded-lg border",
                  isDark 
                    ? "bg-gray-700 border-gray-600 text-white" 
                    : "bg-white border-gray-300 text-gray-900"
                )}
              >
                <option value="lecture">Lecture</option>
                <option value="assignment">Assignment</option>
                <option value="research">Research</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Tags */}
            <div>
              <label className={cn(
                "block text-sm font-medium mb-2",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentNote.tags.map(tag => (
                  <div
                    key={tag}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                      isDark ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                    )}
                  >
                    <span>{tag}</span>
                    <button onClick={() => handleRemoveTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {!showTagInput && (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                      isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                    )}
                  >
                    <Tag className="h-3 w-3" />
                    <span>Add Tag</span>
                  </button>
                )}
              </div>
              {showTagInput && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="New tag..."
                    className={cn(
                      "flex-1 p-2 text-sm rounded-lg border",
                      isDark 
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    )}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleAddTag();
                      } else if (e.key === 'Escape') {
                        setShowTagInput(false);
                        setNewTag('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      handleAddTag();
                      setShowTagInput(false);
                    }}
                    className={cn(
                      "p-2 rounded-lg",
                      isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                    )}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowTagInput(false);
                      setNewTag('');
                    }}
                    className={cn(
                      "p-2 rounded-lg",
                      isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* AI Enhancements */}
            <div>
              <h3 className={cn(
                "text-sm font-medium mb-3",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                AI Enhancements
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleAIEnhance('summary')}
                  disabled={aiProcessing}
                  className={cn(
                    "w-full p-2 text-sm rounded-lg border flex items-center justify-center gap-2",
                    aiProcessing ? "opacity-50 cursor-not-allowed" : "",
                    isDark 
                      ? "bg-indigo-900/50 border-indigo-700 text-indigo-200 hover:bg-indigo-900" 
                      : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  )}
                >
                  {aiProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle 
                          className="opacity-25" 
                          cx="12" cy="12" r="10" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          fill="none" 
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                        />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Summary</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleAIEnhance('insights')}
                  disabled={aiProcessing}
                  className={cn(
                    "w-full p-2 text-sm rounded-lg border flex items-center justify-center gap-2",
                    aiProcessing ? "opacity-50 cursor-not-allowed" : "",
                    isDark 
                      ? "bg-purple-900/50 border-purple-700 text-purple-200 hover:bg-purple-900" 
                      : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  )}
                >
                  Extract Key Insights
                </button>
                
                <button
                  onClick={() => handleAIEnhance('topics')}
                  disabled={aiProcessing}
                  className={cn(
                    "w-full p-2 text-sm rounded-lg border flex items-center justify-center gap-2",
                    aiProcessing ? "opacity-50 cursor-not-allowed" : "",
                    isDark 
                      ? "bg-teal-900/50 border-teal-700 text-teal-200 hover:bg-teal-900" 
                      : "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100"
                  )}
                >
                  Identify Topics
                </button>
              </div>
            </div>
            
            {/* AI Results */}
            {(currentNote.aiSummary || currentNote.aiKeyInsights || currentNote.aiTopics) && (
              <div className={cn(
                "p-3 rounded-lg border",
                isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
              )}>
                <h3 className={cn(
                  "text-sm font-medium mb-2",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  AI Analysis Results
                </h3>
                
                {currentNote.aiSummary && (
                  <div className="mb-3">
                    <h4 className={cn(
                      "text-xs font-medium mb-1",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>
                      Summary
                    </h4>
                    <p className={cn(
                      "text-xs",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      {currentNote.aiSummary}
                    </p>
                  </div>
                )}
                
                {currentNote.aiKeyInsights && currentNote.aiKeyInsights.length > 0 && (
                  <div className="mb-3">
                    <h4 className={cn(
                      "text-xs font-medium mb-1",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>
                      Key Insights
                    </h4>
                    <ul className={cn(
                      "text-xs list-disc ml-4",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      {currentNote.aiKeyInsights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {currentNote.aiTopics && currentNote.aiTopics.length > 0 && (
                  <div>
                    <h4 className={cn(
                      "text-xs font-medium mb-1",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>
                      Topics
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {currentNote.aiTopics.map((topic, index) => (
                        <span
                          key={index}
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs",
                            isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                          )}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Note actions */}
            <div className="pt-4 border-t space-y-2">
              <button
                onClick={handleTogglePin}
                className={cn(
                  "w-full p-2 text-sm rounded-lg border flex items-center justify-center gap-2",
                  currentNote.isPinned ? (
                    isDark 
                      ? "bg-amber-900/50 border-amber-700 text-amber-200" 
                      : "bg-amber-50 border-amber-200 text-amber-700"
                  ) : (
                    isDark 
                      ? "bg-gray-700 border-gray-600 text-gray-300" 
                      : "bg-gray-100 border-gray-200 text-gray-700"
                  )
                )}
              >
                {currentNote.isPinned ? 'Unpin Note' : 'Pin Note'}
              </button>
              
              <button
                className={cn(
                  "w-full p-2 text-sm rounded-lg border flex items-center justify-center gap-2",
                  isDark 
                    ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600" 
                    : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                )}
              >
                <Share className="h-4 w-4" />
                <span>Share Note</span>
              </button>
              
              <button
                className={cn(
                  "w-full p-2 text-sm rounded-lg border flex items-center justify-center gap-2",
                  isDark 
                    ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600" 
                    : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                )}
              >
                <Download className="h-4 w-4" />
                <span>Export Note</span>
              </button>
              
              <button
                className={cn(
                  "w-full p-2 text-sm rounded-lg border flex items-center justify-center gap-2",
                  isDark 
                    ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600" 
                    : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                )}
              >
                <Clock className="h-4 w-4" />
                <span>Version History</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={cn(
            "w-full max-w-md rounded-lg shadow-xl",
            isDark ? "bg-gray-900" : "bg-white"
          )}>
            <div className={cn(
              "flex justify-between items-center px-4 py-3 border-b",
              isDark ? "border-gray-700" : "border-gray-200"
            )}>
              <h3 className="font-medium">Voice to Text</h3>
              <button 
                onClick={() => setShowVoiceRecorder(false)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <VoiceRecorder
                onTranscriptionComplete={handleTranscriptionComplete}
                onCancel={() => setShowVoiceRecorder(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 