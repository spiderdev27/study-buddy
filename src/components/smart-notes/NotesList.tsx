'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartNote, NoteCategory, NoteFilter } from '@/types/smart-notes';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

// Icons
import {
  Search, Filter, SortAsc, SortDesc, Tag, Pin,
  Edit, Trash, Plus, CheckSquare, Archive, BarChart3,
  Calendar, Clock, FileText, AlertCircle, Book, Briefcase, Clipboard, User, HelpCircle
} from 'lucide-react';

interface NotesListProps {
  notes: SmartNote[];
  onNoteSelect: (note: SmartNote) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
}

export function NotesList({ 
  notes, 
  onNoteSelect, 
  onCreateNote,
  onDeleteNote 
}: NotesListProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<NoteFilter>({
    categories: [],
    tags: [],
    pinned: false,
    archived: false,
  });
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Get all unique tags and categories from notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [notes]);
  
  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (filter.categories.length > 0) {
      result = result.filter(note => filter.categories.includes(note.category));
    }
    
    // Apply tag filter
    if (filter.tags.length > 0) {
      result = result.filter(note => 
        filter.tags.some(tag => note.tags.includes(tag))
      );
    }
    
    // Apply pinned filter
    if (filter.pinned) {
      result = result.filter(note => note.isPinned);
    }
    
    // Apply archived filter
    if (filter.archived) {
      result = result.filter(note => note.isArchived);
    } else {
      // If not explicitly showing archived, filter them out
      result = result.filter(note => !note.isArchived);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === 'title') {
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        valueA = new Date(a[sortBy]).getTime();
        valueB = new Date(b[sortBy]).getTime();
        return sortDirection === 'asc' 
          ? valueA - valueB 
          : valueB - valueA;
      }
    });
    
    // Always show pinned notes first unless sorting by title
    if (sortBy !== 'title') {
      result = [
        ...result.filter(note => note.isPinned),
        ...result.filter(note => !note.isPinned)
      ];
    }
    
    return result;
  }, [notes, searchQuery, filter, sortBy, sortDirection]);
  
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  // Toggle category filter
  const toggleCategoryFilter = (category: NoteCategory) => {
    setFilter(prev => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };
  
  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setFilter(prev => {
      const tags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags };
    });
  };
  
  // Get category icon
  const getCategoryIcon = (category: NoteCategory) => {
    switch (category) {
      case 'lecture':
        return <Book className="h-4 w-4" />;
      case 'assignment':
        return <CheckSquare className="h-4 w-4" />;
      case 'research':
        return <BarChart3 className="h-4 w-4" />;
      case 'exam':
        return <AlertCircle className="h-4 w-4" />;
      case 'project':
        return <Briefcase className="h-4 w-4" />;
      case 'personal':
        return <User className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with search and filter options */}
      <div className={cn(
        "p-4 flex flex-col gap-4 border-b sticky top-0 z-10",
        isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      )}>
        {/* Search bar */}
        <div className="relative">
          <div className={cn(
            "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none",
            isDark ? "text-gray-400" : "text-gray-500"
          )}>
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, content, or tags..."
            className={cn(
              "w-full p-2.5 pl-10 text-sm rounded-lg border",
              isDark
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            )}
          />
        </div>
        
        {/* Filter and sort controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={cn(
                "p-2 rounded-lg flex items-center gap-1 transition-colors",
                showFilterPanel ? (
                  isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"
                ) : (
                  isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                )
              )}
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">Filter</span>
            </button>
            
            <div className="h-6 border-l border-gray-300 dark:border-gray-700" />
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSortBy('updatedAt')}
                className={cn(
                  "p-2 rounded-lg flex items-center gap-1 transition-colors text-sm",
                  sortBy === 'updatedAt' ? (
                    isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"
                  ) : (
                    isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  )
                )}
              >
                <Clock className="h-4 w-4" />
                <span>Updated</span>
              </button>
              
              <button
                onClick={() => setSortBy('createdAt')}
                className={cn(
                  "p-2 rounded-lg flex items-center gap-1 transition-colors text-sm",
                  sortBy === 'createdAt' ? (
                    isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"
                  ) : (
                    isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  )
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>Created</span>
              </button>
              
              <button
                onClick={() => setSortBy('title')}
                className={cn(
                  "p-2 rounded-lg flex items-center gap-1 transition-colors text-sm",
                  sortBy === 'title' ? (
                    isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"
                  ) : (
                    isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  )
                )}
              >
                <FileText className="h-4 w-4" />
                <span>Title</span>
              </button>
            </div>
          </div>
          
          <button
            onClick={toggleSortDirection}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            )}
          >
            {sortDirection === 'asc' ? (
              <SortAsc className="h-5 w-5" />
            ) : (
              <SortDesc className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {/* Filter panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "p-3 rounded-lg border space-y-4",
                isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
              )}>
                {/* Categories */}
                <div>
                  <h3 className={cn(
                    "text-sm font-medium mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(['lecture', 'assignment', 'research', 'exam', 'project', 'personal', 'other'] as NoteCategory[]).map(category => (
                      <button
                        key={category}
                        onClick={() => toggleCategoryFilter(category)}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs capitalize transition-colors",
                          filter.categories.includes(category) ? (
                            isDark ? "bg-blue-900 text-blue-100" : "bg-blue-100 text-blue-800"
                          ) : (
                            isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          )
                        )}
                      >
                        {getCategoryIcon(category)}
                        <span>{category}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Tags */}
                {allTags.length > 0 && (
                  <div>
                    <h3 className={cn(
                      "text-sm font-medium mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}>
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTagFilter(tag)}
                          className={cn(
                            "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors",
                            filter.tags.includes(tag) ? (
                              isDark ? "bg-indigo-900 text-indigo-100" : "bg-indigo-100 text-indigo-800"
                            ) : (
                              isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            )
                          )}
                        >
                          <Tag className="h-3 w-3" />
                          <span>{tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Other filters */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter(prev => ({ ...prev, pinned: !prev.pinned }))}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors",
                      filter.pinned ? (
                        isDark ? "bg-amber-900 text-amber-100" : "bg-amber-100 text-amber-800"
                      ) : (
                        isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      )
                    )}
                  >
                    <Pin className="h-3 w-3" />
                    <span>Pinned</span>
                  </button>
                  
                  <button
                    onClick={() => setFilter(prev => ({ ...prev, archived: !prev.archived }))}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors",
                      filter.archived ? (
                        isDark ? "bg-purple-900 text-purple-100" : "bg-purple-100 text-purple-800"
                      ) : (
                        isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      )
                    )}
                  >
                    <Archive className="h-3 w-3" />
                    <span>Archived</span>
                  </button>
                </div>
                
                {/* Reset filters */}
                {(filter.categories.length > 0 || filter.tags.length > 0 || filter.pinned || filter.archived) && (
                  <button
                    onClick={() => setFilter({ categories: [], tags: [], pinned: false, archived: false })}
                    className={cn(
                      "text-xs underline",
                      isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800"
                    )}
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Notes grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredNotes.length === 0 ? (
          <div className={cn(
            "flex flex-col items-center justify-center h-full text-center p-8",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2">No notes found</h3>
            <p className="mb-6 max-w-md">
              {searchQuery || filter.categories.length > 0 || filter.tags.length > 0 || filter.pinned || filter.archived
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by creating your first note."}
            </p>
            <button
              onClick={onCreateNote}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                isDark 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              )}
            >
              <Plus className="h-5 w-5" />
              <span>Create New Note</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Create new note card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "h-64 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors p-6",
                isDark 
                  ? "border-gray-700 hover:border-blue-500 bg-gray-800/50 hover:bg-gray-800" 
                  : "border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-gray-100"
              )}
              onClick={onCreateNote}
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                isDark ? "bg-gray-700" : "bg-gray-200"
              )}>
                <Plus className={cn("h-8 w-8", isDark ? "text-gray-300" : "text-gray-600")} />
              </div>
              <h3 className={cn(
                "text-lg font-medium mb-2 text-center",
                isDark ? "text-gray-200" : "text-gray-800"
              )}>
                Create New Note
              </h3>
              <p className={cn(
                "text-sm text-center",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                Capture your ideas, insights, and knowledge
              </p>
            </motion.div>
            
            {/* Note cards */}
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "h-64 rounded-lg border overflow-hidden flex flex-col relative group",
                  isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                )}
              >
                {/* Card header */}
                <div className={cn(
                  "px-4 pt-4 pb-2 flex justify-between items-start",
                  note.color ? `bg-${note.color}-500/10` : ''
                )}>
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "p-1.5 rounded",
                      isDark ? "bg-gray-700" : "bg-gray-100"
                    )}>
                      {getCategoryIcon(note.category)}
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-medium line-clamp-1 text-base",
                        isDark ? "text-white" : "text-gray-800"
                      )}>
                        {note.title || 'Untitled Note'}
                      </h3>
                      <p className={cn(
                        "text-xs",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {note.isPinned && (
                    <Pin className={cn(
                      "h-4 w-4",
                      isDark ? "text-amber-400" : "text-amber-500"
                    )} />
                  )}
                </div>
                
                {/* Card content */}
                <div 
                  className="flex-1 p-4 overflow-hidden cursor-pointer"
                  onClick={() => onNoteSelect(note)}
                >
                  <div 
                    className={cn(
                      "line-clamp-5 text-sm",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                    // Use a safer approach for rendering HTML content
                    dangerouslySetInnerHTML={{ 
                      __html: note.content
                        .replace(/<[^>]*>/g, ' ') // Strip HTML tags
                        .substring(0, 250) + '...' 
                    }}
                  />
                </div>
                
                {/* Card footer */}
                <div className={cn(
                  "px-4 py-2 flex justify-between items-center border-t",
                  isDark ? "border-gray-700" : "border-gray-200"
                )}>
                  {/* Tags */}
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    {note.tags.slice(0, 2).map((tag) => (
                      <span 
                        key={tag}
                        className={cn(
                          "px-1.5 py-0.5 rounded-full text-xs whitespace-nowrap",
                          isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className={cn(
                        "text-xs",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}>
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onNoteSelect(note)}
                      className={cn(
                        "p-1.5 rounded-full transition-colors",
                        isDark ? "hover:bg-gray-700 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-500 hover:text-gray-800"
                      )}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      className={cn(
                        "p-1.5 rounded-full transition-colors",
                        isDark ? "hover:bg-gray-700 text-gray-400 hover:text-red-400" : "hover:bg-gray-200 text-gray-500 hover:text-red-500"
                      )}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}