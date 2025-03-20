'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NoteTemplate, NoteCategory } from '@/types/smart-notes';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

// Icons
import {
  FileText, Briefcase, Book, AlertCircle, Clipboard,
  Lightbulb, User, HelpCircle, X, Check, Search
} from 'lucide-react';

// Define the note templates
export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Note',
    description: 'Start with a clean slate',
    content: '',
    tags: [],
    category: 'personal',
    color: 'gray',
    icon: 'FileText',
    isDefault: true
  },
  {
    id: 'lecture',
    name: 'Lecture Notes',
    description: 'Structure for academic lectures',
    content: `<h1>Lecture: [Title]</h1>
<p><strong>Date:</strong> [Date]</p>
<p><strong>Course:</strong> [Course]</p>
<p><strong>Instructor:</strong> [Instructor]</p>

<h2>Main Topics</h2>
<ul>
  <li>Topic 1</li>
  <li>Topic 2</li>
  <li>Topic 3</li>
</ul>

<h2>Key Points</h2>
<p>[Notes about important concepts]</p>

<h2>Examples</h2>
<p>[Examples discussed in class]</p>

<h2>Questions</h2>
<ul>
  <li>[Questions to ask or research later]</li>
</ul>

<h2>Action Items</h2>
<ul>
  <li>[ ] Review notes</li>
  <li>[ ] Complete practice problems</li>
  <li>[ ] Research related topics</li>
</ul>`,
    tags: ['lecture', 'academic'],
    category: 'lecture',
    color: 'blue',
    icon: 'Book'
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    description: 'Organize meeting minutes and action items',
    content: `<h1>Meeting: [Title]</h1>
<p><strong>Date:</strong> [Date]</p>
<p><strong>Attendees:</strong> [Names]</p>

<h2>Agenda</h2>
<ol>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ol>

<h2>Discussion</h2>
<p>[Summary of key discussions]</p>

<h2>Decisions Made</h2>
<ul>
  <li>[Decision 1]</li>
  <li>[Decision 2]</li>
</ul>

<h2>Action Items</h2>
<ul>
  <li>[ ] Task 1 - Assigned to: [Name], Due: [Date]</li>
  <li>[ ] Task 2 - Assigned to: [Name], Due: [Date]</li>
</ul>

<h2>Next Meeting</h2>
<p><strong>Date:</strong> [Next meeting date]</p>
<p><strong>Topics:</strong> [Topics for next meeting]</p>`,
    tags: ['meeting', 'collaboration'],
    category: 'personal',
    color: 'amber',
    icon: 'Briefcase'
  },
  {
    id: 'research',
    name: 'Research Notes',
    description: 'Template for research findings and analysis',
    content: `<h1>Research Topic: [Title]</h1>
<p><strong>Date:</strong> [Date]</p>
<p><strong>Area:</strong> [Research area]</p>

<h2>Research Questions</h2>
<ul>
  <li>[Question 1]</li>
  <li>[Question 2]</li>
</ul>

<h2>Literature Review</h2>
<p>[Summary of existing research]</p>

<h2>Methodology</h2>
<p>[Research approach]</p>

<h2>Findings</h2>
<p>[Key discoveries]</p>

<h2>Analysis</h2>
<p>[Interpretation of findings]</p>

<h2>References</h2>
<ul>
  <li>[Reference 1]</li>
  <li>[Reference 2]</li>
</ul>`,
    tags: ['research', 'academic'],
    category: 'research',
    color: 'purple',
    icon: 'Lightbulb'
  },
  {
    id: 'exam-prep',
    name: 'Exam Preparation',
    description: 'Structured format for exam study',
    content: `<h1>Exam Preparation: [Subject]</h1>
<p><strong>Exam Date:</strong> [Date]</p>
<p><strong>Topics Covered:</strong> [List of topics]</p>

<h2>Key Concepts</h2>
<ul>
  <li>Concept 1: [Explanation]</li>
  <li>Concept 2: [Explanation]</li>
</ul>

<h2>Formulas & Definitions</h2>
<ul>
  <li>[Formula 1]</li>
  <li>[Definition 1]</li>
</ul>

<h2>Practice Questions</h2>
<ol>
  <li>Question: [Question text]</li>
  <li>Solution: [Solution steps]</li>
</ol>

<h2>Study Plan</h2>
<ul>
  <li>[ ] Review lecture notes</li>
  <li>[ ] Complete practice problems</li>
  <li>[ ] Review textbook chapters</li>
  <li>[ ] Practice with past exams</li>
</ul>`,
    tags: ['exam', 'study', 'academic'],
    category: 'exam',
    color: 'red',
    icon: 'AlertCircle'
  },
  {
    id: 'project',
    name: 'Project Plan',
    description: 'Organize project goals, tasks and deadlines',
    content: `<h1>Project: [Title]</h1>
<p><strong>Start Date:</strong> [Date]</p>
<p><strong>Due Date:</strong> [Date]</p>
<p><strong>Status:</strong> [Status]</p>

<h2>Project Objective</h2>
<p>[Clear statement of the goal]</p>

<h2>Team Members</h2>
<ul>
  <li>[Name] - [Role]</li>
</ul>

<h2>Milestones</h2>
<ol>
  <li>Phase 1 - [Description] - Due: [Date]</li>
  <li>Phase 2 - [Description] - Due: [Date]</li>
  <li>Phase 3 - [Description] - Due: [Date]</li>
</ol>

<h2>Task Breakdown</h2>
<ul>
  <li>[ ] Task 1 - Assigned to: [Name]</li>
  <li>[ ] Task 2 - Assigned to: [Name]</li>
</ul>

<h2>Resources Needed</h2>
<ul>
  <li>[Resource 1]</li>
  <li>[Resource 2]</li>
</ul>

<h2>Potential Challenges</h2>
<ul>
  <li>[Challenge 1] - Mitigation: [Strategy]</li>
</ul>`,
    tags: ['project', 'planning'],
    category: 'project',
    color: 'green',
    icon: 'Clipboard'
  }
];

