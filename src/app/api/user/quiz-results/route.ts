import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// For now, we'll save quiz results to a JSON file in the local filesystem
// In a production environment, this would be replaced with a database
const RESULTS_DIR = path.join(process.cwd(), 'data');
const RESULTS_FILE = path.join(RESULTS_DIR, 'quiz-results.json');

// Ensure the data directory exists
try {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  if (!fs.existsSync(RESULTS_FILE)) {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify([], null, 2));
  }
} catch (error) {
  console.error('Error initializing quiz results storage:', error);
}

// Quiz result interface
interface QuizResult {
  id: string;
  userId: string;
  topic: string;
  topics?: string[]; // Add support for multiple topics
  difficulty: string;
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  date: string;
  questionResults: {
    question: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    topicArea?: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.topic && !data.topics) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create a new result with an ID
    const result: QuizResult = {
      id: Date.now().toString(),
      userId: data.userId || 'anonymous',
      topic: data.topic,
      topics: data.topics,
      difficulty: data.difficulty,
      score: data.score,
      totalQuestions: data.totalQuestions,
      timeSpent: data.timeSpent || 0,
      date: new Date().toISOString(),
      questionResults: data.questionResults
    };
    
    // Load existing results
    let results: QuizResult[] = [];
    try {
      const fileContent = fs.readFileSync(RESULTS_FILE, 'utf8');
      results = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading quiz results:', error);
    }
    
    // Add new result
    results.push(result);
    
    // Save updated results
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    
    // Return success with the created result
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return NextResponse.json({ 
      error: 'Failed to save quiz result',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameter (if provided)
    const userId = request.nextUrl.searchParams.get('userId') || 'anonymous';
    
    // Load results
    let results: QuizResult[] = [];
    try {
      const fileContent = fs.readFileSync(RESULTS_FILE, 'utf8');
      results = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading quiz results:', error);
    }
    
    // Filter results by user ID if provided
    if (userId !== 'all') {
      results = results.filter(result => result.userId === userId);
    }
    
    // Return results
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error retrieving quiz results:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve quiz results',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 