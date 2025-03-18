import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFile } from 'fs/promises';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/tools/pdf/direct-query - Ask questions about a PDF by sending directly to Gemini
export async function POST(request: Request) {
  try {
    // Get the session (but don't require auth)
    const session = await getServerSession(authOptions);
    
    console.log('Direct PDF query endpoint hit');
    
    // Since we're using FormData, we need to parse it differently
    const formData = await request.formData();
    const query = formData.get('query') as string;
    const file = formData.get('file') as File;
    
    console.log('Query received:', query?.substring(0, 100));
    console.log('File received:', file?.name, file?.size);
    
    if (!query?.trim()) {
      console.log('Error: No query provided');
      return NextResponse.json(
        { error: 'No query provided' },
        { status: 400 }
      );
    }
    
    if (!file) {
      console.log('Error: No file provided');
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }
    
    console.log('Processing query for PDF:', file.name);
    console.log('Query:', query.substring(0, 100) + (query.length > 100 ? '...' : ''));
    
    try {
      // Save file to temporary location
      const tempFilePath = path.join(os.tmpdir(), `upload-${Date.now()}.pdf`);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(tempFilePath, buffer);
      console.log('File saved temporarily at:', tempFilePath);
      
      // Use Gemini Pro Vision to analyze the PDF
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        apiVersion: "v1",
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        }
      });
      
      // Read the file as buffer for direct upload
      const fileData = await fs.readFile(tempFilePath);
      
      console.log('Sending request to Gemini AI...');
      console.log('Using model: gemini-2.0-flash, API version: v1');
      
      // Create data parts with file
      const fileBase64 = fileData.toString('base64');
      
      // Create prompt including the file and query
      const result = await model.generateContent({
        contents: [{ 
          parts: [
            { text: `This is a PDF document. Please analyze it and answer this question: ${query}` },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: fileBase64
              }
            }
          ]
        }]
      });
      
      const responseText = result.response.text();
      
      // Clean up temporary file
      await fs.unlink(tempFilePath);
      console.log('Temporary file deleted:', tempFilePath);
      
      // Log usage
      console.log('Gemini AI response received');
      console.log('Response length:', responseText.length);
      console.log(`Direct query processed for PDF: ${file.name || 'Unknown'}`);
      console.log(`User: ${session?.user?.id || 'Guest'}`);
      
      return NextResponse.json({
        success: true,
        query,
        answer: responseText
      });
    } catch (aiError: any) {
      console.error('Error from Gemini AI:', aiError);
      console.error('Error details:', aiError.message);
      
      // Check for specific API errors
      if (aiError.message?.includes('not found for API version')) {
        console.error('API version or model error detected');
        return NextResponse.json(
          { 
            error: 'AI model configuration error. Please contact support.',
            details: process.env.NODE_ENV === 'development' ? aiError.message : undefined
          },
          { status: 500 }
        );
      }
      
      throw aiError; // Rethrow for general error handling
    }
  } catch (error: any) {
    console.error('Error in direct PDF query:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process your question about the PDF',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 