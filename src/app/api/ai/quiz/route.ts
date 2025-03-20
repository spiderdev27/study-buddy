import { NextResponse } from 'next/server';
import { generatePracticeQuestions } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { subject, topic, count = 3 } = await req.json();

    if (!subject || !topic) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const questions = await generatePracticeQuestions(subject, topic, count);

    return NextResponse.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate quiz questions' },
      { status: 500 }
    );
  }
} 