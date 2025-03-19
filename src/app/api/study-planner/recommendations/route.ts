import { NextRequest, NextResponse } from 'next/server';
// Remove authentication requirement
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK with the correct API key
const genAI = new GoogleGenerativeAI('AIzaSyCRuP-Osv8yVY3Z2kYLiUD2IKrqHPerRFg');

// Define the Gemini model to use - Using Gemini 2.0 Flash specifically as requested
const GEMINI_MODEL = 'gemini-2.0-flash';

// Default recommendations to use as fallback
const defaultRecommendations = [
  "Focus on completing one topic at a time rather than working on multiple topics simultaneously.",
  "Use active recall techniques instead of passive reading for better retention.",
  "Take regular breaks using the Pomodoro technique (25 min study, 5 min break).",
  "Review completed topics periodically to strengthen your memory.",
  "Prioritize high-priority topics that are foundational for other subjects."
];

export async function POST(req: NextRequest) {
  try {
    console.log("Starting recommendations generation process");
    
    // Extract data from the request body
    let requestData;
    
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return NextResponse.json({ 
        recommendations: defaultRecommendations 
      });
    }
    
    // Extract study data
    const { 
      completedTopics = [], 
      inProgressTopics = [], 
      pendingTopics = [], 
      deadline, 
      dailyHours = 2,
      progress = 0
    } = requestData;
    
    // Create a prompt for Gemini to generate personalized recommendations
    const prompt = `
      You are an expert study advisor. Based on the following information about a student's study progress,
      provide personalized recommendations to help them study more effectively.
      
      COMPLETED TOPICS: ${JSON.stringify(completedTopics)}
      IN-PROGRESS TOPICS: ${JSON.stringify(inProgressTopics)}
      PENDING TOPICS: ${JSON.stringify(pendingTopics)}
      DEADLINE: ${deadline ? new Date(deadline).toLocaleDateString() : 'Not specified'}
      DAILY STUDY HOURS: ${dailyHours} hours
      OVERALL PROGRESS: ${Math.round(progress)}%
      
      Generate 3-5 practical, specific recommendations that will help the student optimize their study plan.
      Focus on time management, learning techniques, prioritization, and mental wellbeing.
      
      Return ONLY an array of recommendation strings in JSON format:
      {
        "recommendations": ["Recommendation 1", "Recommendation 2", ...]
      }
    `;
    
    try {
      console.log("Initializing Gemini 2.0 Flash model");
      console.log(`Using model: ${GEMINI_MODEL}, API version: v1`);
      
      // Initialize the Gemini model and send request directly
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      });
      
      console.log("Received response from Gemini API");
      
      const text = result.response.text();
      let jsonResult;
      
      try {
        // Parse the response
        jsonResult = JSON.parse(text);
        
        // Ensure we have recommendations
        if (!jsonResult.recommendations || !Array.isArray(jsonResult.recommendations) || jsonResult.recommendations.length === 0) {
          jsonResult.recommendations = defaultRecommendations;
        }
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        // Fallback to default recommendations
        jsonResult = {
          recommendations: defaultRecommendations
        };
      }
      
      // Return the recommendations
      return NextResponse.json(jsonResult);
      
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      // Return default recommendations
      return NextResponse.json({ 
        recommendations: defaultRecommendations 
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    // Return default recommendations for any error
    return NextResponse.json({ 
      recommendations: defaultRecommendations 
    });
  }
} 