export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
// Try a different import approach
import pdfParse from 'pdf-parse';

export async function GET() {
  return NextResponse.json({ message: "PDF parse test endpoint is working" });
}

export async function POST(request: NextRequest) {
  console.log('PDF upload endpoint hit at pdf-parse-test');
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

    try {
      // Read and parse PDF content
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      console.log('Processing PDF data...');
      
      // Use the imported pdfParse directly
      const pdfData = await pdfParse(buffer);

      // Extract text and metadata
      const textContent = pdfData.text || '';
      const pageCount = pdfData.numpages || 0;
      const wordCount = textContent.split(/\s+/).filter(Boolean).length;
      console.log(`PDF processed: ${pageCount} pages, ${wordCount} words`);

      return NextResponse.json({
        success: true,
        filename: file.name,
        pageCount,
        wordCount,
        textContent: textContent.substring(0, 1000) + (textContent.length > 1000 ? '...' : ''),
        metadata: {
          title: pdfData.info?.Title || file.name,
          author: pdfData.info?.Author || 'Unknown',
          creationDate: pdfData.info?.CreationDate || null,
        }
      });
    } catch (pdfError: any) {
      console.error('Error processing PDF:', pdfError);
      return NextResponse.json(
        { error: "Failed to process PDF file. Please ensure it is a valid PDF." },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 