// Get icon component by name
export const getTemplateIcon = (iconName: string) => {
  switch (iconName) {
    case 'FileText': return <FileText className="w-5 h-5" />;
    case 'Book': return <Book className="w-5 h-5" />;
    case 'Briefcase': return <Briefcase className="w-5 h-5" />;
    case 'Lightbulb': return <Lightbulb className="w-5 h-5" />;
    case 'AlertCircle': return <AlertCircle className="w-5 h-5" />;
    case 'Clipboard': return <Clipboard className="w-5 h-5" />;
    case 'User': return <User className="w-5 h-5" />;
    case 'HelpCircle': return <HelpCircle className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

interface TemplateSelectionProps {
  onSelectTemplate: (template: NoteTemplate) => void;
  onClose: () => void;
}

export function TemplateSelectionModal({ onSelectTemplate, onClose }: TemplateSelectionProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter templates based on search query
  const filteredTemplates = searchQuery 
    ? NOTE_TEMPLATES.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : NOTE_TEMPLATES;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "relative w-full max-w-2xl p-6 rounded-lg shadow-xl",
          isDark ? "bg-gray-900" : "bg-white"
        )}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold mb-4">Choose a Template</h2>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-md border",
              isDark 
                ? "bg-gray-800 border-gray-700 text-white" 
                : "bg-white border-gray-300 text-gray-900"
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
          {filteredTemplates.map(template => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTemplate(template)}
              className={cn(
                "p-4 rounded-lg cursor-pointer border-2 hover:shadow-md transition-all",
                `border-${template.color || 'gray'}-500`,
                isDark 
                  ? "bg-gray-800 hover:bg-gray-750" 
                  : "bg-white hover:bg-gray-50"
              )}
            >
              <div className="flex items-start">
                <div className={`p-2 rounded-md bg-${template.color || 'gray'}-100 dark:bg-${template.color || 'gray'}-900 text-${template.color || 'gray'}-500 mr-3`}>
                  {getTemplateIcon(template.icon || 'FileText')}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map(tag => (
                      <span 
                        key={tag} 
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          isDark 
                            ? "bg-gray-700 text-gray-300" 
                            : "bg-gray-200 text-gray-700"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className={cn(
              "px-4 py-2 mr-2 rounded-md text-sm",
              isDark ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800"
            )}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
} 