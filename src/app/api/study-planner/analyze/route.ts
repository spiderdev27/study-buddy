import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK with your API key
// Note: In production, this should be stored in environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    // Extract data from the request body
    const data = await req.formData();
    
    // Get the syllabus file from the form data
    const syllabusFile = data.get('syllabus') as File;
    
    // If no file is provided, return an error
    if (!syllabusFile) {
      return NextResponse.json(
        { error: 'No syllabus file provided' },
        { status: 400 }
      );
    }
    
    // Get other parameters
    const deadline = data.get('deadline') as string;
    const dailyHours = data.get('dailyHours') as string;
    
    // Convert the file to text
    const fileContent = await syllabusFile.text();
    
    // Create a prompt for Gemini to analyze the syllabus
    const prompt = `
      You are an expert study planner. Analyze the following syllabus and create a detailed study plan.
      
      SYLLABUS:
      ${fileContent}
      
      DEADLINE: ${deadline}
      DAILY STUDY HOURS: ${dailyHours} hours
      
      Create a study plan with the following structure:
      1. Break down the syllabus into main topics and subtopics
      2. Estimate the time needed for each topic (in hours)
      3. Prioritize topics (high, medium, low)
      4. Create a day-by-day schedule from today until the deadline
      5. Include recommendations for optimal learning
      
      Format your response as JSON with the following structure:
      {
        "topics": [
          {
            "title": "Topic name",
            "description": "Brief description",
            "duration": number_of_hours,
            "priority": "high|medium|low",
            "subtopics": [
              {
                "title": "Subtopic name",
                "duration": number_of_minutes
              }
            ]
          }
        ],
        "schedule": [
          {
            "date": "YYYY-MM-DD",
            "topics": ["Topic 1", "Topic 2"]
          }
        ],
        "recommendations": [
          "Recommendation 1",
          "Recommendation 2"
        ]
      }
    `;
    
    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Generate the study plan
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResult = response.text();
    
    // Parse the JSON response
    let jsonResult;
    try {
      // Extract JSON from the response (Gemini might wrap it in markdown code blocks)
      const jsonMatch = textResult.match(/```json\n([\s\S]*)\n```/) || 
                        textResult.match(/```\n([\s\S]*)\n```/) ||
                        [null, textResult];
                        
      jsonResult = JSON.parse(jsonMatch[1] || textResult);
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: textResult },
        { status: 500 }
      );
    }
    
    // Return the study plan
    return NextResponse.json(jsonResult);
    
  } catch (error) {
    console.error("Error in study planner API:", error);
    return NextResponse.json(
      { error: 'Failed to analyze syllabus' },
      { status: 500 }
    );
  }
} 