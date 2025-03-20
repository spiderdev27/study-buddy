import { NextResponse } from 'next/server';
import { analyzeStudySession } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { session, task } = await req.json();

    if (!session || !task) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const analysis = await analyzeStudySession(session, task);

    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing study session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze study session' },
      { status: 500 }
    );
  }
} 