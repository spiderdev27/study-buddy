export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "PDF.js dist endpoint is working" });
}

export async function POST(request: NextRequest) {
  console.log('PDF upload endpoint hit at pdf-js-dist');
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
      // Read file data
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      console.log('Processing PDF data...', buffer.length, 'bytes');
      
      // Dynamically import pdfjs-dist
      console.log('Dynamically importing pdfjs-dist...');
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      
      // Load the PDF document
      console.log('Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdfDocument = await loadingTask.promise;
      
      // Get metadata and page count
      console.log('Getting PDF metadata...');
      const metadata = await pdfDocument.getMetadata();
      const pageCount = pdfDocument.numPages;
      
      // Extract text from the first page
      console.log('Extracting text from first page...');
      const page = await pdfDocument.getPage(1);
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: any) => item.str).join(' ');
      
      // Count words
      const wordCount = textItems.split(/\s+/).filter(Boolean).length;
      
      console.log(`PDF processed: ${pageCount} pages, ${wordCount} words`);

      return NextResponse.json({
        success: true,
        filename: file.name,
        pageCount,
        wordCount,
        textContent: textItems.substring(0, 1000) + (textItems.length > 1000 ? '...' : ''),
        metadata: {
          title: metadata?.info?.Title || file.name,
          author: metadata?.info?.Author || 'Unknown',
          creationDate: metadata?.info?.CreationDate || null,
        }
      });
    } catch (pdfError: any) {
      console.error('Error processing PDF:', pdfError);
      return NextResponse.json(
        { 
          error: "Failed to process PDF file. Please ensure it is a valid PDF.",
          details: pdfError.message,
          stack: pdfError.stack
        },
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