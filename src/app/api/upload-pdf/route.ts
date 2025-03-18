import { NextRequest, NextResponse } from 'next/server';
import * as pdfParse from 'pdf-parse';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('PDF upload endpoint hit');
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Basic file validation
    const fileName = file instanceof File ? file.name : 'unknown';
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Size validation (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    try {
      // Read and parse PDF content
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const pdfData = await pdfParse.default(buffer);

      // Extract text and metadata
      const textContent = pdfData.text || '';
      const pageCount = pdfData.numpages || 0;
      const wordCount = textContent.split(/\s+/).filter(Boolean).length;

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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 