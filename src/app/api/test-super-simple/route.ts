import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ message: 'Super simple test endpoint is working' });
}

export async function POST(request: NextRequest) {
  console.log('Received POST request to super simple endpoint');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof Blob)) {
      console.error('No file provided or invalid file');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Basic file validation
    const fileName = file instanceof File ? file.name : 'unknown';
    console.log('File received:', fileName);
    
    // Return success with basic file info
    return NextResponse.json({
      success: true,
      message: 'File received successfully',
      filename: fileName,
      size: file.size,
      type: file.type
    });
  } catch (error: any) {
    console.error('Error handling request:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 