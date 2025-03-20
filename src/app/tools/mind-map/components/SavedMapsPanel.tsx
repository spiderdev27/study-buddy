'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/theme-selector';

// Interface for saved map data
interface SavedMap {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  nodeCount: number;
  thumbnail?: string;
}

// Interface for component props
interface SavedMapsPanelProps {
  onClose: () => void;
  onSelectMap: (mapId: string) => void;
}

const SavedMapsPanel: React.FC<SavedMapsPanelProps> = ({ onClose, onSelectMap }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'recent' | 'shared'>('all');
  
  // Mock data for saved maps
  const savedMaps: SavedMap[] = [
    {
      id: 'map-1',
      title: 'Product Roadmap 2024',
      createdAt: new Date('2023-12-01T10:00:00Z'),
      updatedAt: new Date('2023-12-15T14:30:00Z'),
      nodeCount: 24,
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxMTEiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyMCIgZmlsbD0iIzQ0NCIvPjxsaW5lIHgxPSI1MCIgeTE9IjMwIiB4Mj0iNzAiIHkyPSI0MCIgc3Ryb2tlPSIjNzc3IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iNTAiIHkxPSIzMCIgeDI9IjMwIiB5Mj0iNDAiIHN0cm9rZT0iIzc3NyIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iNzAiIGN5PSI0MCIgcj0iMTAiIGZpbGw9IiM2NjYiLz48Y2lyY2xlIGN4PSIzMCIgY3k9IjQwIiByPSIxMCIgZmlsbD0iIzY2NiIvPjwvc3ZnPg=='
    },
    {
      id: 'map-2',
      title: 'Team Structure',
      createdAt: new Date('2023-11-20T09:15:00Z'),
      updatedAt: new Date('2023-11-20T09:15:00Z'),
      nodeCount: 12
    },
    {
      id: 'map-3',
      title: 'Project Dependencies',
      createdAt: new Date('2023-10-05T16:45:00Z'),
      updatedAt: new Date('2023-12-18T11:20:00Z'),
      nodeCount: 35,
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxMTEiLz48cmVjdCB4PSI0MCIgeT0iNDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzY2NiIvPjxsaW5lIHgxPSI1MCIgeTE9IjIwIiB4Mj0iNTAiIHkyPSI0MCIgc3Ryb2tlPSIjNzc3IiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iNTAiIHkxPSI2MCIgeDI9IjUwIiB5Mj0iODAiIHN0cm9rZT0iIzc3NyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iNDAiIHk9IjEwIiB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIGZpbGw9IiM0NDQiLz48cmVjdCB4PSI0MCIgeT0iODAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzQ0NCIvPjwvc3ZnPg=='
    },
    {
      id: 'map-4',
      title: 'Marketing Campaign Ideas',
      createdAt: new Date('2023-12-19T08:30:00Z'),
      updatedAt: new Date('2023-12-19T08:30:00Z'),
      nodeCount: 8
    },
    {
      id: 'map-5',
      title: 'Personal Goals 2024',
      createdAt: new Date('2023-12-16T21:45:00Z'),
      updatedAt: new Date('2023-12-17T10:15:00Z'),
      nodeCount: 15
    }
  ];
  
  // Filter maps based on search query and filter selection
  const filteredMaps = savedMaps.filter(map => {
    // Apply text search
    if (searchQuery && !map.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply filter
    if (filter === 'recent') {
      // Show maps updated in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return map.updatedAt >= sevenDaysAgo;
    }
    
    // For 'shared' we would normally check if the map has been shared
    // For demo purposes, let's just show maps with even IDs
    if (filter === 'shared') {
      return parseInt(map.id.split('-')[1]) % 2 === 0;
    }
    
    // 'all' filter shows everything
    return true;
  });
  
  // Format date as relative time (e.g., "2 days ago")
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };
  
  // Handle map selection
  const handleSelectMap = (mapId: string) => {
    console.log('Selected map:', mapId);
    onSelectMap(mapId);
    onClose();
  };
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-bg-card w-full max-w-2xl rounded-xl shadow-xl border border-white/10 overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header section */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-medium">My Mind Maps</h2>
          <button 
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text"
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Search and filter section */}
        <div className="p-4 border-b border-white/10 bg-black/20">
          <div className="flex gap-4">
            {/* Search input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="M21 21l-4.35-4.35"></path>
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-sm"
                placeholder="Search mind maps..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter buttons */}
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              <button 
                className={`px-3 py-2 text-xs ${filter === 'all' ? 'bg-white/20 text-white' : 'bg-transparent text-text-secondary hover:bg-white/10'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`px-3 py-2 text-xs ${filter === 'recent' ? 'bg-white/20 text-white' : 'bg-transparent text-text-secondary hover:bg-white/10'}`}
                onClick={() => setFilter('recent')}
              >
                Recent
              </button>
              <button 
                className={`px-3 py-2 text-xs ${filter === 'shared' ? 'bg-white/20 text-white' : 'bg-transparent text-text-secondary hover:bg-white/10'}`}
                onClick={() => setFilter('shared')}
              >
                Shared
              </button>
            </div>
          </div>
        </div>
        
        {/* Maps list section */}
        <div className="p-4 h-[400px] overflow-y-auto">
          {filteredMaps.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 text-text-tertiary">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-50">
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M3 9h18M9 3v18"></path>
              </svg>
              <p className="text-sm">No mind maps found</p>
              <p className="text-xs mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMaps.map(map => (
                <motion.div
                  key={map.id}
                  className="border border-white/10 rounded-lg overflow-hidden bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleSelectMap(map.id)}
                >
                  {/* Thumbnail or placeholder */}
                  <div className="h-32 bg-gray-900 relative overflow-hidden">
                    {map.thumbnail ? (
                      <img 
                        src={map.thumbnail} 
                        alt={map.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-tertiary">
                          <circle cx="12" cy="12" r="8"></circle>
                          <line x1="12" y1="4" x2="12" y2="20"></line>
                          <line x1="4" y1="12" x2="20" y2="12"></line>
                        </svg>
                      </div>
                    )}
                    
                    {/* Hover overlay with open button */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg">
                        Open Map
                      </button>
                    </div>
                  </div>
                  
                  {/* Info section */}
                  <div className="p-3">
                    <h3 className="text-sm font-medium truncate">{map.title}</h3>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-text-tertiary">
                        {map.nodeCount} nodes
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {formatRelativeTime(map.updatedAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer section */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
          <span className="text-xs text-text-tertiary">
            {filteredMaps.length} mind map{filteredMaps.length !== 1 ? 's' : ''} found
          </span>
          <button 
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm rounded-lg transition-colors"
            onClick={onClose}
          >
            New Mind Map
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SavedMapsPanel; 