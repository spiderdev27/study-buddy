import { NextRequest, NextResponse } from 'next/server';
// Remove authentication requirement
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK with the API key
const genAI = new GoogleGenerativeAI('AIzaSyDHtjSriBY4qmggRkfE4I-kQQg1j5ZBRpI');

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
    
    // Remove authentication check
    // Check authentication
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // Extract data from the request body
    let requestData;
    
    try {
      requestData = await req.json();
      console.log("Request data parsed successfully");
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
    
    console.log(`Study progress - completed: ${completedTopics.length}, in-progress: ${inProgressTopics.length}, pending: ${pendingTopics.length}`);
    console.log(`Deadline: ${deadline}, Daily hours: ${dailyHours}, Overall progress: ${progress}%`);
    
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
      // Initialize the Gemini 2.0 Flash model
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      
      console.log(`Sending request to Gemini API using ${GEMINI_MODEL}`);
      // Generate the recommendations
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      });
      
      console.log("Received response from Gemini API");
      const response = await result.response;
      let jsonResult;
      
      try {
        // First try to get JSON directly
        const text = response.text();
        console.log("Parsing JSON response");
        jsonResult = JSON.parse(text);
        console.log("Successfully parsed JSON response");
      } catch (error) {
        console.error("Error parsing direct JSON response:", error);
        
        // Fallback approach
        const textResult = response.text();
        console.log("Attempting to extract JSON from text response");
        try {
          const jsonMatch = textResult.match(/```json\n([\s\S]*)\n```/) || 
                            textResult.match(/```\n([\s\S]*)\n```/) ||
                            [null, textResult];
                            
          jsonResult = JSON.parse(jsonMatch[1] || textResult);
          console.log("Successfully extracted JSON from text response");
        } catch (parseError) {
          console.error("Error parsing Gemini response:", parseError);
          console.log("Using default recommendations");
          // If all else fails, provide default recommendations
          jsonResult = {
            recommendations: defaultRecommendations
          };
        }
      }
      
      // Ensure we have recommendations
      if (!jsonResult.recommendations || !Array.isArray(jsonResult.recommendations) || jsonResult.recommendations.length === 0) {
        console.log("Invalid response structure (missing recommendations array), using defaults");
        jsonResult.recommendations = defaultRecommendations;
      }
      
      // Return the recommendations
      console.log("Returning successful response");
      return NextResponse.json(jsonResult);
      
    } catch (aiError) {
      console.error("Error calling Gemini API:", aiError);
      console.log("Using default recommendations due to API error");
      return NextResponse.json({ 
        recommendations: defaultRecommendations 
      });
    }
    
  } catch (error) {
    console.error("Error generating recommendations:", error);
    console.log("Using default recommendations due to unexpected error");
    return NextResponse.json({ 
      recommendations: defaultRecommendations 
    });
  }
} 