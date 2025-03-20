'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/theme-selector';

// Node type definition
interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  type: 'main' | 'sub' | 'leaf';
  aiGenerated?: boolean;
}

// Link type definition
interface Link {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// Props for MindMapNode component
interface MindMapNodeProps {
  node: Node;
  isActive: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onTextUpdate: (nodeId: string, text: string) => void;
  onDelete: (nodeId: string) => void;
  onMove: (nodeId: string, newX: number, newY: number) => void;
  onGenerateWithAI: () => void;
  viewMode: 'edit' | 'present';
}

// Props for MindMapLink component
interface MindMapLinkProps {
  link: Link;
  nodes: Node[];
}

// MindMapNode component
const MindMapNode: React.FC<MindMapNodeProps> = ({
  node,
  isActive,
  onClick,
  onDoubleClick,
  onTextUpdate,
  onDelete,
  onMove,
  onGenerateWithAI,
  viewMode
}) => {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(node.text);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: node.x, y: node.y });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Update position when node position changes
  useEffect(() => {
    setPosition({ x: node.x, y: node.y });
  }, [node.x, node.y]);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  const handleDragStart = () => {
    if (viewMode === 'present') return;
    setIsDragging(true);
  };
  
  const handleDrag = (_e: any, info: { offset: { x: number; y: number } }) => {
    if (viewMode === 'present') return;
    const newX = node.x + info.offset.x;
    const newY = node.y + info.offset.y;
    setPosition({ x: newX, y: newY });
  };
  
  const handleDragEnd = () => {
    if (viewMode === 'present') return;
    setIsDragging(false);
    onMove(node.id, position.x, position.y);
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'present') return;
    
    if (node.type !== 'leaf') {
      onDoubleClick();
    }
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (viewMode === 'present') return;
    setShowContextMenu(!showContextMenu);
  };
  
  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'present') return;
    setIsEditing(true);
  };
  
  const finishEditing = () => {
    setIsEditing(false);
    onTextUpdate(node.id, text);
  };
  
  // Node size based on type
  const getNodeSize = () => {
    switch (node.type) {
      case 'main':
        return 'min-w-[160px] min-h-[60px]';
      case 'sub':
        return 'min-w-[140px] min-h-[50px]';
      case 'leaf':
        return 'min-w-[120px] min-h-[40px]';
    }
  };
  
  // Node background style based on type
  const getNodeStyle = () => {
    const { colorMode } = useTheme();
    const isDarkMode = colorMode === 'dark';
    
    if (node.aiGenerated) {
      return `relative border-2 border-dashed border-${node.color} bg-${node.color}/30 backdrop-blur-sm`;
    }
    
    switch (node.type) {
      case 'main':
        return `relative bg-gradient-to-r from-${node.color} to-${node.color}/90 ${isDarkMode ? '' : 'border-2 border-gray-400 shadow-lg'}`;
      case 'sub':
        return `relative bg-${node.color} ${isDarkMode ? 'bg-opacity-90' : 'bg-opacity-90'} ${isDarkMode ? '' : 'border border-gray-400 shadow-md'}`;
      case 'leaf':
        return `relative bg-${node.color} ${isDarkMode ? 'bg-opacity-70' : 'bg-opacity-85'} ${isDarkMode ? '' : 'border border-gray-400 shadow-sm'}`;
    }
  };
  
  // Text color based on type
  const getTextColor = () => {
    // If node is AI generated, use a specific styling
    if (node.aiGenerated) {
      return 'text-white dark:text-white';
    }
    
    // Based on node type and color, determine text color
    // For gradient backgrounds and colored nodes, white text works well
    // For light mode, we need to ensure contrast
    if (node.type === 'main') {
      return 'text-white dark:text-white'; // Main nodes have gradient background, white text works well
    }
    
    // For sub and leaf nodes in light mode, we want to ensure readability
    return 'text-white dark:text-white text-shadow'; // Adding shadow helps with visibility
  };
  
  // Font size based on type
  const getFontSize = () => {
    switch (node.type) {
      case 'main':
        return 'text-sm font-medium';
      case 'sub':
        return 'text-xs font-medium';
      case 'leaf':
        return 'text-xs';
    }
  };
  
  // Node animation variants for hover effects
  const nodeVariants = {
    idle: { 
      scale: 1,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)' 
    },
    hover: { 
      scale: 1.05,
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.25)' 
    },
    active: { 
      scale: 1.05,
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.3), 0 10px 15px rgba(0, 0, 0, 0.25)'
    },
    dragging: { 
      scale: 1.1,
      boxShadow: '0 15px 20px rgba(0, 0, 0, 0.3)'
    }
  };
  
  // Get current variant based on node state
  const getCurrentVariant = () => {
    if (isDragging) return 'dragging';
    if (isActive) return 'active';
    return 'idle';
  };
  
  return (
    <motion.div
      ref={nodeRef}
      className={`node absolute ${getNodeSize()} px-3 py-2 rounded-lg cursor-pointer select-none ${getNodeStyle()} ${isActive ? 'z-10' : 'z-0'}`}
      style={{
        left: position.x - (nodeRef.current?.offsetWidth || 0) / 2,
        top: position.y - (nodeRef.current?.offsetHeight || 0) / 2,
        filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.25))',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      drag={viewMode === 'edit'}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      variants={nodeVariants}
      initial="idle"
      animate={getCurrentVariant()}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      whileHover={viewMode === 'edit' ? 'hover' : 'idle'}
    >
      {/* AI-generated indicator */}
      {node.aiGenerated && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" />
          </svg>
        </div>
      )}
      
      {/* Node content */}
      <div className={`flex items-center justify-center h-full ${getTextColor()} ${getFontSize()}`}>
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={finishEditing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finishEditing();
              }
            }}
            className="w-full h-full bg-transparent resize-none focus:outline-none text-center"
            autoFocus
          />
        ) : (
          <div 
            className="w-full text-center break-words"
            onClick={startEditing}
          >
            {node.text}
          </div>
        )}
      </div>
      
      {/* Context menu */}
      {showContextMenu && viewMode === 'edit' && (
        <motion.div 
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-bg-card backdrop-blur-xl rounded-lg border border-white/10 shadow-lg overflow-hidden z-50"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="flex flex-col divide-y divide-white/5">
            <button
              className="px-4 py-2 text-xs hover:bg-white/10 transition-colors flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onDoubleClick();
                setShowContextMenu(false);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5V19M5 12H19" />
              </svg>
              Add Child
            </button>
            
            <button
              className="px-4 py-2 text-xs hover:bg-white/10 transition-colors flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                startEditing(e);
                setShowContextMenu(false);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
            
            <button
              className="px-4 py-2 text-xs hover:bg-white/10 transition-colors flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onGenerateWithAI();
                setShowContextMenu(false);
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                <polyline points="7.5 19.79 7.5 14.6 3 12" />
                <polyline points="21 12 16.5 14.6 16.5 19.79" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              Generate with AI
            </button>
            
            {node.id !== 'root' && (
              <button
                className="px-4 py-2 text-xs text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                  setShowContextMenu(false);
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// MindMapLink component
const MindMapLink: React.FC<MindMapLinkProps> = ({ link, nodes }) => {
  const { colors } = useTheme();
  
  // Find source and target nodes
  const sourceNode = nodes.find(node => node.id === link.source);
  const targetNode = nodes.find(node => node.id === link.target);
  
  // If either node doesn't exist, don't render the link
  if (!sourceNode || !targetNode) return null;
  
  // Calculate path for the link
  const start = { x: sourceNode.x, y: sourceNode.y };
  const end = { x: targetNode.x, y: targetNode.y };
  
  // Calculate curve control point
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Curved path
  const path = `M ${start.x} ${start.y} 
                C ${start.x + dx / 3} ${start.y + dy / 3},
                  ${start.x + 2 * dx / 3} ${start.y + 2 * dy / 3},
                  ${end.x} ${end.y}`;
  
  // Determine gradient colors based on node types
  const getGradientColors = () => {
    // If link connects to AI-generated node, use dashed style
    if (targetNode.aiGenerated) {
      return {
        start: sourceNode.color,
        end: targetNode.color,
        dashArray: '4,4',
      };
    }
    
    // Default solid line with gradient
    return {
      start: sourceNode.color,
      end: targetNode.color,
      dashArray: 'none',
    };
  };
  
  const { start: startColor, end: endColor, dashArray } = getGradientColors();
  
  return (
    <>
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`gradient-${link.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
      </defs>
      
      {/* Link path */}
      <path
        d={path}
        stroke={`url(#gradient-${link.id})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={dashArray}
        fill="none"
      />
      
      {/* Label for the link (if provided) */}
      {link.label && (
        <text
          x={(start.x + end.x) / 2}
          y={(start.y + end.y) / 2 - 10}
          textAnchor="middle"
          fill="white"
          fontSize="10"
          className="pointer-events-none select-none"
          dy="-5"
        >
          {link.label}
        </text>
      )}
    </>
  );
};

// Export as a module with both components
const MindMapElements = {
  MindMapNode,
  MindMapLink
};

// Add global styles to ensure text shadow for better visibility across themes
const style = document.createElement('style');
style.textContent = `
  .text-shadow {
    text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7);
  }
`;
document.head.appendChild(style);

export default MindMapElements; 