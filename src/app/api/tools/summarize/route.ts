import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { summarizeText } from '@/lib/gemini';

// POST /api/tools/summarize - Generate text summary
export async function POST(request: Request) {
  try {
    // Get the session (but don't require auth)
    const session = await getServerSession(authOptions);
    
    // Parse the request body
    const body = await request.json();
    const { text, summaryLength, summaryStyle } = body;
    
    if (!text || text.trim().length < 100) {
      return NextResponse.json(
        { error: 'Please provide at least 100 characters of text to summarize' },
        { status: 400 }
      );
    }
    
    // Use Gemini AI to generate the summary
    const summary = await summarizeText(text, {
      length: summaryLength,
      style: summaryStyle,
    });
    
    // Calculate word count
    const wordCount = text.split(/\s+/).length;
    
    // Log usage for analytics (would be expanded in a real implementation)
    console.log(`Summarize tool used: ${wordCount} words, ${summaryLength} length, ${summaryStyle} style`);
    if (session?.user?.id) {
      console.log(`User: ${session.user.id}`);
      // In a real implementation, you might save this to a database
    } else {
      console.log('User: Guest');
    }
    
    return NextResponse.json({
      summary,
      wordCount,
      success: true
    });
  } catch (error) {
    console.error('Error in summarize API:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
} 