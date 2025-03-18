import { NextRequest, NextResponse } from 'next/server';

// No export of dynamic or runtime to avoid any potential issues

export async function GET() {
  return NextResponse.json({ message: 'Direct PDF test endpoint is working' });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      filename: file instanceof File ? file.name : 'unknown',
      size: file.size,
      type: file.type || 'application/octet-stream'
    });
  } catch (error: any) {
    console.error('Direct PDF test error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 