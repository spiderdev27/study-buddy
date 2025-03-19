import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK with the correct API key
const genAI = new GoogleGenerativeAI('AIzaSyCRuP-Osv8yVY3Z2kYLiUD2IKrqHPerRFg');

// Define the Gemini model to use - Using Gemini 2.0 Flash specifically as requested
const GEMINI_MODEL = 'gemini-2.0-flash';

// Set a timeout for Gemini API requests (30 seconds)
const API_TIMEOUT = 30000;

// Create a fallback study plan to use when API fails
const createFallbackStudyPlan = (syllabusName: string) => {
  const today = new Date();
  const defaultTopics = [
    {
      title: "Mathematics Foundations",
      description: "Core mathematical concepts required for the course",
      duration: 4,
      priority: "high",
      subtopics: [
        { title: "Algebra Fundamentals", duration: 60 },
        { title: "Calculus Basics", duration: 90 },
        { title: "Probability Theory", duration: 60 }
      ]
    },
    {
      title: "Physics Principles",
      description: "Essential physics concepts and formulas",
      duration: 3,
      priority: "medium",
      subtopics: [
        { title: "Classical Mechanics", duration: 60 },
        { title: "Electricity and Magnetism", duration: 60 },
        { title: "Modern Physics", duration: 60 }
      ]
    },
    {
      title: "Computer Science Fundamentals",
      description: "Core computer science topics and programming concepts",
      duration: 5,
      priority: "high",
      subtopics: [
        { title: "Data Structures", duration: 90 },
        { title: "Algorithms", duration: 90 },
        { title: "Object-Oriented Programming", duration: 60 },
        { title: "Database Fundamentals", duration: 60 }
      ]
    }
  ];
  
  // Create a simple schedule for the next 7 days
  const schedule = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Assign topics to different days
    let dayTopics = [];
    if (i % 3 === 0) {
      dayTopics.push("Mathematics Foundations");
    } else if (i % 3 === 1) {
      dayTopics.push("Physics Principles");
    } else {
      dayTopics.push("Computer Science Fundamentals");
    }
    
    schedule.push({
      date: dateStr,
      topics: dayTopics
    });
  }
  
  return {
    topics: defaultTopics,
    schedule: schedule,
    recommendations: [
      "Break down complex topics into smaller, manageable subtopics",
      "Use active recall techniques rather than passive reading",
      "Schedule regular review sessions to reinforce learning",
      "Focus on understanding concepts rather than memorizing facts",
      "Take breaks using the Pomodoro technique (25 min study, 5 min break)"
    ]
  };
};

