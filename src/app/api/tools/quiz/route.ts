import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    // Get the request data
    const data = await request.json();
    const { topics, topic, difficulty, numQuestions } = data;
    
    // Handle both the new topics array and legacy single topic
    const topicsToUse = topics || (topic ? [topic] : null);
    
    // Validate inputs
    if (!topicsToUse || topicsToUse.length === 0) {
      return NextResponse.json({ error: 'At least one topic is required' }, { status: 400 });
    }
    
    // Check if difficulty is valid
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return NextResponse.json({ 
        error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}` 
      }, { status: 400 });
    }
    
    console.log('Generating quiz with:', { topics: topicsToUse, difficulty, numQuestions });
    
    // Convert numQuestions to a number if it's a string
    const questionCount = typeof numQuestions === 'string' 
      ? parseInt(numQuestions) 
      : numQuestions || 5;
      
    console.log('Using question count:', questionCount);
    
    // Join multiple topics with "and" for the prompt
    const combinedTopics = topicsToUse.length > 1 
      ? topicsToUse.join(', ').replace(/,([^,]*)$/, ' and$1')
      : topicsToUse[0];
    
    // Generate the quiz
    const quiz = await generateQuiz(
      combinedTopics,
      difficulty || 'medium', 
      questionCount
    );
    
    console.log(`Generated ${quiz.length} questions for topics "${combinedTopics}"`);
    console.log('First question sample:', quiz[0]?.question);
    
    // Return the quiz
    return NextResponse.json({ success: true, quiz });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ 
      error: 'Failed to generate quiz',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 