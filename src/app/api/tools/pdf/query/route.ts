import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

// Initialize the Google Generativeai with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/tools/pdf/query - Ask questions about a PDF
export async function POST(request: Request) {
  try {
    // Get the session (but don't require auth)
    const session = await getServerSession(authOptions);
    
    console.log('PDF query endpoint hit');
    
    // Parse the request body
    const body = await request.json();
    const { query, pdfText, filename } = body;
    
    console.log('Query received:', query?.substring(0, 100));
    console.log('PDF text length:', pdfText?.length || 0);
    
    if (!query?.trim()) {
      console.log('Error: No query provided');
      return NextResponse.json(
        { error: 'No query provided' },
        { status: 400 }
      );
    }
    
    if (!pdfText?.trim()) {
      console.log('Error: No PDF content provided');
      return NextResponse.json(
        { error: 'No PDF content provided' },
        { status: 400 }
      );
    }
    
    console.log('Processing query for PDF:', filename);
    console.log('Query:', query.substring(0, 100) + (query.length > 100 ? '...' : ''));
    
    // Create a more specific prompt to focus on the PDF content
    const processedQuery = `Based on the following PDF content, please answer this question: "${query}"

PDF Content:
${pdfText.substring(0, 14000)}  // Taking first ~14K chars to stay within token limits

Please answer the question based ONLY on the information provided in the PDF. If the PDF doesn't contain relevant information to answer the question, please say so clearly. Format your answer in markdown for readability.`;
    
    // Use Gemini to generate a response
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        apiVersion: "v1",
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        }
      });
      
      console.log('Sending request to Gemini AI...');
      console.log('Using model: gemini-2.0-flash, API version: v1');
      
      const result = await model.generateContent({
        contents: [{ 
          parts: [{ text: processedQuery }]
        }]
      });
      
      const responseText = result.response.text();
      
      // Log usage
      console.log('Gemini AI response received');
      console.log('Response length:', responseText.length);
      console.log(`Query processed for PDF: ${filename || 'Unknown'}`);
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
    console.error('Error querying PDF:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process your question about the PDF',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 