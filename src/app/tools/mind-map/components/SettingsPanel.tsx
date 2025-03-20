'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/theme-selector';

// Interface for the panel props
interface SettingsPanelProps {
  onClose: () => void;
  onSaveSettings?: (settings: any) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, onSaveSettings }) => {
  const { colors, theme } = useTheme();
  
  // Node appearance settings
  const [nodeSettings, setNodeSettings] = useState({
    nodeSpacing: 80,
    nodeShadows: true,
    nodeAnimations: true,
  });
  
  // Connection settings
  const [connectionSettings, setConnectionSettings] = useState({
    connectionStyle: 'curved', // curved, straight, elbowed
    connectionLabels: true,
    connectionThickness: 2,
  });
  
  // Behavior settings
  const [behaviorSettings, setBehaviorSettings] = useState({
    snapToGrid: false,
    autoLayout: true,
    zoomBehavior: 'smooth', // smooth, stepped
  });
  
  // AI integration settings
  const [aiSettings, setAiSettings] = useState({
    suggestionsOnCreate: true,
    autoExpandWithAI: false,
    suggestionCount: 3,
  });
  
  // Update the settings
  const updateNodeSettings = (key: keyof typeof nodeSettings, value: any) => {
    setNodeSettings({ ...nodeSettings, [key]: value });
  };
  
  const updateConnectionSettings = (key: keyof typeof connectionSettings, value: any) => {
    setConnectionSettings({ ...connectionSettings, [key]: value });
  };
  
  const updateBehaviorSettings = (key: keyof typeof behaviorSettings, value: any) => {
    setBehaviorSettings({ ...behaviorSettings, [key]: value });
  };
  
  const updateAISettings = (key: keyof typeof aiSettings, value: any) => {
    setAiSettings({ ...aiSettings, [key]: value });
  };
  
  // Save the settings
  const handleSave = () => {
    if (onSaveSettings) {
      onSaveSettings({
        nodeSettings,
        connectionSettings,
        behaviorSettings,
        aiSettings,
      });
    }
    onClose();
  };
  
  // Reset to default settings
  const handleReset = () => {
    setNodeSettings({
      nodeSpacing: 80,
      nodeShadows: true,
      nodeAnimations: true,
    });
    
    setConnectionSettings({
      connectionStyle: 'curved',
      connectionLabels: true,
      connectionThickness: 2,
    });
    
    setBehaviorSettings({
      snapToGrid: false,
      autoLayout: true,
      zoomBehavior: 'smooth',
    });
    
    setAiSettings({
      suggestionsOnCreate: true,
      autoExpandWithAI: false,
      suggestionCount: 3,
    });
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
        className="bg-bg-card w-full max-w-xl rounded-xl shadow-xl border border-white/10 overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-medium">Mind Map Settings</h2>
          <button 
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text"
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Settings content - scrollable */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          <div className="space-y-8">
            {/* Node Appearance Settings */}
            <section>
              <h3 className="text-sm font-medium text-text mb-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                Node Appearance
              </h3>
              
              <div className="space-y-4 pl-2">
                {/* Node Spacing */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-text-secondary">Node Spacing</label>
                    <span className="text-xs text-text-tertiary">{nodeSettings.nodeSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="120"
                    step="5"
                    value={nodeSettings.nodeSpacing}
                    onChange={(e) => updateNodeSettings('nodeSpacing', parseInt(e.target.value))}
                    className="w-full accent-primary bg-white/10 h-1 rounded-full appearance-none"
                  />
                </div>
                
                {/* Node Shadows */}
                <div className="flex justify-between items-center">
                  <label className="text-xs text-text-secondary">Node Shadows</label>
                  <button
                    className={`relative inline-flex h-5 w-9 items-center rounded-full ${nodeSettings.nodeShadows ? 'bg-primary' : 'bg-white/20'}`}
                    onClick={() => updateNodeSettings('nodeShadows', !nodeSettings.nodeShadows)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${nodeSettings.nodeShadows ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                
                {/* Node Animations */}
                <div className="flex justify-between items-center">
                  <label className="text-xs text-text-secondary">Node Animations</label>
                  <button
                    className={`relative inline-flex h-5 w-9 items-center rounded-full ${nodeSettings.nodeAnimations ? 'bg-primary' : 'bg-white/20'}`}
                    onClick={() => updateNodeSettings('nodeAnimations', !nodeSettings.nodeAnimations)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${nodeSettings.nodeAnimations ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            </section>
            
            {/* Connection Settings */}
            <section>
              <h3 className="text-sm font-medium text-text mb-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
                </svg>
                Connection Style
              </h3>
              
              <div className="space-y-4 pl-2">
                {/* Connection Style */}
                <div className="space-y-2">
                  <label className="block text-xs text-text-secondary">Connection Type</label>
                  <div className="flex space-x-2">
                    <button
                      className={`px-3 py-1.5 text-xs rounded-lg ${connectionSettings.connectionStyle === 'curved' ? 'bg-primary text-white' : 'bg-white/10 text-text-secondary'}`}
                      onClick={() => updateConnectionSettings('connectionStyle', 'curved')}
                    >
                      Curved
                    </button>
                    <button
                      className={`px-3 py-1.5 text-xs rounded-lg ${connectionSettings.connectionStyle === 'straight' ? 'bg-primary text-white' : 'bg-white/10 text-text-secondary'}`}
                      onClick={() => updateConnectionSettings('connectionStyle', 'straight')}
                    >
                      Straight
                    </button>
                    <button
                      className={`px-3 py-1.5 text-xs rounded-lg ${connectionSettings.connectionStyle === 'elbowed' ? 'bg-primary text-white' : 'bg-white/10 text-text-secondary'}`}
                      onClick={() => updateConnectionSettings('connectionStyle', 'elbowed')}
                    >
                      Elbowed
                    </button>
                  </div>
                </div>
                
                {/* Connection Labels */}
                <div className="flex justify-between items-center">
                  <label className="text-xs text-text-secondary">Connection Labels</label>
                  <button
                    className={`relative inline-flex h-5 w-9 items-center rounded-full ${connectionSettings.connectionLabels ? 'bg-primary' : 'bg-white/20'}`}
                    onClick={() => updateConnectionSettings('connectionLabels', !connectionSettings.connectionLabels)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${connectionSettings.connectionLabels ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                
                {/* Connection Thickness */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-text-secondary">Connection Thickness</label>
                    <span className="text-xs text-text-tertiary">{connectionSettings.connectionThickness}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.5"
                    value={connectionSettings.connectionThickness}
                    onChange={(e) => updateConnectionSettings('connectionThickness', parseFloat(e.target.value))}
                    className="w-full accent-primary bg-white/10 h-1 rounded-full appearance-none"
                  />
                </div>
              </div>
            </section>
            
            {/* Behavior Settings */}
            <section>
              <h3 className="text-sm font-medium text-text mb-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Behavior Settings
              </h3>
              
              <div className="space-y-4 pl-2">
                {/* Snap to Grid */}
                <div className="flex justify-between items-center">
                  <label className="text-xs text-text-secondary">Snap to Grid</label>
                  <button
                    className={`relative inline-flex h-5 w-9 items-center rounded-full ${behaviorSettings.snapToGrid ? 'bg-primary' : 'bg-white/20'}`}
                    onClick={() => updateBehaviorSettings('snapToGrid', !behaviorSettings.snapToGrid)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${behaviorSettings.snapToGrid ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                
                {/* Auto Layout */}
                <div className="flex justify-between items-center">
                  <label className="text-xs text-text-secondary">Auto Layout</label>
                  <button
                    className={`relative inline-flex h-5 w-9 items-center rounded-full ${behaviorSettings.autoLayout ? 'bg-primary' : 'bg-white/20'}`}
                    onClick={() => updateBehaviorSettings('autoLayout', !behaviorSettings.autoLayout)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${behaviorSettings.autoLayout ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                
                {/* Zoom Behavior */}
                <div className="space-y-2">
                  <label className="block text-xs text-text-secondary">Zoom Behavior</label>
                  <div className="flex space-x-2">
                    <button
                      className={`px-3 py-1.5 text-xs rounded-lg ${behaviorSettings.zoomBehavior === 'smooth' ? 'bg-primary text-white' : 'bg-white/10 text-text-secondary'}`}
                      onClick={() => updateBehaviorSettings('zoomBehavior', 'smooth')}
                    >
                      Smooth
                    </button>
                    <button
                      className={`px-3 py-1.5 text-xs rounded-lg ${behaviorSettings.zoomBehavior === 'stepped' ? 'bg-primary text-white' : 'bg-white/10 text-text-secondary'}`}
                      onClick={() => updateBehaviorSettings('zoomBehavior', 'stepped')}
                    >
                      Stepped
                    </button>
                  </div>
                </div>
              </div>
            </section>
            
            {/* AI Integration Settings */}
            <section>
              <h3 className="text-sm font-medium text-text mb-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                </svg>
                AI Integration
              </h3>
              
              <div className="space-y-4 pl-2">
                {/* Suggestions on Create */}
                <div className="flex justify-between items-center">
                  <label className="text-xs text-text-secondary">Show Suggestions on Create</label>
                  <button
                    className={`relative inline-flex h-5 w-9 items-center rounded-full ${aiSettings.suggestionsOnCreate ? 'bg-primary' : 'bg-white/20'}`}
                    onClick={() => updateAISettings('suggestionsOnCreate', !aiSettings.suggestionsOnCreate)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiSettings.suggestionsOnCreate ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                
                {/* Auto-expand with AI */}
                <div className="flex justify-between items-center">
                  <label className="text-xs text-text-secondary">Auto-expand with AI</label>
                  <button
                    className={`relative inline-flex h-5 w-9 items-center rounded-full ${aiSettings.autoExpandWithAI ? 'bg-primary' : 'bg-white/20'}`}
                    onClick={() => updateAISettings('autoExpandWithAI', !aiSettings.autoExpandWithAI)}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiSettings.autoExpandWithAI ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                
                {/* Suggestion Count */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-text-secondary">AI Suggestion Count</label>
                    <span className="text-xs text-text-tertiary">{aiSettings.suggestionCount}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={aiSettings.suggestionCount}
                    onChange={(e) => updateAISettings('suggestionCount', parseInt(e.target.value))}
                    className="w-full accent-primary bg-white/10 h-1 rounded-full appearance-none"
                  />
                </div>
              </div>
            </section>
            
            {/* Theme Preview */}
            <section>
              <h3 className="text-sm font-medium text-text mb-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
                Theme Preview
              </h3>
              
              <div className="h-24 rounded-lg overflow-hidden border border-white/10 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-primary rounded-lg px-4 py-2 text-white shadow-lg text-xs">
                    Main Node
                  </div>
                </div>
                <div className="absolute left-1/4 bottom-4">
                  <div className="bg-blue-500 bg-opacity-90 rounded-lg px-3 py-1.5 text-white shadow-md text-xs">
                    Sub Node
                  </div>
                </div>
                <div className="absolute right-1/4 bottom-4">
                  <div className="bg-purple-500 bg-opacity-70 rounded-lg px-3 py-1 text-white shadow-sm text-xs">
                    Leaf Node
                  </div>
                </div>
                <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                  <path
                    d="M 120,60 C 90,80 70,80 40,80"
                    stroke="url(#gradient1)"
                    strokeWidth={connectionSettings.connectionThickness}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={connectionSettings.connectionStyle === 'curved' ? 'none' : '4,4'}
                  />
                  <path
                    d="M 120,60 C 150,80 170,80 200,80"
                    stroke="url(#gradient2)"
                    strokeWidth={connectionSettings.connectionThickness}
                    fill="none"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={colors.primary} />
                      <stop offset="100%" stopColor={colors.blue} />
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={colors.primary} />
                      <stop offset="100%" stopColor={colors.purple} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </section>
          </div>
        </div>
        
        {/* Footer with actions */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              className="px-3 py-1.5 text-xs border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              onClick={handleReset}
            >
              Reset to Defaults
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="px-3 py-1.5 text-xs border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs rounded-lg transition-colors"
              onClick={handleSave}
            >
              Save Settings
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPanel; 