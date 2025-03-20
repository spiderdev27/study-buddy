'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/app/theme-selector';
import { useSession } from 'next-auth/react';
import MindMapElements from './components/MindMapElements';
import AIAssistantPanel from './components/AIAssistantPanel';
import ToolbarPanel from './components/ToolbarPanel';
import SavedMapsPanel from './components/SavedMapsPanel';
import ExportPanel from './components/ExportPanel';
import SettingsPanel from './components/SettingsPanel';
import AIActionButton from './components/AIActionButton';
import TemplatePanel from './components/TemplatePanel';

export default function MindMapTool() {
  const { data: session } = useSession();
  const { theme, colors } = useTheme();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // State for nodes and links
  const [nodes, setNodes] = useState<Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    color: string;
    type: 'main' | 'sub' | 'leaf';
    aiGenerated?: boolean;
  }>>([]);
  
  const [links, setLinks] = useState<Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
  }>>([]);
  
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isSavedMapsOpen, setIsSavedMapsOpen] = useState(false);
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [currentMapTitle, setCurrentMapTitle] = useState('Untitled Mind Map');
  const [isEditing, setIsEditing] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'edit' | 'present'>('edit');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Add state for layout options
  const [currentLayout, setCurrentLayout] = useState<string>('radial');
  const [currentColor, setCurrentColor] = useState<string>(colors.primary);
  const [isAutoLayoutEnabled, setIsAutoLayoutEnabled] = useState<boolean>(false);
  
  // Add state for template panel
  const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false);
  
  // Initialize with a root node
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes([{
        id: 'root',
        text: 'Central Idea',
        x: window.innerWidth / 2,
        y: window.innerHeight / 3,
        color: colors.primary,
        type: 'main'
      }]);
    }
  }, [colors.primary]);
  
  // Handle canvas navigation interactions
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !e.target.closest('.node')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleCanvasWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newScale = Math.min(Math.max(0.5, scale + delta), 2);
    setScale(newScale);
  };
  
  // Add a child node to a parent
  const addChildNode = (parentId: string, text: string = 'New Idea', isAIGenerated = false) => {
    const parent = nodes.find(node => node.id === parentId);
    if (!parent) return;
    
    const angleOffset = Math.random() * Math.PI / 2 - Math.PI / 4;
    const distance = 150;
    const childType = parent.type === 'main' ? 'sub' : 'leaf';
    const childColor = childType === 'sub' 
      ? colors.secondary 
      : `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
    
    const newNodeId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const newNode = {
      id: newNodeId,
      text,
      x: parent.x + distance * Math.cos(angleOffset),
      y: parent.y + distance * Math.sin(angleOffset),
      color: childColor,
      type: childType,
      aiGenerated: isAIGenerated
    };
    
    const newLink = {
      id: `link-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      source: parentId,
      target: newNodeId
    };
    
    setNodes([...nodes, newNode]);
    setLinks([...links, newLink]);
    
    return newNodeId;
  };
  
  // Update node text
  const updateNodeText = (nodeId: string, text: string) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, text } : node
    ));
  };
  
  // Delete a node and its connections
  const deleteNode = (nodeId: string) => {
    // Don't delete the root node
    if (nodeId === 'root') return;
    
    setNodes(nodes.filter(node => node.id !== nodeId));
    setLinks(links.filter(link => link.source !== nodeId && link.target !== nodeId));
    
    if (activeNode === nodeId) setActiveNode(null);
  };
  
  // Move a node position
  const moveNode = (nodeId: string, newX: number, newY: number) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, x: newX, y: newY } : node
    ));
  };
  
  // Generate ideas with Gemini AI
  const generateIdeasWithAI = async (nodeText: string) => {
    setIsLoading(true);
    try {
      // Simulate API call to Gemini
      // In a real app, you would replace this with actual Gemini API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate AI response
      const mockSuggestions = [
        `Related concept to "${nodeText}"`,
        `Subtopic of "${nodeText}"`,
        `Example of "${nodeText}"`,
        `Application of "${nodeText}"`,
        `Implication of "${nodeText}"`
      ];
      
      setAiSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add AI suggestion as a node
  const addAISuggestion = (suggestion: string, parentId: string) => {
    addChildNode(parentId, suggestion, true);
  };
  
  // Auto-arrange nodes in a radial layout
  const autoArrangeNodes = () => {
    // Find root node
    const root = nodes.find(node => node.id === 'root');
    if (!root) return;
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 3;
    
    // First, position the root node at center
    const updatedNodes = [
      { ...root, x: centerX, y: centerY }
    ];
    
    // Find all direct children of root
    const childLinks = links.filter(link => link.source === 'root');
    const angleStep = (2 * Math.PI) / childLinks.length;
    
    // Position direct children in a circle around root
    childLinks.forEach((link, i) => {
      const childNode = nodes.find(node => node.id === link.target);
      if (!childNode) return;
      
      const angle = i * angleStep;
      const level1Distance = 200;
      
      updatedNodes.push({
        ...childNode,
        x: centerX + level1Distance * Math.cos(angle),
        y: centerY + level1Distance * Math.sin(angle)
      });
      
      // Find all children of this node (level 2)
      const grandChildLinks = links.filter(l => l.source === childNode.id);
      const grandChildAngleStep = Math.PI / 4;
      
      // Position level 2 children in arcs
      grandChildLinks.forEach((gcLink, j) => {
        const gcNode = nodes.find(node => node.id === gcLink.target);
        if (!gcNode) return;
        
        const gcAngle = angle + ((j - (grandChildLinks.length - 1) / 2) * grandChildAngleStep / grandChildLinks.length);
        const level2Distance = 300;
        
        updatedNodes.push({
          ...gcNode,
          x: centerX + level2Distance * Math.cos(gcAngle),
          y: centerY + level2Distance * Math.sin(gcAngle)
        });
      });
    });
    
    setNodes(updatedNodes);
    setPosition({ x: 0, y: 0 });
    setScale(1);
  };
  
  const saveMindMap = () => {
    // In a real app, you would save to backend/database
    // This is a mock implementation
    const mapData = {
      title: currentMapTitle,
      nodes,
      links,
      createdAt: new Date().toISOString()
    };
    
    // For demo purposes, just show a success toast notification
    alert(`Mind map "${currentMapTitle}" saved successfully!`);
    console.log('Saved map data:', mapData);
  };
  
  const exportMindMap = (format: 'png' | 'pdf' | 'json') => {
    // Mock export functionality
    console.log(`Exporting mind map as ${format}...`);
    alert(`Your mind map has been exported as ${format.toUpperCase()}`);
  };

  // Handle loading a saved map
  const handleSelectMap = (mapId: string) => {
    console.log('Loading mind map:', mapId);
    
    // Here you would fetch the mind map data based on mapId
    // For now, let's just close the panel
    setIsSavedMapsOpen(false);
    
    // Example implementation - simulating loading a saved map
    /*
    // In a real implementation, you would fetch the map data from your backend
    fetchMapById(mapId).then(mapData => {
      setNodes(mapData.nodes);
      setLinks(mapData.links);
      setCurrentMapTitle(mapData.title);
    });
    */
  };

  // Handle layout change
  const handleLayoutChange = (layout: string) => {
    console.log('Changing layout to:', layout);
    setCurrentLayout(layout);
    
    // Here you would apply the selected layout to the nodes
    // For now, we'll just update the state
    // In a real implementation, you might rearrange the nodes based on the layout type
  };
  
  // Handle color scheme change
  const handleColorChange = (color: string) => {
    console.log('Changing color scheme to:', color);
    setCurrentColor(color);
    
    // Here you would update the color scheme of your mind map
    // For now, we'll just update the state
  };
  
  // Toggle auto-layout
  const toggleAutoLayout = () => {
    const newValue = !isAutoLayoutEnabled;
    setIsAutoLayoutEnabled(newValue);
    
    if (newValue) {
      // If auto-layout is enabled, apply it
      autoArrangeNodes();
    }
  };
  
  // Add a new node (could be bound to a keyboard shortcut or button)
  const addNewNode = () => {
    if (activeNode) {
      addChildNode(activeNode);
    } else {
      // If no node is active, add a child to the root node
      const rootNode = nodes.find(node => node.id === 'root');
      if (rootNode) {
        addChildNode('root');
      }
    }
  };

  // Add this function to handle template selection
  const handleTemplateSelect = (template: any) => {
    setNodes(template.nodes);
    setLinks(template.links);
    setCurrentMapTitle(template.title);
    setIsTemplatePanelOpen(false);
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      {/* Title and Controls */}
      <div className="flex justify-between items-center p-4 border-b border-white/10 backdrop-blur-md bg-background/60 z-10">
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <input 
              type="text" 
              value={currentMapTitle}
              onChange={(e) => setCurrentMapTitle(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="bg-transparent border-b border-white/20 px-2 py-1 text-xl font-bold focus:outline-none focus:border-primary"
              autoFocus
            />
          ) : (
            <motion.h1 
              className="text-xl font-bold"
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.02 }}
            >
              {currentMapTitle}
            </motion.h1>
          )}
          
          <div className="flex text-sm text-text-secondary">
            {viewMode === 'edit' ? 'Editing' : 'Presenting'}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-sm"
            onClick={() => setIsTemplatePanelOpen(true)}
          >
            Templates
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 rounded-md text-sm ${
              viewMode === 'edit' 
                ? 'bg-primary text-white' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
            onClick={() => setViewMode('edit')}
          >
            Edit
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 rounded-md text-sm ${
              viewMode === 'present' 
                ? 'bg-primary text-white' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
            onClick={() => setViewMode('present')}
          >
            Present
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-sm"
            onClick={() => setIsSavedMapsOpen(true)}
          >
            My Maps
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-sm"
            onClick={() => setIsExportPanelOpen(true)}
          >
            Export
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-primary to-secondary px-3 py-1.5 rounded-md text-sm shadow-glow font-medium"
            onClick={saveMindMap}
          >
            Save
          </motion.button>
        </div>
      </div>
      
      {/* Main Canvas Area */}
      <div 
        ref={canvasRef}
        className="flex-1 overflow-hidden bg-background"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleCanvasWheel}
      >
        <div 
          className="w-full h-full relative"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Links */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {links.map(link => (
              <MindMapElements.MindMapLink 
                key={link.id} 
                link={link}
                nodes={nodes}
              />
            ))}
          </svg>
          
          {/* Nodes */}
          {nodes.map(node => (
            <MindMapElements.MindMapNode
              key={node.id}
              node={node}
              isActive={activeNode === node.id}
              onClick={() => setActiveNode(node.id)}
              onDoubleClick={() => addChildNode(node.id)}
              onTextUpdate={updateNodeText}
              onDelete={deleteNode}
              onMove={moveNode}
              onGenerateWithAI={() => {
                setActiveNode(node.id);
                generateIdeasWithAI(node.text);
                setIsAIAssistantOpen(true);
              }}
              viewMode={viewMode}
            />
          ))}
        </div>
      </div>
      
      {/* Floating controls */}
      {viewMode === 'edit' && (
        <motion.div 
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ToolbarPanel 
            onZoomIn={() => setScale(scale + 0.1)}
            onZoomOut={() => setScale(scale - 0.1)}
            onZoomReset={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            onAutoArrange={autoArrangeNodes}
            onSettings={() => setIsSettingsPanelOpen(true)}
            currentZoom={Math.round(scale * 100)}
            onLayout={handleLayoutChange}
            onColorChange={handleColorChange}
            onToggleAutoLayout={toggleAutoLayout}
            isAutoLayoutEnabled={isAutoLayoutEnabled}
            currentLayout={currentLayout}
            currentColor={currentColor}
            onAddNode={addNewNode}
          />
        </motion.div>
      )}
      
      {/* AI Assistant Button */}
      <div className="absolute bottom-6 right-6 z-20">
        <AIActionButton 
          onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
          isOpen={isAIAssistantOpen}
        />
      </div>
      
      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isAIAssistantOpen && (
          <AIAssistantPanel
            activeNode={activeNode ? nodes.find(n => n.id === activeNode) : null}
            suggestions={aiSuggestions}
            isLoading={isLoading}
            onClose={() => setIsAIAssistantOpen(false)}
            onGenerateIdeas={(nodeId) => {
              const node = nodes.find(n => n.id === nodeId);
              if (node) {
                generateIdeasWithAI(node.text);
              }
            }}
            onAddSuggestion={(suggestion) => {
              if (activeNode) {
                addAISuggestion(suggestion, activeNode);
              }
            }}
            onExpandNode={(nodeId) => {
              const node = nodes.find(n => n.id === nodeId);
              if (node) {
                generateIdeasWithAI(node.text);
              }
            }}
            onApplySuggestion={(suggestion) => {
              if (activeNode) {
                addAISuggestion(suggestion.text, activeNode);
              }
            }}
            currentNodeText={activeNode ? nodes.find(n => n.id === activeNode)?.text || "" : ""}
          />
        )}
      </AnimatePresence>
      
      {/* Saved Maps Panel */}
      <AnimatePresence>
        {isSavedMapsOpen && (
          <SavedMapsPanel
            onClose={() => setIsSavedMapsOpen(false)}
            onSelectMap={handleSelectMap}
          />
        )}
      </AnimatePresence>
      
      {/* Export Panel */}
      <AnimatePresence>
        {isExportPanelOpen && (
          <ExportPanel
            onClose={() => setIsExportPanelOpen(false)}
            onExport={exportMindMap}
          />
        )}
      </AnimatePresence>
      
      {/* Settings Panel */}
      <AnimatePresence>
        {isSettingsPanelOpen && (
          <SettingsPanel
            onClose={() => setIsSettingsPanelOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Add TemplatePanel */}
      <AnimatePresence>
        {isTemplatePanelOpen && (
          <TemplatePanel
            onClose={() => setIsTemplatePanelOpen(false)}
            onSelectTemplate={handleTemplateSelect}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 