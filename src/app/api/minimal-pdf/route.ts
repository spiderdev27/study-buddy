export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

export async function GET() {
  return NextResponse.json({ message: "Minimal PDF endpoint is working" });
}

export async function POST(request: NextRequest) {
  console.log('PDF upload endpoint hit at minimal-pdf');
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
      
      // Save the file temporarily to analyze it
      const tempFilePath = path.join('/tmp', `upload-${Date.now()}.pdf`);
      await writeFile(tempFilePath, buffer);
      console.log(`PDF saved temporarily to ${tempFilePath}`);
      
      // Read the first few bytes to verify it's a PDF
      const header = buffer.slice(0, 5).toString();
      const isPdf = header.startsWith('%PDF-');
      
      // Basic PDF analysis without parsing
      const pdfSize = buffer.length;
      const pdfVersion = header.substring(5, 8);
      
      // Clean up the temporary file
      try {
        await unlink(tempFilePath);
        console.log(`Temporary file ${tempFilePath} deleted`);
      } catch (unlinkError) {
        console.error(`Error deleting temporary file: ${unlinkError}`);
      }
      
      if (!isPdf) {
        return NextResponse.json(
          { error: "The file does not appear to be a valid PDF" },
          { status: 400 }
        );
      }
      
      console.log(`PDF processed: ${pdfSize} bytes, version ${pdfVersion}`);

      return NextResponse.json({
        success: true,
        filename: file.name,
        size: pdfSize,
        version: pdfVersion,
        type: file.type
      });
    } catch (pdfError: any) {
      console.error('Error processing PDF:', pdfError);
      return NextResponse.json(
        { 
          error: "Failed to process PDF file",
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