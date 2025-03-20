'use client';

import { useMemo } from 'react';
import { SmartNote } from '@/types/smart-notes';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

// Icons
import { Link, ExternalLink } from 'lucide-react';

interface BacklinksPanelProps {
  currentNote: SmartNote;
  allNotes: SmartNote[];
  onNavigateToNote: (noteId: string) => void;
  className?: string;
}

// Helper function to extract internal links from content
export function parseInternalLinks(content: string): string[] {
  const linkRegex = /\[\[(.*?)\]\]/g;
  const matches = content.match(linkRegex) || [];
  
  return matches.map(match => match.slice(2, -2));
}

export function BacklinksPanel({
  currentNote,
  allNotes,
  onNavigateToNote,
  className
}: BacklinksPanelProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // Find all notes that link to the current note
  const backlinks = useMemo(() => {
    return allNotes.filter(note => {
      // Skip the current note
      if (note.id === currentNote.id) return false;
      
      const linkedTitles = parseInternalLinks(note.content);
      return linkedTitles.some(
        title => title.toLowerCase() === currentNote.title.toLowerCase()
      );
    });
  }, [currentNote, allNotes]);
  
  // Extract outgoing references from the current note
  const outgoingReferences = useMemo(() => {
    const linkedTitles = parseInternalLinks(currentNote.content);
    return linkedTitles.map(title => {
      const matchingNote = allNotes.find(
        note => note.title.toLowerCase() === title.toLowerCase()
      );
      return { title, noteId: matchingNote?.id };
    });
  }, [currentNote, allNotes]);
  
  // Get contexts where the current note is mentioned
  const getBacklinkContext = (content: string, noteTitle: string) => {
    const regex = new RegExp(`\\[\\[${noteTitle}\\]\\]`, 'i');
    const match = content.match(regex);
    if (!match) return '';
    
    const matchIndex = match.index || 0;
    const startIndex = Math.max(0, matchIndex - 50);
    const endIndex = Math.min(content.length, matchIndex + 50);
    
    let context = content.substring(startIndex, endIndex);
    if (startIndex > 0) context = '...' + context;
    if (endIndex < content.length) context = context + '...';
    
    // Replace HTML tags with spaces for readability
    context = context.replace(/<[^>]*>/g, ' ');
    
    // Highlight the mention
    return context.replace(
      regex, 
      `<span class="${isDark ? 'text-blue-300' : 'text-blue-600'} font-semibold">[[${noteTitle}]]</span>`
    );
  };
  
  if (backlinks.length === 0 && outgoingReferences.length === 0) {
    return (
      <div className={cn(
        "p-4 text-sm rounded-lg border text-center",
        isDark 
          ? "bg-gray-800/30 border-gray-700 text-gray-400" 
          : "bg-gray-50 border-gray-200 text-gray-500",
        className
      )}>
        <p>No links to or from this note yet.</p>
        <p className="mt-2 text-xs">Create connections by typing [[note title]] in your content.</p>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Backlinks section */}
      {backlinks.length > 0 && (
        <div>
          <h3 className={cn(
            "text-sm font-medium mb-2 flex items-center",
            isDark ? "text-gray-300" : "text-gray-700"
          )}>
            <Link className="w-4 h-4 mr-1.5" />
            Referenced in {backlinks.length} note{backlinks.length !== 1 ? 's' : ''}
          </h3>
          
          <div className={cn(
            "space-y-2 text-sm rounded-lg border p-2",
            isDark ? "bg-gray-800/30 border-gray-700" : "bg-gray-50 border-gray-200"
          )}>
            {backlinks.map(note => (
              <div key={note.id} className="p-2 rounded-md hover:bg-gray-700/20">
                <button
                  className={cn(
                    "font-medium text-left",
                    isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                  )}
                  onClick={() => onNavigateToNote(note.id)}
                >
                  {note.title || 'Untitled Note'}
                </button>
                
                <div 
                  className={cn(
                    "mt-1 text-xs",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                  dangerouslySetInnerHTML={{ 
                    __html: getBacklinkContext(note.content, currentNote.title)
                  }}
                />
                
                <div className="mt-1 text-xs text-gray-500">
                  {new Date(note.updatedAt).toLocaleDateString()} · {note.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Outgoing links section */}
      {outgoingReferences.length > 0 && (
        <div>
          <h3 className={cn(
            "text-sm font-medium mb-2 flex items-center",
            isDark ? "text-gray-300" : "text-gray-700"
          )}>
            <ExternalLink className="w-4 h-4 mr-1.5" />
            Links to {outgoingReferences.length} note{outgoingReferences.length !== 1 ? 's' : ''}
          </h3>
          
          <div className={cn(
            "space-y-1 text-sm rounded-lg border p-2",
            isDark ? "bg-gray-800/30 border-gray-700" : "bg-gray-50 border-gray-200"
          )}>
            {outgoingReferences.map((ref, index) => (
              <div key={index} className="flex items-center py-1">
                {ref.noteId ? (
                  <button
                    className={cn(
                      "text-left",
                      isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                    )}
                    onClick={() => onNavigateToNote(ref.noteId!)}
                  >
                    {ref.title}
                  </button>
                ) : (
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                    {ref.title} (not created yet)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 