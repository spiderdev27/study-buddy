'use client';

import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

interface RecentResource {
  id: string;
  title: string;
  type: string;
  coverColor: string;
  progress: number;
  updatedAt: string;
}

interface RecentFlashcard {
  id: string;
  question: string;
  difficulty: string | null;
  tags: string[];
  updatedAt: string;
}

interface StudySession {
  id: string;
  startTime: string | Date;
  endTime: string | Date | null;
  duration: number | null;
  topic: string | null;
  notes: string | null;
  createdAt: string | Date;
  userId: string;
}

interface RecentActivityProps {
  recentResources?: RecentResource[];
  recentFlashcards?: RecentFlashcard[];
  studySessions?: StudySession[];
}

export function RecentActivity({
  recentResources = [],
  recentFlashcards = [],
  studySessions = [],
}: RecentActivityProps) {
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      console.error('Error formatting time:', e, dateString);
      return 'recently';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy • h:mm a');
    } catch (e) {
      console.error('Error formatting datetime:', e, dateString);
      return 'date unknown';
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
      <div className="space-y-6">
        {/* Recent Study Sessions */}
        {studySessions && studySessions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-secondary">Study Sessions</h4>
            {studySessions.slice(0, 3).map((session) => (
              <motion.div
                key={session.id}
                className="p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                whileHover={{ x: 3 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">
                      {session.topic || 'Study Session'}
                    </h5>
                    <p className="text-sm text-text-secondary">
                      {session.startTime ? formatDateTime(session.startTime.toString()) : 'Unknown date'}
                      {session.duration ? ` • ${Math.round(session.duration)} min` : ''}
                    </p>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {session.createdAt ? formatTime(session.createdAt.toString()) : 'recently'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Recent Resources */}
        {recentResources.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-secondary">Learning Materials</h4>
            {recentResources.slice(0, 3).map((resource) => (
              <motion.div
                key={resource.id}
                className="p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                whileHover={{ x: 3 }}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${resource.coverColor} flex items-center justify-center text-white`}>
                    {resource.type === 'notes' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H4.99C3.89 3 3 3.89 3 4.99V19C3 20.1 3.89 21 4.99 21H19C20.1 21 21 20.1 21 19V4.99C21 3.89 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
                      </svg>
                    )}
                    {resource.type === 'book' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {resource.type === 'video' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <h5 className="font-medium line-clamp-1">{resource.title}</h5>
                      <span className="text-xs text-text-secondary">
                        {formatTime(resource.updatedAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-secondary capitalize">{resource.type}</span>
                      <span className="text-xs text-primary">{resource.progress}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${resource.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Recent Flashcards */}
        {recentFlashcards.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-secondary">Flashcards</h4>
            {recentFlashcards.slice(0, 3).map((flashcard) => (
              <motion.div
                key={flashcard.id}
                className="p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                whileHover={{ x: 3 }}
              >
                <div className="flex justify-between">
                  <h5 className="font-medium line-clamp-1">{flashcard.question}</h5>
                  <span className="text-xs text-text-secondary">
                    {formatTime(flashcard.updatedAt)}
                  </span>
                </div>
                {flashcard.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {flashcard.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {flashcard.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-white/5 text-text-secondary rounded-full">
                        +{flashcard.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
        
        {studySessions.length === 0 && 
         recentResources.length === 0 && 
         recentFlashcards.length === 0 && (
          <div className="text-center py-6 text-text-secondary">
            <p>No recent activity found.</p>
            <p className="text-sm mt-1">Start studying to track your progress!</p>
          </div>
        )}
      </div>
    </div>
  );
} 