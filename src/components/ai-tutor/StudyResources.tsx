'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { 
  BookOpen, File, Youtube, Puzzle, 
  ExternalLink, ThumbsUp, ThumbsDown,
  BarChart, Image as ImageIcon, Play
} from 'lucide-react';

interface StudyResourcesProps {
  subject?: string;
  topic?: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'visualization' | 'interactive' | 'image';
  source: string;
  url: string;
  thumbnail?: string;
  description: string;
}

export function StudyResources({ subject, topic }: StudyResourcesProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'videos' | 'interactive'>('all');
  
  // This would normally come from an API based on subject and topic
  const resources: Resource[] = [
    {
      id: '1',
      title: 'Introduction to Linear Algebra',
      type: 'article',
      source: 'Khan Academy',
      url: 'https://www.khanacademy.org/math/linear-algebra',
      description: 'A comprehensive introduction to vectors, matrices, and linear transformations.'
    },
    {
      id: '2',
      title: 'Eigenvalues and Eigenvectors Explained',
      type: 'video',
      source: 'MIT OpenCourseWare',
      url: 'https://www.youtube.com/watch?v=PFDu9oVAE-g',
      thumbnail: '/math-video-thumb.jpg',
      description: 'Professor Gilbert Strang explains eigenvalues and eigenvectors clearly.'
    },
    {
      id: '3',
      title: 'Interactive Matrix Operations',
      type: 'interactive',
      source: 'Wolfram Demonstrations',
      url: 'https://demonstrations.wolfram.com/MatrixOperations/',
      description: 'Explore matrix operations through interactive visualizations.'
    },
    {
      id: '4',
      title: 'Vector Space Visualization',
      type: 'visualization',
      source: 'GeoGebra',
      url: 'https://www.geogebra.org/m/hcwyhaha',
      thumbnail: '/vector-space.jpg',
      description: 'Visualize vector spaces and linear transformations.'
    },
    {
      id: '5',
      title: 'Linear Algebra Concept Map',
      type: 'image',
      source: 'Mathematics Stack Exchange',
      url: 'https://math.stackexchange.com/questions/1683/concept-map-for-linear-algebra',
      thumbnail: '/concept-map.jpg',
      description: 'A comprehensive concept map showing relationships between linear algebra topics.'
    }
  ];
  
  // Filter resources based on active tab
  const filteredResources = activeTab === 'all' 
    ? resources 
    : resources.filter(r => {
        if (activeTab === 'articles') return r.type === 'article';
        if (activeTab === 'videos') return r.type === 'video';
        if (activeTab === 'interactive') return ['interactive', 'visualization'].includes(r.type);
        return false;
      });
  
  // Return placeholder when no subject/topic is selected
  if (!subject || !topic) {
    return (
      <div className={cn(
        "rounded-xl border p-5 text-center",
        isDark ? "bg-gray-800/50 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-500"
      )}>
        <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-50" />
        <h3 className="font-medium mb-1">No Study Resources Yet</h3>
        <p className="text-sm">Select a subject and topic to see related study resources</p>
      </div>
    );
  }
  
  // Get icons for resource types
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'article': return <File className="h-4 w-4" />;
      case 'video': return <Youtube className="h-4 w-4" />;
      case 'visualization': return <BarChart className="h-4 w-4" />;
      case 'interactive': return <Puzzle className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
    }
  };
  
  // Update the image paths to use a fallback image or correct paths
  const getResourceImage = (type: string) => {
    // Fallback image for all resources
    const fallbackImage = "/placeholders/resource-placeholder.jpg";
    
    switch(type) {
      case 'video':
        return "/placeholders/video-placeholder.jpg";
      case 'article':
        return "/placeholders/article-placeholder.jpg";
      case 'concept-map':
        return "/placeholders/concept-placeholder.jpg";
      default:
        return fallbackImage;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "rounded-xl border",
        isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
      )}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className={cn(
            "h-5 w-5",
            isDark ? "text-emerald-400" : "text-emerald-600"
          )} />
          <h3 className={cn(
            "font-medium",
            isDark ? "text-white" : "text-gray-800"
          )}>
            Study Resources: {topic}
          </h3>
        </div>
        <div className={cn(
          "text-xs px-2 py-1 rounded-full",
          isDark ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-50 text-emerald-700"
        )}>
          {resources.length} resources
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b">
        {(['all', 'articles', 'videos', 'interactive'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors relative",
              activeTab === tab
                ? isDark
                  ? "text-white" 
                  : "text-gray-900"
                : isDark
                  ? "text-gray-400 hover:text-gray-300" 
                  : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabIndicator"
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-0.5",
                  isDark ? "bg-emerald-500" : "bg-emerald-600"
                )}
              />
            )}
          </button>
        ))}
      </div>
      
      {/* Resources List */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource) => (
            <div
              key={resource.id}
              className={cn(
                "p-3 rounded-lg border transition-colors",
                isDark 
                  ? "border-gray-700 hover:bg-gray-700/50" 
                  : "border-gray-200 hover:bg-gray-50"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail for video and visualization */}
                {(resource.type === 'video' || resource.type === 'visualization' || resource.type === 'image') && resource.thumbnail && (
                  <div className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${getResourceImage(resource.type)})` }} 
                    />
                    {resource.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center bg-black/60",
                          "text-white"
                        )}>
                          <Play className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={cn(
                      "font-medium text-sm",
                      isDark ? "text-white" : "text-gray-800"
                    )}>
                      {resource.title}
                    </h4>
                    <div className={cn(
                      "flex-shrink-0 rounded-full p-1.5",
                      isDark ? "text-gray-400 bg-gray-700" : "text-gray-600 bg-gray-100"
                    )}>
                      {getResourceIcon(resource.type)}
                    </div>
                  </div>
                  
                  <p className={cn(
                    "text-xs mt-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    {resource.description}
                  </p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className={cn(
                      "text-xs",
                      isDark ? "text-gray-500" : "text-gray-500"
                    )}>
                      {resource.source}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button className={cn(
                          "p-1 rounded-full transition-colors",
                          isDark ? "hover:bg-gray-600 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                        )}>
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button className={cn(
                          "p-1 rounded-full transition-colors",
                          isDark ? "hover:bg-gray-600 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                        )}>
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                          isDark 
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Open</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              No resources found in this category
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
} 