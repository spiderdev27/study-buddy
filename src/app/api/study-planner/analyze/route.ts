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
    
    // Handle the file based on its type
    let fileContent = '';
    const fileType = syllabusFile.type;
    
    if (fileType.includes('image/')) {
      // For image files, convert to base64 and send to Gemini Vision model
      const fileBuffer = await syllabusFile.arrayBuffer();
      const fileBase64 = Buffer.from(fileBuffer).toString('base64');
      
      // Use Gemini Vision to extract text from image
      const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const visionResult = await visionModel.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: 'Extract all text from this image of a syllabus or course curriculum. Return it as plain text, preserving the structure as much as possible.' },
            { inlineData: { 
                mimeType: fileType,
                data: fileBase64
              } 
            }
          ]
        }]
      });
      
      fileContent = visionResult.response.text();
    } else if (fileType.includes('pdf')) {
      // For PDF files, we need to extract text before sending to Gemini
      // In a real implementation, you would use a PDF parsing library
      fileContent = `PDF file uploaded: ${syllabusFile.name}. 
                    Since PDF parsing requires additional libraries, we're proceeding with a basic analysis.
                    Please implement proper PDF parsing in production.`;
    } else {
      // For text files, Word docs, etc., just read as text
      fileContent = await syllabusFile.text();
    }
    
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
      3. Prioritize topics (high, medium, low) based on complexity and importance
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
    
    // Initialize the Gemini 2.0 Flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Generate the study plan with structured output format
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    });
    
    const response = await result.response;
    let jsonResult;
    
    try {
      // First try to get JSON directly if the model returned JSON format
      const text = response.text();
      jsonResult = JSON.parse(text);
    } catch (error) {
      console.error("Error parsing direct JSON response:", error);
      
      // Fallback: try to extract JSON from markdown code blocks
      const textResult = response.text();
      try {
        const jsonMatch = textResult.match(/```json\n([\s\S]*)\n```/) || 
                          textResult.match(/```\n([\s\S]*)\n```/) ||
                          [null, textResult];
                          
        jsonResult = JSON.parse(jsonMatch[1] || textResult);
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        return NextResponse.json(
          { error: 'Failed to parse AI response', raw: textResult },
          { status: 500 }
        );
      }
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