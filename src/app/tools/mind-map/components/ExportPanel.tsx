'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/theme-selector';

// Interface for the panel props
interface ExportPanelProps {
  onClose: () => void;
  onExport: (format: string, options: any) => void;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ onClose, onExport }) => {
  const { colors } = useTheme();
  const [selectedFormat, setSelectedFormat] = useState<string>('png');
  const [includeMetadata, setIncludeMetadata] = useState<boolean>(true);
  const [highQuality, setHighQuality] = useState<boolean>(true);
  const [showNodeIds, setShowNodeIds] = useState<boolean>(false);

  // Export format options
  const exportOptions = [
    {
      id: 'png',
      label: 'PNG Image',
      description: 'Export as a PNG image file',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      )
    },
    {
      id: 'pdf',
      label: 'PDF Document',
      description: 'Export as a PDF document',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
      )
    },
    {
      id: 'json',
      label: 'JSON Data',
      description: 'Export as a JSON data file',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M8.5 10.5L6 13l2.5 2.5" />
          <path d="M15.5 10.5L18 13l-2.5 2.5" />
          <path d="M12 10l-2 6" />
        </svg>
      )
    }
  ];

  // Handle export button click
  const handleExport = () => {
    const options = {
      includeMetadata,
      highQuality,
      showNodeIds,
    };
    
    onExport(selectedFormat, options);
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
        className="bg-bg-card w-full max-w-md rounded-xl shadow-xl border border-white/10 overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-medium">Export Mind Map</h2>
          <button 
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-text-secondary hover:text-text"
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Export format selection */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-text-secondary mb-3">Export Format</h3>
          <div className="space-y-2">
            {exportOptions.map(option => (
              <div
                key={option.id}
                className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedFormat === option.id ? 'bg-primary/20 border border-primary/30' : 'border border-white/10 hover:bg-white/5'
                }`}
                onClick={() => setSelectedFormat(option.id)}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 ${
                  selectedFormat === option.id ? 'bg-primary text-white' : 'bg-white/10 text-text-secondary'
                }`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${selectedFormat === option.id ? 'text-primary' : 'text-text'}`}>
                    {option.label}
                  </h4>
                  <p className="text-xs text-text-tertiary mt-0.5">{option.description}</p>
                </div>
                <div className="ml-2 flex items-center">
                  <div className={`w-4 h-4 rounded-full border ${
                    selectedFormat === option.id ? 'border-primary bg-primary' : 'border-white/30'
                  } flex items-center justify-center`}>
                    {selectedFormat === option.id && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Export options section */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <h3 className="text-sm font-medium text-text-secondary mb-3">Export Options</h3>
          <div className="space-y-3">
            {/* Include metadata option */}
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm text-text">Include Metadata</h4>
                <p className="text-xs text-text-tertiary">Add creation date and author info</p>
              </div>
              <button
                className={`relative inline-flex h-5 w-9 items-center rounded-full ${includeMetadata ? 'bg-primary' : 'bg-white/20'}`}
                onClick={() => setIncludeMetadata(!includeMetadata)}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeMetadata ? 'translate-x-5' : 'translate-x-1'}`}
                />
              </button>
            </div>
            
            {/* High quality option (only for image formats) */}
            {(selectedFormat === 'png' || selectedFormat === 'pdf') && (
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm text-text">High Quality</h4>
                  <p className="text-xs text-text-tertiary">Larger file size but better quality</p>
                </div>
                <button
                  className={`relative inline-flex h-5 w-9 items-center rounded-full ${highQuality ? 'bg-primary' : 'bg-white/20'}`}
                  onClick={() => setHighQuality(!highQuality)}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${highQuality ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            )}
            
            {/* Show node IDs (only for JSON export) */}
            {selectedFormat === 'json' && (
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm text-text">Include Node IDs</h4>
                  <p className="text-xs text-text-tertiary">For advanced integration with other tools</p>
                </div>
                <button
                  className={`relative inline-flex h-5 w-9 items-center rounded-full ${showNodeIds ? 'bg-primary' : 'bg-white/20'}`}
                  onClick={() => setShowNodeIds(!showNodeIds)}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showNodeIds ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer with actions */}
        <div className="p-4 border-t border-white/10 bg-black/10 flex justify-end items-center space-x-2">
          <button 
            className="px-3 py-1.5 text-xs border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs rounded-lg transition-colors"
            onClick={handleExport}
          >
            Export as {exportOptions.find(o => o.id === selectedFormat)?.label}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExportPanel; 