export interface Flashcard {
  id: string;
  front: string;
  back: string;
  confidence: number;
  lastReviewed: string | null;
  tags?: string[];
}

export interface Deck {
  id: string;
  name: string;
  flashcards: Flashcard[];
  createdAt: string;
  lastStudied: string | null;
  description?: string;
  tags?: string[];
}

export interface StudySession {
  deckId: string;
  startTime: string;
  endTime?: string;
  cardsStudied: number;
  correctAnswers: number;
  averageConfidence: number;
} 