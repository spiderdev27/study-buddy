import { NextRequest, NextResponse } from 'next/server';
import * as pdfParse from 'pdf-parse';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Add a GET endpoint for testing
export async function GET() {
  return NextResponse.json({ message: 'PDF upload endpoint is working' });
}

export async function POST(request: NextRequest) {
  console.log('Received PDF upload request');
  
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
    
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      console.error('Invalid file type');
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Size validation (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      console.error('File too large');
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    try {
      // Read and parse PDF content
      console.log('Reading file as array buffer...');
      const bytes = await file.arrayBuffer();
      console.log('Converting to buffer...');
      const buffer = Buffer.from(bytes);
      
      console.log('Parsing PDF...');
      const pdfData = await pdfParse.default(buffer);
      console.log('PDF parsed successfully');

      // Extract text and metadata
      const textContent = pdfData.text || '';
      const pageCount = pdfData.numpages || 0;
      const wordCount = textContent.split(/\s+/).filter(Boolean).length;

      console.log('Extracted data:', { pageCount, wordCount });
      
      return NextResponse.json({
        success: true,
        filename: fileName,
        pageCount,
        wordCount,
        textContent,
        metadata: {
          title: pdfData.info?.Title || fileName,
          author: pdfData.info?.Author || 'Unknown',
          creationDate: pdfData.info?.CreationDate || null,
          pageCount,
          wordCount
        }
      });
    } catch (pdfError: any) {
      console.error('Error processing PDF:', pdfError);
      return NextResponse.json(
        { error: 'Failed to process PDF file. Please ensure it is a valid PDF.' },
        { status: 422 }
      );
    }
  } catch (error: any) {
    console.error('Error handling request:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}