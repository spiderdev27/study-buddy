export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Super simple PDF endpoint is working" });
}

export async function POST(request: NextRequest) {
  console.log('PDF upload endpoint hit at super-simple-pdf');
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file provided');
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Simple validation that it's a PDF
    if (file.type !== 'application/pdf') {
      console.error('File is not a PDF');
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Size validation (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      console.error('File too large');
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Return file details without processing the PDF content
    return NextResponse.json({
      success: true,
      filename: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 