import { NextResponse } from 'next/server';

// Simple test endpoint to check if PDF Query API is working
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Test PDF API received request:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Test PDF API is working',
      receivedData: body
    });
  } catch (error: any) {
    console.error('Error in test PDF API:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process test request',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test PDF API GET endpoint is working'
  });
} 