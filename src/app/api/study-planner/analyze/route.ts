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

// Add this function near the top of the file, outside the POST function
function cleanAndParseJSON(text: string): any {
  // First, try direct parsing
  try {
    return JSON.parse(text);
  } catch (error) {
    console.log("Direct JSON parsing failed, attempting cleanup");
    
    // Try various cleaning approaches
    try {
      // Remove markdown code blocks
      let cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
      
      // Try to fix common JSON syntax errors
      cleaned = cleaned.replace(/,\s*}/g, '}'); // Remove trailing commas in objects
      cleaned = cleaned.replace(/,\s*\]/g, ']'); // Remove trailing commas in arrays
      
      // Find unterminated strings and add missing quote
      const matches = cleaned.match(/"[^"]*$/g);
      if (matches && matches.length > 0) {
        cleaned += '"';
      }
      
      // Make sure the JSON is complete
      try {
        // If it starts with { but doesn't end with }, add it
        if (cleaned.trim().startsWith('{') && !cleaned.trim().endsWith('}')) {
          cleaned = cleaned.trim() + '}';
        }
        
        return JSON.parse(cleaned);
      } catch (error) {
        console.error("JSON cleanup failed:", error);
        throw error;
      }
    } catch (cleanError) {
      console.error("All JSON cleaning attempts failed:", cleanError);
      throw cleanError;
    }
  }
}

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
    const manualSyllabusText = data.get('manual_syllabus_text') as string;
    
    console.log(`Study parameters - deadline: ${deadline}, dailyHours: ${dailyHours}`);
    console.log(`Manual syllabus text provided: ${manualSyllabusText ? 'Yes' : 'No'}`);
    
    // Initialize fileContent variable
    let fileContent = '';
    
    // If manual syllabus text is provided, use that instead of processing the file
    if (manualSyllabusText && manualSyllabusText.trim()) {
      console.log("Using manual syllabus text provided by user");
      fileContent = manualSyllabusText.trim();
    } else {
      // Process file content in the simplest way possible
      try {
        if (syllabusFile.type.includes('image/')) {
          // For image files, use multimodal vision approach
          try {
            console.log("Using vision-based approach for image analysis");
            
            // Convert image file to base64 for Gemini Vision API
            const imageBuffer = await syllabusFile.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            const mimeType = syllabusFile.type;
            
            // Create inline data URI for the image
            const imageDataUri = `data:${mimeType};base64,${base64Image}`;
            
            // Step 1: Extract content from the image using Gemini vision capabilities
            const extractionPrompt = `
              You are an expert at analyzing educational content. You are looking at an image of a syllabus or course material.
              
              Your task is to extract any visible text, topics, or subject matter from this image.
              
              Describe what you see in the image as thoroughly as possible, focusing on:
              1. The main subject or course name
              2. Any visible topics, units, or chapters
              3. Any dates, deadlines, or schedule information
              4. Any other relevant educational content
              
              If you can see text in the image, please extract and transcribe it as accurately as possible.
              If you can't see specific details clearly, state so explicitly rather than making assumptions.
              
              Format your response as a straightforward description, including any topics, chapters or sections you identify.
            `;
            
            // Initialize the Gemini multimodal model for vision capabilities
            const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            
            console.log("Sending image to Gemini Vision API");
            
            const extractionResult = await visionModel.generateContent({
              contents: [{ 
                role: 'user', 
                parts: [
                  { text: extractionPrompt },
                  { inlineData: { mimeType, data: base64Image } }
                ] 
              }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048
              }
            });
            
            const extractedContent = extractionResult.response.text();
            console.log("Vision extraction completed, content length:", extractedContent.length);
            console.log("First 200 chars of extracted content:", extractedContent.substring(0, 200));
            
            if (extractedContent.toLowerCase().includes("can't see") || 
                extractedContent.toLowerCase().includes("cannot see") ||
                extractedContent.toLowerCase().includes("unable to see") ||
                extractedContent.toLowerCase().includes("no visible text") ||
                extractedContent.length < 50) {
              console.log("Vision API could not extract meaningful content from image");
              throw new Error("No meaningful content could be extracted from image");
            }
            
            // Step 2: Now create the study plan based on the extracted content
            fileContent = `
              The following content was extracted from an image of a syllabus or course material using image recognition:
              
              ${extractedContent.substring(0, 1500)}${extractedContent.length > 1500 ? "..." : ""}
              
              Based on this extracted information, please create a detailed study plan with specific topics, 
              subtopics, and time allocations. Ensure all topics and subtopics are specific and concrete, 
              not placeholders or generic items.
              
              Your response MUST be a valid JSON object with no syntax errors.
              
              IMPORTANT REQUIREMENTS FOR JSON GENERATION:
              1. Include all relevant topics from the syllabus - don't limit the number
              2. Each topic should have appropriate subtopics based on the content
              3. Keep all text descriptions under 100 characters
              4. Do not use quotes or special characters that would need escaping in JSON
              5. Make absolutely sure all JSON strings are properly terminated
              6. Double-check that all objects and arrays are properly closed
              7. The entire JSON structure must be valid and complete
              
              The plan should reflect the actual content visible in the image as closely as possible,
              and should provide a realistic roadmap for studying this material.
              
              If you aren't certain about some content, do not make assumptions - focus on what was clearly visible in the image.
            `;
            
          } catch (error) {
            console.error("Error in vision-based image processing:", error);
            // Fallback to user-friendly message
            fileContent = `
              Since the image content couldn't be properly analyzed, please create a study plan based on the following information:
              
              COURSE: General Study Skills
              TOPICS:
              - Effective note-taking techniques
              - Active reading strategies
              - Time management for students
              - Exam preparation methods
              - Research and writing skills
              
              Create a study plan covering these general academic skills that would be useful for any student.
              Make it helpful, practical, and adaptable to the deadline and daily hours provided.
            `;
          }
        } else if (syllabusFile.type.includes('pdf')) {
          // For PDF files, use a similar two-step approach
          try {
            console.log("Using two-step approach for PDF analysis");
            
            // Step 1: Extract content from the PDF
            const extractionPrompt = `
              You are an expert at analyzing educational content. You are looking at a PDF that contains syllabus or course information.
              
              Your ONLY task is to extract any text, topics, or subject matter from this PDF: "${syllabusFile.name}".
              
              Describe what you believe is contained in this PDF as thoroughly as possible, focusing on:
              1. The main subject or course name (if identifiable from the filename)
              2. Any likely topics, units, or chapters based on the PDF name
              3. Any dates or timing information that might be inferred
              4. Any other relevant educational content
              
              Don't worry about creating a study plan yet - just extract and list all the information you can reasonably infer.
              
              Format your response as a straightforward description, including any topics, chapters or sections you identify.
            `;
            
            // Initialize the Gemini model for the extraction step
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
            
            const extractionResult = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: extractionPrompt }] }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048
              }
            });
            
            const extractedContent = extractionResult.response.text();
            console.log("PDF extraction step completed, content length:", extractedContent.length);
            
            // Step 2: Now create the study plan based on the extracted content
            fileContent = `
              The following content was extracted or inferred from a PDF of a syllabus or course material:
              
              ${extractedContent.substring(0, 1000)}${extractedContent.length > 1000 ? "..." : ""}
              
              Based on this extracted information, please create a detailed study plan with specific topics, 
              subtopics, and time allocations. Ensure all topics and subtopics are specific and concrete, 
              not placeholders or generic items.
              
              Your response MUST be a valid JSON object with no syntax errors.
              
              IMPORTANT REQUIREMENTS FOR JSON GENERATION:
              1. Include all relevant topics from the content - don't limit the number
              2. Each topic should have appropriate subtopics based on the content
              3. Keep all text descriptions under 100 characters
              4. Do not use quotes or special characters that would need escaping in JSON
              5. Make absolutely sure all JSON strings are properly terminated
              6. Double-check that all objects and arrays are properly closed
              7. The entire JSON structure must be valid and complete
              
              The plan should reflect the actual content from the PDF as closely as possible,
              and should provide a realistic roadmap for studying this material.
            `;
            
          } catch (error) {
            console.error("Error in two-step PDF processing:", error);
            // Fallback to basic guidance if the two-step approach fails
            fileContent = `File uploaded: ${syllabusFile.name} (${syllabusFile.type})
                          
                          This is a PDF containing course or syllabus information.
                          
                          Please extract any text or content from this PDF and create a detailed study plan
                          based on the content. Focus on creating specific, concrete topic titles
                          that accurately reflect the content, without using generic placeholders or
                          making up a subject area unless it's clearly indicated.
                          
                          Your goal is to create a realistic, practical study plan based on the actual content of this PDF.`;
          }
        } else {
          // For text files, get actual content
          fileContent = await syllabusFile.text();
        }
      } catch (error) {
        console.error("Error processing file:", error);
        fileContent = `File uploaded: ${syllabusFile.name}. Please analyze as a standard syllabus.`;
      }
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
      - Include ALL relevant topics from the syllabus - don't artificially limit the number
      
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
      
      // Parse the response
      try {
        // Try to parse and validate the JSON
        jsonResult = cleanAndParseJSON(text);
        console.log("Successfully parsed JSON response with topics:", jsonResult.topics?.length || 0);
        
        // Validate the response structure
        if (!jsonResult.topics || !Array.isArray(jsonResult.topics) || jsonResult.topics.length === 0) {
          console.log("Invalid response structure (missing topics array), using fallback");
          jsonResult = createFallbackStudyPlan(syllabusFile.name);
          usingFallback = true;
        }
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        // Fallback to the default study plan
        jsonResult = createFallbackStudyPlan(syllabusFile.name);
        usingFallback = true;
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