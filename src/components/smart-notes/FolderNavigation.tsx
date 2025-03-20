'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SmartNote } from '@/types/smart-notes';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

// Icons
import {
  Folder, FolderOpen, ChevronRight, ChevronDown, Plus, File, 
  MoreVertical, Edit, Trash, Home
} from 'lucide-react';

interface FolderNavigationProps {
  notes: SmartNote[];
  currentFolder: SmartNote | null;
  rootFolderId?: string | null;
  onNavigate: (folder: SmartNote | null) => void;
  onCreateFolder: (parentId: string | null) => void;
  onRenameFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  className?: string;
}

export function FolderNavigation({
  notes,
  currentFolder,
  rootFolderId = null,
  onNavigate,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  className
}: FolderNavigationProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({});
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  
  // Generate hierarchical folder structure
  const folders = useMemo(() => 
    notes.filter(note => note.isFolder), [notes]);
  
  // Get child folders for a specific parent
  const getChildFolders = (parentId: string | null) => {
    return folders.filter(folder => folder.parentId === parentId);
  };
  
  // Get child notes (non-folders) for a specific parent
  const getChildNotes = (parentId: string | null) => {
    return notes
      .filter(note => !note.isFolder && note.parentId === parentId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };
  
  // Generate breadcrumb navigation
  const breadcrumbs = useMemo(() => {
    const result = [];
    let current = currentFolder;
    
    while (current) {
      result.unshift(current);
      current = notes.find(n => n.id === current?.parentId) || null;
    }
    
    return result;
  }, [currentFolder, notes]);
  
  // Toggle folder expansion
  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  // Show context menu for folder actions
  const showContextMenu = (folderId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      id: folderId,
      x: e.clientX,
      y: e.clientY
    });
  };
  
  // Close the context menu
  const closeContextMenu = () => {
    setContextMenu(null);
  };
  
  // Recursively render folder structure
  const renderFolderTree = (parentId: string | null, depth = 0) => {
    const childFolders = getChildFolders(parentId);
    const childNotes = getChildNotes(parentId);
    
    return (
      <>
        {childFolders.map(folder => (
          <div key={folder.id} style={{ paddingLeft: `${depth * 12}px` }}>
            <div 
              className={cn(
                "flex items-center py-1 px-2 rounded-md my-0.5 cursor-pointer group",
                currentFolder?.id === folder.id 
                  ? isDark ? "bg-blue-900/30 text-blue-200" : "bg-blue-100 text-blue-800" 
                  : isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-700"
              )}
              onClick={() => onNavigate(folder)}
              onContextMenu={(e) => showContextMenu(folder.id, e)}
            >
              <button 
                className="p-0.5 mr-1"
                onClick={(e) => toggleFolder(folder.id, e)}
              >
                {expandedFolders[folder.id] ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
              
              {expandedFolders[folder.id] ? (
                <FolderOpen className="w-4 h-4 mr-1.5 text-amber-500" />
              ) : (
                <Folder className="w-4 h-4 mr-1.5 text-amber-500" />
              )}
              
              <span className="text-sm truncate flex-1">{folder.title}</span>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateFolder(folder.id);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            {expandedFolders[folder.id] && (
              <div>
                {renderFolderTree(folder.id, depth + 1)}
                
                {/* Display notes within this folder */}
                {childNotes.map(note => (
                  <div 
                    key={note.id}
                    className={cn(
                      "flex items-center py-1 px-2 rounded-md my-0.5 cursor-pointer",
                      isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-700"
                    )}
                    style={{ paddingLeft: `${(depth + 1) * 12 + 16}px` }}
                    onClick={() => onNavigate(note)}
                  >
                    <File className="w-4 h-4 mr-1.5 opacity-60" />
                    <span className="text-sm truncate">{note.title || 'Untitled Note'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Display notes at the current level (if not showing child folders) */}
        {depth === 0 && childFolders.length === 0 && childNotes.map(note => (
          <div 
            key={note.id}
            className={cn(
              "flex items-center py-1 px-2 rounded-md my-0.5 cursor-pointer",
              isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-700"
            )}
            style={{ paddingLeft: '16px' }}
            onClick={() => onNavigate(note)}
          >
            <File className="w-4 h-4 mr-1.5 opacity-60" />
            <span className="text-sm truncate">{note.title || 'Untitled Note'}</span>
          </div>
        ))}
      </>
    );
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Breadcrumb navigation */}
      <div className={cn(
        "flex items-center text-sm px-3 py-2 overflow-x-auto border-b",
        isDark ? "border-gray-800" : "border-gray-200"
      )}>
        <button 
          className={cn(
            "flex items-center p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800",
            currentFolder === null ? "text-blue-500 font-medium" : ""
          )}
          onClick={() => onNavigate(null)}
        >
          <Home className="w-3.5 h-3.5 mr-1" />
          <span>Home</span>
        </button>
        
        {breadcrumbs.map((folder, index) => (
          <div key={folder.id} className="flex items-center">
            <ChevronRight className="w-3.5 h-3.5 mx-1 text-gray-400" />
            <button
              className={cn(
                "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800",
                index === breadcrumbs.length - 1 ? "text-blue-500 font-medium" : ""
              )}
              onClick={() => onNavigate(folder)}
            >
              {folder.title}
            </button>
          </div>
        ))}
      </div>
      
      {/* Folder tree */}
      <div className={cn(
        "flex-1 overflow-y-auto p-1",
        isDark ? "bg-gray-900" : "bg-white"
      )}>
        <div className="mb-2 px-2">
          <button
            className={cn(
              "w-full py-1.5 px-2 rounded-md text-sm flex items-center justify-center",
              isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            )}
            onClick={() => onCreateFolder(currentFolder?.id || null)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>New Folder</span>
          </button>
        </div>
        
        {/* Root level folders and notes */}
        <div className="mt-1">
          {renderFolderTree(rootFolderId)}
        </div>
      </div>
      
      {/* Context menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
          />
          <div
            className={cn(
              "fixed z-50 rounded-md shadow-md py-1",
              isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
            )}
            style={{
              top: contextMenu.y,
              left: contextMenu.x
            }}
          >
            <button
              className={cn(
                "flex items-center w-full px-3 py-1.5 text-sm",
                isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
              )}
              onClick={() => {
                onRenameFolder(contextMenu.id);
                closeContextMenu();
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              <span>Rename</span>
            </button>
            <button
              className={cn(
                "flex items-center w-full px-3 py-1.5 text-sm",
                isDark ? "hover:bg-gray-700 text-red-400" : "hover:bg-gray-100 text-red-600"
              )}
              onClick={() => {
                onDeleteFolder(contextMenu.id);
                closeContextMenu();
              }}
            >
              <Trash className="w-4 h-4 mr-2" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
} 