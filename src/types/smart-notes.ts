export interface SmartNote {
  id: string;
  title: string;
  content: string;
  contentHtml?: string; // Rendered HTML content
  tags: string[];
  category: NoteCategory;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isArchived: boolean;
  color?: string;
  aiSummary?: string;
  aiTopics?: string[];
  aiKeyInsights?: string[];
  collaborators?: string[]; // User IDs
  references?: NoteReference[];
  attachments?: Attachment[];
  version?: number;
  versionHistory?: VersionHistory[];
  templateId?: string; // Reference to the template used
  
  // Hierarchical structure
  parentId?: string;  // For nested notes
  isFolder?: boolean; // Is this a container?
  children?: string[]; // IDs of child notes
  
  // Backlinks
  backlinks?: string[]; // IDs of notes that reference this note
  
  // Voice transcription
  audioRecording?: string; // URL to audio file
  transcription?: string; // Transcribed text
  
  // Advanced AI
  aiQuestions?: string[]; // Generated questions based on content
  aiRelatedConcepts?: string[]; // Related concepts identified by AI
  aiSuggestedReferences?: AISuggestedReference[]; // Suggested academic references
  aiStudyPlan?: AIStudyPlan; // Generated study plan
}

export type NoteCategory = 
  | 'lecture'
  | 'assignment'
  | 'research'
  | 'exam'
  | 'project'
  | 'personal'
  | 'other';

export interface NoteReference {
  id: string;
  title: string;
  type: 'url' | 'note' | 'book' | 'article' | 'video';
  link?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'audio' | 'video' | 'other';
  url: string;
  size: number; // in bytes
  createdAt: string;
}

export interface VersionHistory {
  version: number;
  content: string;
  updatedAt: string;
  changedBy?: string;
}

export interface NoteFilter {
  search?: string;
  tags?: string[];
  category?: NoteCategory;
  isPinned?: boolean;
  isArchived?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface AIEnhancement {
  type: 'summary' | 'keywords' | 'questions' | 'citations' | 'structure' | 'expansion' | 
         'related-concepts' | 'study-plan' | 'references';
  content: string;
}

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  tags: string[];
  category: NoteCategory;
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

export interface AIStudyPlan {
  topics: string[];
  estimatedStudyTime: string;
  recommendedSequence: string[];
  exercises: string[];
}

export interface AISuggestedReference {
  title: string;
  authors: string;
  year: number;
  url?: string;
  description?: string;
} 