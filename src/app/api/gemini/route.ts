import { NextRequest, NextResponse } from 'next/server';
import { GeminiRequest } from '@/services/gemini';

// Get API key and URL from environment variables - using the provided key directly
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyCRuP-Osv8yVY3Z2kYLiUD2IKrqHPerRFg';
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      console.error("Missing Gemini API key in environment variables");
      return NextResponse.json(
        { error: "API configuration error. Please check server configuration." },
        { status: 500 }
      );
    }
    
    console.log("Using Gemini API Key:", GEMINI_API_KEY.substring(0, 10) + "...");
    console.log("Using Gemini model: gemini-2.0-flash");
    
    // Extract request body
    const body: GeminiRequest = await request.json();
    
    // Validate request
    if (!body || !body.contents || body.contents.length === 0) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }
    
    // Add API key to the URL
    const apiUrlWithKey = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    
    // Make request to Google Gemini API
    const response = await fetch(apiUrlWithKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    // Handle API response
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from Gemini API", details: errorData },
        { status: response.status }
      );
    }
    
    // Return successful response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 