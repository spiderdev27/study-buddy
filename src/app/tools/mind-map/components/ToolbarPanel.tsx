'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/theme-selector';

// Interface for the ToolbarPanel props
interface ToolbarPanelProps {
  onLayout: (layout: string) => void;
  onColorChange: (color: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onAddNode: () => void;
  onToggleAutoLayout: () => void;
  isAutoLayoutEnabled: boolean;
  currentZoom: number;
  currentLayout: string;
  currentColor: string;
}

const ToolbarPanel: React.FC<ToolbarPanelProps> = ({
  onLayout,
  onColorChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onAddNode,
  onToggleAutoLayout,
  isAutoLayoutEnabled,
  currentZoom,
  currentLayout,
  currentColor
}) => {
  const { colors, setTheme } = useTheme();
  
  // Layout options
  const layouts = [
    { id: 'hierarchical', label: 'Hierarchical', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v18M5 7h14M6 12h12M7 17h10"/>
      </svg>
    )},
    { id: 'radial', label: 'Radial', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="2" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    )},
    { id: 'force', label: 'Force', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="8" cy="8" r="3"/>
        <circle cx="16" cy="16" r="3"/>
        <circle cx="16" cy="8" r="3"/>
        <circle cx="8" cy="16" r="3"/>
        <line x1="8" y1="8" x2="16" y2="8"/>
        <line x1="8" y1="16" x2="16" y2="16"/>
        <line x1="8" y1="8" x2="8" y2="16"/>
        <line x1="16" y1="8" x2="16" y2="16"/>
      </svg>
    )}
  ];

  // Color options
  const colorOptions = [
    { id: 'blue', color: colors.blue },
    { id: 'purple', color: colors.purple },
    { id: 'pink', color: colors.pink },
    { id: 'orange', color: colors.orange },
    { id: 'green', color: colors.green },
    { id: 'teal', color: colors.teal }
  ];

  return (
    <div className="toolbar-panel">
      {/* Main toolbar container */}
      <motion.div 
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-bg-card backdrop-blur-md rounded-xl p-2 shadow-lg border border-white/10 z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div className="flex items-center space-x-4 px-2">
          {/* Add Node Button */}
          <button 
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text focus:outline-none"
            onClick={onAddNode}
            title="Add new node"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </button>
          
          {/* Divider */}
          <div className="h-8 w-px bg-white/10"></div>
          
          {/* Layout options */}
          <div className="flex items-center space-x-1">
            {layouts.map(layout => (
              <button
                key={layout.id}
                className={`p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none ${
                  currentLayout === layout.id ? 'bg-white/20 text-text' : 'text-text-secondary'
                }`}
                onClick={() => onLayout(layout.id)}
                title={`${layout.label} layout`}
              >
                {layout.icon}
              </button>
            ))}
          </div>
          
          {/* Auto-layout toggle */}
          <button
            className={`p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none ${
              isAutoLayoutEnabled ? 'bg-white/20 text-text' : 'text-text-secondary'
            }`}
            onClick={onToggleAutoLayout}
            title="Toggle auto-layout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <path d="M9 3v18M15 3v18M3 9h18M3 15h18"></path>
            </svg>
          </button>
          
          {/* Divider */}
          <div className="h-8 w-px bg-white/10"></div>
          
          {/* Zoom controls */}
          <div className="flex items-center space-x-1">
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text focus:outline-none"
              onClick={onZoomOut}
              title="Zoom out"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </button>
            
            <div className="text-xs text-text-secondary min-w-[36px] text-center">
              {Math.round(currentZoom * 100)}%
            </div>
            
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text focus:outline-none"
              onClick={onZoomIn}
              title="Zoom in"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </button>
            
            <button
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text focus:outline-none"
              onClick={onZoomReset}
              title="Reset zoom"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="12" y1="4" x2="12" y2="20"></line>
              </svg>
            </button>
          </div>
          
          {/* Divider */}
          <div className="h-8 w-px bg-white/10"></div>
          
          {/* Color options */}
          <div className="flex items-center space-x-1">
            {colorOptions.map(option => (
              <button
                key={option.id}
                className={`w-5 h-5 rounded-full border-2 transition-colors focus:outline-none ${
                  currentColor === option.id ? 'border-white/70' : 'border-transparent'
                }`}
                style={{ backgroundColor: option.color }}
                onClick={() => onColorChange(option.id)}
                title={`${option.id} color`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ToolbarPanel; 