export async function POST(req: NextRequest) {
  try {
    console.log("Starting syllabus analysis process");
    
    // Extract data from the request body
    const data = await req.formData();
    
    // Get the syllabus file from the form data
    const syllabusFile = data.get('syllabus') as File;
    
    // If no file is provided, return an error
    if (!syllabusFile) {
      console.log("No syllabus file provided");
      return NextResponse.json(
        { error: 'No syllabus file provided' },
        { status: 400 }
      );
    }
    
    console.log(`Processing syllabus file: ${syllabusFile.name}, type: ${syllabusFile.type}, size: ${syllabusFile.size} bytes`);
    
    // Get other parameters
    const deadline = data.get('deadline') as string;
    const dailyHours = data.get('dailyHours') as string;
    
    console.log(`Study parameters - deadline: ${deadline}, dailyHours: ${dailyHours}`);
    
    // Process file content in the simplest way possible
    let fileContent = '';
    try {
      if (syllabusFile.type.includes('image/')) {
        // For image files, provide a better description and guidance
        fileContent = `File uploaded: ${syllabusFile.name} (${syllabusFile.type})
                      
                      This is an image containing course or syllabus information.
                      
                      Please try to extract any visible text or content from this image and analyze it as a syllabus.
                      If you can't read specific content from the image, please analyze the syllabus based on:
                      
                      1. The filename: "${syllabusFile.name}"
                      2. Any text or information you can extract from the image
                      3. The goal of creating a comprehensive university-level study plan
                      
                      IMPORTANT GUIDELINES:
                      - DO NOT assume a specific subject area unless it's evident from the filename or image content
                      - NEVER use generic placeholders like "[Course Name]" or "[Topic X]" in your response
                      - Create specific, concrete topic titles based on whatever information you can detect
                      - If you must generate content due to limited information, generate diverse topics
                      - Each topic should have a specific title and detailed description
                      - Topics should build logically from introductory to advanced concepts
                      
                      Your goal is to create a realistic, practical study plan that accurately reflects whatever
                      content is visible in this image, without inventing a specific course or subject unless
                      it's clearly indicated by the image or filename.`;
      } else if (syllabusFile.type.includes('pdf')) {
        fileContent = `File uploaded: ${syllabusFile.name} (${syllabusFile.type})
                      
                      This is a PDF containing course or syllabus information.
                      
                      Please try to extract any text or content from this PDF and analyze it as a syllabus.
                      If you can't extract specific content, please analyze the syllabus based on:
                      
                      1. The filename: "${syllabusFile.name}"
                      2. Any hints from the filename or metadata
                      3. The goal of creating a comprehensive university-level study plan
                      
                      IMPORTANT GUIDELINES:
                      - DO NOT assume a specific subject area unless it's evident from the filename
                      - NEVER use generic placeholders like "[Course Name]" or "[Topic X]" in your response
                      - Create specific, concrete topic titles based on whatever information you can detect
                      - If you must generate content due to limited information, generate diverse topics
                      - Each topic should have a specific title and detailed description
                      - Topics should build logically from introductory to advanced concepts
                      
                      Your goal is to create a realistic, practical study plan that accurately reflects whatever
                      content is in this PDF, without inventing a specific course or subject unless
                      it's clearly indicated by the PDF name or content.`;
      } else {
        // For text files, get actual content
        fileContent = await syllabusFile.text();
      }
    } catch (error) {
      console.error("Error processing file:", error);
      fileContent = `File uploaded: ${syllabusFile.name}. Please analyze as a standard syllabus.`;
    }
    
    // Create a prompt for Gemini to analyze the syllabus
    const prompt = `
      You are an expert study planner. Analyze the following syllabus or course information and create a detailed study plan.
      
      SYLLABUS CONTENT:
      ${fileContent}
      
      DEADLINE: ${deadline}
      DAILY STUDY HOURS: ${dailyHours} hours
      
      Create a comprehensive study plan with the following structure:
      1. Break down the syllabus into main topics and subtopics
      2. Estimate the time needed for each topic (in hours)
      3. Prioritize topics (high, medium, low) based on complexity and importance
      4. Create a day-by-day schedule from today until the deadline
      5. Include specific recommendations for optimal learning
      
      IMPORTANT INSTRUCTIONS:
      - DO NOT use placeholder text like "[Course Name]" or "[Specific Topic]" - use specific, descriptive titles
      - If the syllabus doesn't specify a course name, use a descriptive title based on the content (e.g., "Introduction to Computer Science")
      - Generate concrete, realistic topics that would actually appear in a university course
      - Each topic should have a specific and descriptive title and explanation
      - For all subtopics, provide specific names that clearly describe what the student will study
      
      Format your response STRICTLY as JSON with the following structure. This is extremely important:
      {
        "topics": [
          {
            "title": "Specific topic title (no placeholders)",
            "description": "Detailed description of this topic",
            "duration": number_of_hours,
            "priority": "high|medium|low",
            "subtopics": [
              {
                "title": "Specific subtopic name (no placeholders)",
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
      
      Do NOT return any text outside of this JSON structure. The response must be valid JSON.
    `;
    
    let usingFallback = false;
    let jsonResult;
    
    try {
      console.log("Initializing Gemini 2.0 Flash model");
      console.log(`Using model: ${GEMINI_MODEL}, API version: v1`);
      
      // Initialize the Gemini model and send request directly
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json'
        }
      });
      
      console.log("Received response from Gemini API");
      
      const text = result.response.text();
      console.log("Gemini response length:", text.length);
      console.log("First 200 chars of response:", text.substring(0, 200));
      
      try {
        // Parse the response
        jsonResult = JSON.parse(text);
        console.log("Successfully parsed JSON response with topics:", jsonResult.topics?.length || 0);
        
        // Validate the response structure
        if (!jsonResult.topics || !Array.isArray(jsonResult.topics) || jsonResult.topics.length === 0) {
          console.log("Invalid response structure (missing topics array), using fallback");
          jsonResult = createFallbackStudyPlan(syllabusFile.name);
          usingFallback = true;
        }
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        // Try to clean the response and parse again
        try {
          const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
          jsonResult = JSON.parse(cleanedText);
          console.log("Successfully parsed cleaned JSON response");
          
          if (!jsonResult.topics || !Array.isArray(jsonResult.topics) || jsonResult.topics.length === 0) {
            console.log("Invalid cleaned response structure, using fallback");
            jsonResult = createFallbackStudyPlan(syllabusFile.name);
            usingFallback = true;
          }
        } catch (cleanError) {
          console.error("Error parsing cleaned JSON response:", cleanError);
          // Fallback to the default study plan
          jsonResult = createFallbackStudyPlan(syllabusFile.name);
          usingFallback = true;
        }
      }
      
      // Return the study plan with a flag indicating if it's a fallback
      console.log("Returning response, using fallback:", usingFallback);
      return NextResponse.json({
        ...jsonResult,
        is_fallback: usingFallback
      });
      
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      // Return a fallback plan
      const fallbackPlan = createFallbackStudyPlan(syllabusFile.name);
      return NextResponse.json({
        ...fallbackPlan,
        is_fallback: true
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    // Return a fallback plan for any error
    const fallbackPlan = createFallbackStudyPlan("Study Plan");
    return NextResponse.json({
      ...fallbackPlan,
      is_fallback: true
    });
  }
}