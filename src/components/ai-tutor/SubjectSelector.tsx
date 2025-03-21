'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { 
  ChevronDown, Search, X, PlusCircle, 
  Calculator, BookOpen, Atom, Globe, Code, 
  BarChart3, History, Landmark, Languages, Music
} from 'lucide-react';

// Define subject categories
const subjects = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: <Calculator className="h-5 w-5" />,
    color: 'blue',
    topics: [
      'Algebra', 'Calculus', 'Geometry', 'Statistics', 
      'Trigonometry', 'Number Theory', 'Linear Algebra',
      'Differential Equations', 'Discrete Mathematics'
    ]
  },
  {
    id: 'science',
    name: 'Science',
    icon: <Atom className="h-5 w-5" />,
    color: 'green',
    topics: [
      'Physics', 'Chemistry', 'Biology', 'Astronomy',
      'Earth Science', 'Environmental Science', 'Anatomy',
      'Genetics', 'Quantum Mechanics', 'Organic Chemistry'
    ]
  },
  {
    id: 'computer_science',
    name: 'Computer Science',
    icon: <Code className="h-5 w-5" />,
    color: 'purple',
    topics: [
      'Programming', 'Data Structures', 'Algorithms',
      'Web Development', 'Databases', 'Machine Learning',
      'Artificial Intelligence', 'Operating Systems',
      'Computer Networks', 'Cybersecurity'
    ]
  },
  {
    id: 'humanities',
    name: 'Humanities',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'amber',
    topics: [
      'Literature', 'Philosophy', 'Art History',
      'Religious Studies', 'Ethics', 'Anthropology',
      'Linguistics', 'Critical Theory', 'Cultural Studies'
    ]
  },
  {
    id: 'social_sciences',
    name: 'Social Sciences',
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'rose',
    topics: [
      'Psychology', 'Sociology', 'Economics',
      'Political Science', 'Geography', 'Archaeology',
      'Criminology', 'Urban Studies', 'Gender Studies'
    ]
  },
  {
    id: 'history',
    name: 'History',
    icon: <History className="h-5 w-5" />,
    color: 'orange',
    topics: [
      'World History', 'Ancient Civilizations', 'Middle Ages',
      'Renaissance', 'Modern History', 'US History',
      'European History', 'Asian History', 'Military History'
    ]
  },
  {
    id: 'language',
    name: 'Languages',
    icon: <Languages className="h-5 w-5" />,
    color: 'sky',
    topics: [
      'English', 'Spanish', 'French', 'German',
      'Chinese', 'Japanese', 'Russian', 'Arabic',
      'Latin', 'Grammar', 'Composition'
    ]
  },
  {
    id: 'arts',
    name: 'Arts & Music',
    icon: <Music className="h-5 w-5" />,
    color: 'pink',
    topics: [
      'Music Theory', 'Art Techniques', 'Dance',
      'Theater', 'Film Studies', 'Photography',
      'Sculpture', 'Design', 'Creative Writing'
    ]
  },
  {
    id: 'business',
    name: 'Business & Finance',
    icon: <Landmark className="h-5 w-5" />,
    color: 'emerald',
    topics: [
      'Accounting', 'Marketing', 'Management',
      'Finance', 'Entrepreneurship', 'Business Law',
      'Human Resources', 'International Business', 'Investing'
    ]
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: <Globe className="h-5 w-5" />,
    color: 'teal',
    topics: [
      'Physical Geography', 'Human Geography', 'Maps',
      'Climate', 'Landforms', 'Natural Resources',
      'Ecosystems', 'GIS', 'Urban Geography'
    ]
  }
];

interface SubjectSelectorProps {
  onSelectSubject: (subject: string) => void;
  onSelectTopic: (topic: string) => void;
}

export function SubjectSelector({ onSelectSubject, onSelectTopic }: SubjectSelectorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Filter subjects based on search query
  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle subject selection
  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setIsOpen(false);
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      onSelectSubject(subject.name);
    }
  };

  // Handle topic selection
  const handleSelectTopic = (topic: string) => {
    onSelectTopic(topic);
  };

  // Get the current selected subject
  const currentSubject = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="w-full">
      {/* Subject selector dropdown */}
      <div className="relative mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl border",
            isDark 
              ? "bg-gray-800 border-gray-700 text-white" 
              : "bg-white border-gray-200 text-gray-800",
            "transition-colors"
          )}
        >
          <div className="flex items-center gap-2">
            {selectedSubject ? (
              <>
                <span className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full",
                  `bg-${currentSubject?.color}-100 text-${currentSubject?.color}-600`,
                  isDark && `bg-${currentSubject?.color}-900/30 text-${currentSubject?.color}-400`
                )}>
                  {currentSubject?.icon}
                </span>
                <span>{currentSubject?.name}</span>
              </>
            ) : (
              <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                Select a subject
              </span>
            )}
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 transition-transform",
            isOpen ? "transform rotate-180" : "",
            isDark ? "text-gray-400" : "text-gray-500"
          )} />
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute z-10 mt-2 w-full rounded-xl border shadow-lg overflow-hidden",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}
            >
              {/* Search input */}
              <div className={cn(
                "p-3 border-b",
                isDark ? "border-gray-700" : "border-gray-200"
              )}>
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border",
                  isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
                )}>
                  <Search className={cn(
                    "h-4 w-4",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search subjects or topics..."
                    className={cn(
                      "bg-transparent outline-none w-full text-sm",
                      isDark ? "text-white placeholder-gray-400" : "text-gray-800 placeholder-gray-500"
                    )}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className={cn(
                        "p-1 rounded-full",
                        isDark ? "hover:bg-gray-600 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                      )}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Subjects list */}
              <div className="max-h-60 overflow-y-auto">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => handleSelectSubject(subject.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors",
                        isDark ? "hover:bg-gray-700" : "hover:bg-gray-100",
                        selectedSubject === subject.id && (isDark ? "bg-gray-700" : "bg-gray-100")
                      )}
                    >
                      <span className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full",
                        `bg-${subject.color}-100 text-${subject.color}-600`,
                        isDark && `bg-${subject.color}-900/30 text-${subject.color}-400`
                      )}>
                        {subject.icon}
                      </span>
                      <div className="text-left">
                        <div className={isDark ? "text-white" : "text-gray-800"}>
                          {subject.name}
                        </div>
                        <div className={cn(
                          "text-xs",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          {subject.topics.length} topics
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className={cn(
                    "p-4 text-center",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    No subjects found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Topics list */}
      {selectedSubject && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className={cn(
            "text-sm font-medium mb-2",
            isDark ? "text-gray-300" : "text-gray-600"
          )}>
            Popular Topics in {currentSubject?.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentSubject?.topics.slice(0, 10).map((topic) => (
              <button
                key={topic}
                onClick={() => handleSelectTopic(topic)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  isDark 
                    ? `bg-${currentSubject.color}-900/20 text-${currentSubject.color}-400 hover:bg-${currentSubject.color}-900/30` 
                    : `bg-${currentSubject.color}-50 text-${currentSubject.color}-600 hover:bg-${currentSubject.color}-100`
                )}
              >
                {topic}
              </button>
            ))}
            <button className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1",
              isDark 
                ? "bg-gray-800 text-gray-400 hover:bg-gray-700" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span>More</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
} 