import { NextResponse } from 'next/server';
import { generateStudySchedule } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { tasks, availableHours } = await req.json();

    if (!tasks || !availableHours) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tasks must be a non-empty array' },
        { status: 400 }
      );
    }

    const schedule = await generateStudySchedule(tasks, availableHours);

    return NextResponse.json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Error generating study schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate study schedule' },
      { status: 500 }
    );
  }
} 