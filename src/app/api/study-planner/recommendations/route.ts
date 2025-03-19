import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract data from the request body
    const { 
      completedTopics, 
      inProgressTopics, 
      pendingTopics, 
      deadline, 
      dailyHours,
      progress
    } = await req.json();
    
    // Create a prompt for Gemini to generate personalized recommendations
    const prompt = `
      You are an expert study advisor. Based on the following information about a student's study progress,
      provide personalized recommendations to help them study more effectively.
      
      COMPLETED TOPICS: ${JSON.stringify(completedTopics)}
      IN-PROGRESS TOPICS: ${JSON.stringify(inProgressTopics)}
      PENDING TOPICS: ${JSON.stringify(pendingTopics)}
      DEADLINE: ${new Date(deadline).toLocaleDateString()}
      DAILY STUDY HOURS: ${dailyHours} hours
      OVERALL PROGRESS: ${Math.round(progress)}%
      
      Generate 3-5 practical, specific recommendations that will help the student optimize their study plan.
      Focus on time management, learning techniques, prioritization, and mental wellbeing.
      
      Return ONLY an array of recommendation strings in JSON format:
      {
        "recommendations": ["Recommendation 1", "Recommendation 2", ...]
      }
    `;
    
    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
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
    
    const response = await result.response;
    let jsonResult;
    
    try {
      // First try to get JSON directly
      const text = response.text();
      jsonResult = JSON.parse(text);
    } catch (error) {
      console.error("Error parsing direct JSON response:", error);
      
      // Fallback approach
      const textResult = response.text();
      try {
        const jsonMatch = textResult.match(/```json\n([\s\S]*)\n```/) || 
                          textResult.match(/```\n([\s\S]*)\n```/) ||
                          [null, textResult];
                          
        jsonResult = JSON.parse(jsonMatch[1] || textResult);
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        
        // If all else fails, provide default recommendations
        jsonResult = {
          recommendations: [
            "Focus on completing one topic at a time rather than working on multiple topics simultaneously.",
            "Use active recall techniques instead of passive reading for better retention.",
            "Take regular breaks using the Pomodoro technique (25 min study, 5 min break).",
            "Review completed topics periodically to strengthen your memory.",
            "Prioritize high-priority topics that are foundational for other subjects."
          ]
        };
      }
    }
    
    // Return the recommendations
    return NextResponse.json(jsonResult);
    
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
} 