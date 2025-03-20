import { NextResponse } from 'next/server';
import { generateStudySuggestions } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { subject, topic, duration } = await req.json();

    if (!subject || !topic || !duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const suggestions = await generateStudySuggestions(subject, topic, duration);

    return NextResponse.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
} 