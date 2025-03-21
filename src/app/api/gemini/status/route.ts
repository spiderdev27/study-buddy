import { NextResponse } from 'next/server';

// Simple API status check endpoint
export async function GET() {
  // Use the API key directly to ensure it works
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyCRuP-Osv8yVY3Z2kYLiUD2IKrqHPerRFg';
  
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { 
        status: 'error',
        message: 'API key not configured'
      }, 
      { status: 500 }
    );
  }
  
  try {
    // Log the API key being used (first few characters for debugging)
    console.log("Status check using API key:", GEMINI_API_KEY.substring(0, 10) + "...");
    
    // Minimal test request to Gemini API - using the flash model
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash?key=${GEMINI_API_KEY}`;
    const response = await fetch(testUrl);
    
    if (response.ok) {
      return NextResponse.json(
        { 
          status: 'connected',
          message: 'Successfully connected to Gemini 2.0 Flash API'
        }
      );
    } else {
      const errorData = await response.json();
      console.error("Status check error:", errorData);
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Failed to connect to Gemini API',
          error: errorData
        }, 
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error checking Gemini API status:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'An error occurred while checking API status'
      }, 
      { status: 500 }
    );
  }
} 