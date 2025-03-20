import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { fileToGenerativePart } from '@/lib/utils';

// Ensure you have the NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Initialize the Gemini API with proper configuration
export const genAI = new GoogleGenerativeAI(apiKey);

// Configure the model options for Gemini 2.0 Flash
const modelConfig = {
  model: 'gemini-2.0-flash',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 1024,
  }
};

export interface GeminiResponse {
  text: string;
  error?: string;
}

/**
 * Generates a response from Gemini 2.0 Flash model
 * @param prompt The text prompt to send to Gemini
 * @returns Promise with generated text or error
 */
export async function generateWithGemini(prompt: string): Promise<GeminiResponse> {
  try {
    if (!apiKey) {
      return { 
        text: '', 
        error: 'API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.' 
      };
    }

    const model = genAI.getGenerativeModel(modelConfig);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return { text };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : 'An error occurred with the Gemini API' 
    };
  }
}

/**
 * Generates a structured response from Gemini, parsed as a specific type
 * @param prompt The text prompt to send to Gemini
 * @returns Promise with parsed response of type T
 */
export async function generateStructuredResponse<T>(prompt: string): Promise<T | null> {
  try {
    const formattedPrompt = `${prompt}\n\nPlease format your response as valid JSON with no additional text or explanation outside the JSON structure.`;
    const response = await generateWithGemini(formattedPrompt);
    
    if (response.error) {
      console.error('Structured response error:', response.error);
      return null;
    }
    
    // Extract JSON from the response text
    const jsonMatch = response.text.match(/```json\n([\s\S]*?)\n```/) || 
                      response.text.match(/{[\s\S]*}/) ||
                      [null, response.text];
    
    const jsonText = jsonMatch[1] || response.text;
    return JSON.parse(jsonText) as T;
  } catch (error) {
    console.error('Error parsing structured response:', error);
    return null;
  }
}

/**
 * Generates study suggestions for a specific topic
 * @param subject The subject being studied
 * @param topic The specific topic
 * @param duration Duration in minutes
 * @returns Promise with an array of study suggestions
 */
export async function generateStudySuggestions(
  subject: string, 
  topic: string, 
  duration: number
): Promise<string[]> {
  const prompt = `I'm studying ${subject}, specifically the topic "${topic}" for ${duration} minutes.
  Please provide 4 specific, actionable study suggestions that:
  1. Use evidence-based learning techniques
  2. Are tailored to this specific subject and topic
  3. Can be completed within the time frame
  4. Include active recall and spaced repetition strategies
  
  Keep each suggestion concise (under 100 characters if possible) and directly actionable.`;

  const response = await generateWithGemini(prompt);
  
  if (response.error) {
    return [
      `Create a concept map for ${topic}`,
      `Try the Pomodoro technique: ${Math.floor(duration / 25)} sessions of 25 minutes`,
      `Practice active recall by writing questions and testing yourself`,
      `Explain ${topic} concepts aloud as if teaching someone else`
    ];
  }
  
  // Parse bulleted/numbered list responses into an array
  const suggestions = response.text
    .split(/\n+/)
    .filter(line => /^[\d\-\*\•\★]/.test(line.trim()))
    .map(line => line.replace(/^[\d\-\*\•\★]+[\.\)\s]+/, '').trim());
  
  // If parsing fails, fall back to splitting by newlines
  return suggestions.length > 0 ? suggestions : response.text.split(/\n+/).filter(line => line.trim().length > 0);
}

/**
 * Generates a study schedule for multiple tasks
 * @param tasks Array of study tasks
 * @param availableHours Total hours available
 * @returns Promise with optimized study schedule
 */
export interface ScheduleBlock {
  taskId: string;
  startTime: string;
  endTime: string;
  focusStrategy: string;
}

export async function generateStudySchedule(
  tasks: Array<{ id: string; title: string; subject: string; duration: number; priority: string }>,
  availableHours: number
): Promise<ScheduleBlock[]> {
  const prompt = `I need to create an optimized study schedule for these tasks:
  ${tasks.map(t => `- ${t.title} (${t.subject}, ${t.duration} min, priority: ${t.priority})`).join('\n')}
  
  I have ${availableHours} hours available. Please create a schedule that:
  1. Prioritizes high priority tasks
  2. Incorporates breaks using the Pomodoro technique
  3. Alternates between different subjects to maintain focus
  4. Suggests specific focus strategies for each study block
  
  Format the response as a JSON array with these fields for each block:
  - taskId: the task ID
  - startTime: when to start (e.g. "9:00 AM")
  - endTime: when to end
  - focusStrategy: a specific strategy for that block`;

  const schedule = await generateStructuredResponse<ScheduleBlock[]>(prompt);
  
  if (!schedule) {
    // Return a simple fallback schedule if the API fails
    return tasks.slice(0, Math.min(3, tasks.length)).map((task, index) => ({
      taskId: task.id,
      startTime: `${9 + index}:00 AM`,
      endTime: `${9 + index + 1}:00 AM`,
      focusStrategy: 'Active recall and note-taking'
    }));
  }
  
  return schedule;
}

/**
 * Analyzes a completed study session and provides feedback
 * @param session Details of the completed study session
 * @param task The task that was studied
 * @returns Promise with analysis and improvement suggestions
 */
export interface SessionAnalysis {
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
}

export async function analyzeStudySession(
  session: { duration: number; productivity: number; notes: string },
  task: { title: string; subject: string }
): Promise<SessionAnalysis> {
  const prompt = `I completed a study session with these details:
  - Topic: ${task.title}
  - Subject: ${task.subject}
  - Duration: ${session.duration} minutes
  - Self-rated productivity: ${session.productivity}%
  - My notes: "${session.notes || 'No notes provided'}"
  
  Please analyze my study session and provide:
  1. What went well (2-3 strengths)
  2. Areas for improvement (2-3 suggestions)
  3. Concrete next steps for my next study session (2-3 actions)
  
  Format the response as a JSON object with fields: strengths, improvements, nextSteps (each being an array of strings).`;

  const analysis = await generateStructuredResponse<SessionAnalysis>(prompt);
  
  if (!analysis) {
    // Return fallback analysis if the API fails
    return {
      strengths: ['You completed the full study session'],
      improvements: ['Consider setting more specific goals for each session'],
      nextSteps: ['Review what you learned today', 'Prepare specific questions for next time']
    };
  }
  
  return analysis;
}

/**
 * Generates practice questions for a study topic
 * @param subject The subject being studied
 * @param topic The specific topic
 * @param count Number of questions to generate
 * @returns Promise with questions and answers
 */
export interface QuizQuestion {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function generatePracticeQuestions(
  subject: string,
  topic: string,
  count: number = 3
): Promise<QuizQuestion[]> {
  const prompt = `Please create ${count} practice questions about ${topic} in ${subject}.
  
  For each question:
  1. Vary the difficulty (easy, medium, hard)
  2. Make sure they test different aspects of the topic
  3. Provide a clear, concise answer
  
  Format the response as a JSON array with these fields for each question:
  - question: the full question text
  - answer: the correct answer
  - difficulty: "easy", "medium", or "hard"`;

  const questions = await generateStructuredResponse<QuizQuestion[]>(prompt);
  
  if (!questions) {
    // Return fallback questions if the API fails
    return [
      {
        question: `What is the main concept behind ${topic}?`,
        answer: `The main concept involves understanding the core principles of ${topic} in ${subject}.`,
        difficulty: 'medium'
      },
      {
        question: `How would you define ${topic} in simple terms?`,
        answer: `${topic} can be defined as a fundamental concept in ${subject} that explains...`,
        difficulty: 'easy'
      },
      {
        question: `What are the practical applications of ${topic}?`,
        answer: `${topic} is applied in various contexts such as...`,
        difficulty: 'hard'
      }
    ];
  }
  
  return questions;
}

// Safety settings to avoid harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Initialize the model
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  safetySettings,
});

// Create a chat session
export const createChatSession = async () => {
  return model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
    },
  });
};

// Fallback response function for development/testing
const getFallbackResponse = (message: string) => {
  // Simple responses for testing when API is not available
  const responses = {
    default: "I'm your Study Buddy AI assistant. How can I help you with your studies today?",
    greeting: "Hello! I'm your Study Buddy AI assistant. How can I help you with your studies today?",
    question: "That's an interesting question. Let me help you understand this topic better.",
    thanks: "You're welcome! Is there anything else you'd like to learn about?",
    bye: "Goodbye! Feel free to come back anytime you need help with your studies.",
  };

  const lowercaseMsg = message.toLowerCase();
  
  if (lowercaseMsg.includes("hello") || lowercaseMsg.includes("hi")) {
    return responses.greeting;
  } else if (lowercaseMsg.includes("thank")) {
    return responses.thanks;
  } else if (lowercaseMsg.includes("bye") || lowercaseMsg.includes("goodbye")) {
    return responses.bye;
  } else if (lowercaseMsg.includes("?")) {
    return responses.question;
  } else {
    return responses.default;
  }
};

// Get a response from the AI
export async function generateAIResponse(
  messages: { role: string; content: string }[],
  sessionHistory?: { role: string; parts: string }[]
) {
  try {
    // Get the model - using gemini-2.0-flash as specified in the curl command
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings,
      apiVersion: "v1beta", // Explicitly set API version
    });

    // Format the current message
    const userMessage = messages[messages.length - 1].content;
    
    // Enhanced prompt to request well-formatted responses
    const enhancedPrompt = `${userMessage}

Please structure your response in a clear, organized format following these guidelines:
1. Use markdown formatting:
   - # for main topic/section headings
   - ## for subtopics/subsection headings
   - ### for specific points or examples
2. Use bullet points (•) for lists and examples
3. Use **bold** for important terms or concepts
4. Break down complex ideas into digestible sections
5. Include relevant examples where helpful
6. End with a brief summary or key takeaways if appropriate

Remember to maintain a clear hierarchy in the content structure and ensure each section flows logically to the next.`;
    
    // For direct content generation (simpler approach)
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: enhancedPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });
    
    const responseText = result.response.text();

    // Format the response
    return {
      text: responseText,
      history: sessionHistory ? [
        ...sessionHistory,
        { role: 'user', parts: userMessage },
        { role: 'model', parts: responseText },
      ] : [
        { role: 'user', parts: userMessage },
        { role: 'model', parts: responseText },
      ],
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Return a fallback response instead of throwing an error
    const fallbackResponse = "I'm sorry, I encountered an error processing your request. The AI service might be temporarily unavailable. Please try again later.";
    
    return {
      text: fallbackResponse,
      history: sessionHistory ? [
        ...sessionHistory,
        { role: 'user', parts: messages[messages.length - 1].content },
        { role: 'model', parts: fallbackResponse },
      ] : [
        { role: 'user', parts: messages[messages.length - 1].content },
        { role: 'model', parts: fallbackResponse },
      ],
    };
  }
}

// Generate a response for study related queries
export async function generateStudyHelp(query: string, context?: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings,
      apiVersion: "v1beta",
    });

    let prompt = `As a helpful study assistant, I'll help you understand: ${query}

Please structure your response in a clear, organized format following these guidelines:
1. Use markdown formatting:
   - # for main topic/section headings
   - ## for subtopics/subsection headings
   - ### for specific points or examples
2. Use bullet points (•) for lists and examples
3. Use **bold** for important terms or concepts
4. Break down complex ideas into digestible sections
5. Include relevant examples where helpful
6. End with a brief summary or key takeaways

Remember to maintain a clear hierarchy in the content structure and ensure each section flows logically to the next.`;
    
    if (context) {
      prompt += `\n\nHere's some additional context that might be helpful: ${context}`;
    }
    
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    });
    
    return result.response.text();
  } catch (error) {
    console.error('Error generating study help:', error);
    return "I'm sorry, I encountered an error processing your study request. The AI service might be temporarily unavailable. Please try again later.";
  }
}

// Analyze a text for key concepts
export async function analyzeText(text: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings,
      apiVersion: "v1beta",
    });

    const prompt = `Analyze the following text and provide a structured analysis:

${text}

Please structure your response in a clear, organized format following these guidelines:
1. Use markdown formatting:
   - # Main Analysis
   - ## Key Concepts
   - ## Main Ideas
   - ## Important Points
2. Use bullet points (•) for listing concepts and ideas
3. Use **bold** for important terms or concepts
4. Include specific examples or quotes from the text where relevant
5. End with a brief summary of the key takeaways

Remember to maintain a clear hierarchy in the content structure and ensure each section flows logically to the next.`;
    
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    });
    
    return result.response.text();
  } catch (error) {
    console.error('Error analyzing text:', error);
    return "I'm sorry, I encountered an error analyzing this text. The AI service might be temporarily unavailable. Please try again later.";
  }
}

// Generate flashcards from content
export async function generateFlashcards(content: string, numCards: number = 10, deckId?: string) {
  try {
    // Use Gemini 2.0 Flash for content understanding
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings
    });

    const prompt = `
    You are an expert educational content analyzer. I've provided study material text below:

${content}

    Carefully analyze this content and create high-quality flashcards based ONLY on the information provided.
    
    Create EXACTLY ${numCards} flashcards in this JSON format:
    [
      {
        "front": "Specific question about a key concept in the provided material",
        "back": "Comprehensive answer with information from the content"
      }
    ]

    Your flashcards MUST:
    - Be directly based ONLY on the specific content provided
    - Test understanding of the important concepts, not just memorization
    - Cover the most significant information from the material
    - Be clear, accurate, and educational
    - Number EXACTLY ${numCards} cards, no more and no less
    
    DO NOT create generic flashcards not covered in the provided content.
    ONLY return the valid JSON array with no other text.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/\[\s*\{[\s\S]*\}\s*\]/) ||
                      [null, text];
    
    const jsonText = jsonMatch[1] || text;
    
    try {
      const parsedCards = JSON.parse(jsonText);
      
      // Ensure each card has a unique ID and required fields
      return parsedCards.map((card: any, index: number) => ({
        id: `text-card-${Date.now()}-${index}`,
        front: card.front,
        back: card.back,
        confidence: 'low',
        deckId: deckId || 'general',
        lastReviewed: new Date()
      }));
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Failed to parse generated flashcards');
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return generateFallbackFlashcards(numCards).map(card => ({
      ...card,
      deckId: deckId || 'general',
      lastReviewed: new Date()
    }));
  }
}

// Generate fallback flashcards for testing
function generateFallbackFlashcards(count: number = 5) {
  const defaultFlashcards = [
    { 
      question: "What is the study of living organisms called?", 
      answer: "Biology"
    },
    { 
      question: "What is the formula for the area of a circle?", 
      answer: "A = πr²"
    },
    { 
      question: "Who wrote 'Romeo and Juliet'?", 
      answer: "William Shakespeare"
    },
    { 
      question: "What is the capital of France?", 
      answer: "Paris"
    },
    { 
      question: "What is the chemical symbol for gold?", 
      answer: "Au"
    }
  ];
  
  // Ensure the keys match what we're expecting in our components (front/back)
  return defaultFlashcards.slice(0, count).map(card => ({
    front: card.question,
    back: card.answer
  }));
}

// Summarize text with configurable options
export async function summarizeText(
  text: string, 
  options: { 
    length: 'short' | 'medium' | 'long',
    style: 'concise' | 'detailed' | 'bullets'
  }
) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings,
      apiVersion: "v1beta",
    });

    let lengthInstruction = '';
    switch(options.length) {
      case 'short':
        lengthInstruction = 'Create a very brief summary in 1-2 sentences.';
        break;
      case 'medium':
        lengthInstruction = 'Create a moderate-length summary in 3-4 sentences.';
        break;
      case 'long':
        lengthInstruction = 'Create a comprehensive summary in 5-7 sentences.';
        break;
    }

    let styleInstruction = '';
    switch(options.style) {
      case 'concise':
        styleInstruction = 'Focus only on the most important points in a direct, straightforward manner.';
        break;
      case 'detailed':
        styleInstruction = 'Include important details and nuances while maintaining clarity.';
        break;
      case 'bullets':
        styleInstruction = 'Format the summary as a bullet-point list of key points.';
        break;
    }

    const prompt = `Summarize the following text:

${text}

${lengthInstruction}
${styleInstruction}

${options.style === 'bullets' ? 'Use bullet points (•) for each main point.' : 'Use clear, concise language appropriate for a study context.'}
Ensure the summary captures the essential meaning and most important points of the original text.`;
    
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2, // Lower temperature for more predictable summaries
        maxOutputTokens: 1000,
      }
    });
    
    return result.response.text();
  } catch (error) {
    console.error('Error summarizing text:', error);
    return generateFallbackSummary(text, options);
  }
}

// Generate a fallback summary when the API fails
function generateFallbackSummary(
  text: string, 
  options: { 
    length: 'short' | 'medium' | 'long',
    style: 'concise' | 'detailed' | 'bullets'
  }
) {
  const wordCount = text.split(/\s+/).length;
  
  if (options.style === 'bullets') {
    const points = [
      "The text discusses important concepts related to the topic.",
      "Key arguments are presented with supporting evidence.",
      "The author concludes by synthesizing the main points.",
    ];
    
    if (options.length === 'short') return '• ' + points[0];
    if (options.length === 'medium') return '• ' + points.slice(0, 2).join('\n• ');
    return '• ' + points.join('\n• ');
  } else {
    const detail = options.style === 'concise' ? 'concisely' : 'in detail';
    
    let summary = `This ${wordCount}-word text ${detail} discusses the main topics presented. `;
    summary += `The author introduces several key concepts and supports them with evidence. `;
    
    if (options.length !== 'short') {
      summary += `Various perspectives are considered throughout the discussion, providing a balanced view. `;
    }
    
    if (options.length === 'long') {
      summary += `The significance of these ideas is explored through multiple examples and applications. `;
      summary += `Connections are drawn between different aspects of the subject matter. `;
    }
    
    summary += `In conclusion, the text effectively communicates its central message while addressing potential counterarguments.`;
    
    return summary;
  }
}

export async function generateQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard', numQuestions: number = 5) {
  try {
    // Ensure numQuestions is a number and capped if too high
    const questionCount = Math.min(typeof numQuestions === 'number' ? numQuestions : 5, 20);
    
    console.log(`Starting quiz generation for "${topic}" with ${questionCount} questions at ${difficulty} difficulty`);
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings,
      apiVersion: "v1beta",
    });

    let difficultyLevel = '';
    switch(difficulty) {
      case 'easy':
        difficultyLevel = 'basic understanding and recall of fundamental concepts';
        break;
      case 'medium':
        difficultyLevel = 'application of concepts and moderate analytical thinking';
        break;
      case 'hard':
        difficultyLevel = 'complex problem-solving, critical analysis, and synthesis of multiple concepts';
        break;
    }

    const prompt = `Generate a quiz about "${topic}" with exactly ${questionCount} multiple-choice questions at a ${difficulty} difficulty level (${difficultyLevel}).

Please return ONLY valid JSON in the following format:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A", 
    "explanation": "Brief explanation of why this answer is correct"
  },
  ...more questions in the same format
]

Make sure to:
1. Create exactly ${questionCount} questions about ${topic}
2. Make each question specific to ${topic} and appropriate for the ${difficulty} level
3. Ensure each question has exactly 4 options
4. Return only valid JSON with no additional text before or after the JSON array
5. Include a variety of question types appropriate for ${topic}
6. Make questions challenging but fair
7. Provide helpful, educational explanations for the correct answers`;
    
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      }
    });
    
    const responseText = result.response.text();
    console.log("Raw response from Gemini:", responseText.substring(0, 100) + "...");
    
    try {
      // Clean the response text to ensure it's valid JSON
      let jsonText = responseText.trim();
      
      // Remove any markdown code blocks if present
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n/, "").replace(/\n```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n/, "").replace(/\n```$/, "");
      }
      
      // Parse the JSON response
      const jsonResponse = JSON.parse(jsonText);
      
      // Validate and return the quiz questions
      if (Array.isArray(jsonResponse)) {
        console.log(`Successfully parsed ${jsonResponse.length} questions`);
        
        // Ensure we return the requested number of questions
        const finalQuestions = jsonResponse.slice(0, questionCount);
        
        // Validate each question has the required fields
        const validatedQuestions = finalQuestions.map(q => {
          // Ensure the question has 4 options
          if (!q.options || q.options.length !== 4) {
            q.options = q.options || [];
            while (q.options.length < 4) {
              q.options.push(`Option ${q.options.length + 1}`);
            }
          }
          
          // Ensure there's a correctAnswer
          if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
            q.correctAnswer = q.options[0];
          }
          
          // Ensure there's an explanation
          if (!q.explanation) {
            q.explanation = "This is the correct answer based on the topic.";
          }
          
          return q;
        });
        
        return validatedQuestions;
      } else {
        console.error('Unexpected JSON format:', jsonResponse);
        return generateFallbackQuiz(topic, questionCount);
      }
    } catch (e) {
      console.error('Error parsing JSON quiz:', e);
      return generateFallbackQuiz(topic, questionCount);
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    return generateFallbackQuiz(topic, numQuestions);
  }
}

// Generate fallback quiz for testing
function generateFallbackQuiz(topic: string, numQuestions: number = 5) {
  console.log(`Generating fallback quiz for "${topic}" with ${numQuestions} questions`);
  
  // Make sure we generate the correct number of questions
  const questionCount = Math.min(Math.max(1, numQuestions), 20);
  
  // Create a more varied set of fallback questions
  const defaultQuizzes = [
    {
      question: `What is the main focus of ${topic}?`,
      options: ["Understanding basic concepts", "Advanced theory application", "Historical development", "Modern innovations"],
      correctAnswer: "Understanding basic concepts",
      explanation: "The primary focus is on building a foundation of basic concepts."
    },
    {
      question: `Which of the following best describes ${topic}?`,
      options: ["A theoretical framework", "A practical methodology", "A historical movement", "A recent discovery"],
      correctAnswer: "A theoretical framework",
      explanation: "It provides a structured way to understand related concepts."
    },
    {
      question: `Who is credited with making significant contributions to ${topic}?`,
      options: ["Albert Einstein", "Isaac Newton", "Marie Curie", "Charles Darwin"],
      correctAnswer: "Isaac Newton",
      explanation: "Newton's work established many of the fundamental principles."
    },
    {
      question: `Which concept is NOT directly related to ${topic}?`,
      options: ["Energy conservation", "Quantum mechanics", "Cellular biology", "Thermodynamics"],
      correctAnswer: "Cellular biology",
      explanation: "Cellular biology belongs to life sciences rather than physical sciences."
    },
    {
      question: `What is a practical application of ${topic}?`,
      options: ["Medical diagnosis", "Environmental monitoring", "Space exploration", "All of the above"],
      correctAnswer: "All of the above",
      explanation: "The principles can be applied across various domains including medicine, environment, and space exploration."
    },
    {
      question: `In what century did ${topic} gain significant recognition?`,
      options: ["17th century", "18th century", "19th century", "20th century"],
      correctAnswer: "20th century",
      explanation: "Most developments in this field occurred during the 20th century."
    },
    {
      question: `Which of these institutions is well-known for research in ${topic}?`,
      options: ["Harvard University", "Massachusetts Institute of Technology", "Stanford University", "All of the above"],
      correctAnswer: "All of the above",
      explanation: "All these prestigious institutions have contributed significantly to research in this field."
    },
    {
      question: `What is considered the foundational text on ${topic}?`,
      options: ["Principia Mathematica", "The Origin of Species", "The Structure of Scientific Revolutions", "A Brief History of Time"],
      correctAnswer: "The Structure of Scientific Revolutions",
      explanation: "This work established many core concepts that continue to influence the field."
    },
    {
      question: `Which field is most closely related to ${topic}?`,
      options: ["Mathematics", "Philosophy", "Computer Science", "Psychology"],
      correctAnswer: "Philosophy",
      explanation: "There are strong conceptual links between this topic and philosophical inquiry."
    },
    {
      question: `What recent development has most impacted ${topic}?`,
      options: ["Artificial intelligence", "Quantum computing", "Big data analytics", "Blockchain technology"],
      correctAnswer: "Artificial intelligence",
      explanation: "AI has revolutionized approaches and applications in this field."
    },
    {
      question: `Which challenge is ${topic} most likely to help address?`,
      options: ["Climate change", "Healthcare inequities", "Educational access", "Food security"],
      correctAnswer: "Healthcare inequities",
      explanation: "Applications in this field have significant potential to improve healthcare access and outcomes."
    },
    {
      question: `What ethical consideration is most relevant to ${topic}?`,
      options: ["Privacy concerns", "Economic displacement", "Inherent biases", "Environmental impact"],
      correctAnswer: "Privacy concerns",
      explanation: "Issues around privacy are central to ethical discussions in this field."
    },
    {
      question: `How might ${topic} evolve in the next decade?`,
      options: ["Greater integration with daily life", "More specialized applications", "Decreased relevance", "Regulatory restrictions"],
      correctAnswer: "Greater integration with daily life",
      explanation: "Current trends suggest increasing integration of these concepts into everyday experiences."
    },
    {
      question: `Which discipline provides the theoretical foundation for ${topic}?`,
      options: ["Physics", "Biology", "Economics", "Computer Science"],
      correctAnswer: "Computer Science",
      explanation: "The computational framework provides the essential theoretical underpinnings."
    },
    {
      question: `What skill is most valuable for someone studying ${topic}?`,
      options: ["Mathematical reasoning", "Creative thinking", "Technical writing", "Public speaking"],
      correctAnswer: "Mathematical reasoning",
      explanation: "Strong mathematical skills are essential for advanced work in this field."
    },
    {
      question: `Which country is currently leading research in ${topic}?`,
      options: ["United States", "China", "Germany", "Japan"],
      correctAnswer: "United States",
      explanation: "The United States continues to lead in research output and innovation in this area."
    },
    {
      question: `What is the most common misconception about ${topic}?`,
      options: ["It's too complex for practical use", "It's only relevant to specialists", "It's a recent development", "It's primarily theoretical"],
      correctAnswer: "It's only relevant to specialists",
      explanation: "The applications and implications extend far beyond specialist domains."
    },
    {
      question: `How has social media influenced the development of ${topic}?`,
      options: ["Accelerated information sharing", "Created echo chambers", "Slowed progress", "Had minimal impact"],
      correctAnswer: "Accelerated information sharing",
      explanation: "Social media has significantly increased the speed at which new developments are shared and discussed."
    },
    {
      question: `Which learning approach is most effective for mastering ${topic}?`,
      options: ["Theoretical study", "Hands-on projects", "Group discussion", "Individual research"],
      correctAnswer: "Hands-on projects",
      explanation: "Practical application through projects typically leads to the deepest understanding."
    },
    {
      question: `What funding source has most significantly advanced ${topic}?`,
      options: ["Government grants", "Private industry", "Academic institutions", "Nonprofit organizations"],
      correctAnswer: "Government grants",
      explanation: "Government funding has been instrumental in supporting foundational research in this area."
    }
  ];
  
  // If we need more questions than we have in our template, just repeat some
  if (questionCount > defaultQuizzes.length) {
    // Calculate how many times we need to cycle through our templates
    const cycles = Math.ceil(questionCount / defaultQuizzes.length);
    let expandedQuizzes = [];
    
    for (let i = 0; i < cycles; i++) {
      expandedQuizzes = expandedQuizzes.concat(defaultQuizzes.map(q => ({...q})));
    }
    
    return expandedQuizzes.slice(0, questionCount);
  }
  
  return defaultQuizzes.slice(0, questionCount);
}

/**
 * Processes an image file and sends it to Gemini to generate flashcards
 * @param imageFile The image file to analyze
 * @param numCards Number of flashcards to generate
 * @param deckId The ID of the deck to assign flashcards to
 * @returns Promise with generated flashcards
 */
export async function generateFlashcardsFromImage(imageFile: File, numCards: number = 10, deckId: string) {
  try {
    // Convert file to base64 for Gemini
    const fileBytes = await fileToGenerativePart(imageFile);
    
    // Use Gemini 2.0 Flash for image processing
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings
    });
    
    const prompt = `
    You are an expert educational content analyzer. I've uploaded an image of study material.
    
    Carefully analyze this image and extract key educational concepts to create high-quality flashcards.
    
    1. If this is text/notes:
       - Extract important definitions, concepts, formulas, and relationships
       - Create question-answer pairs that test understanding of key ideas
       
    2. If this is a diagram/chart/graph:
       - Identify components, processes, relationships shown
       - Create cards testing understanding of the visual elements
       
    3. If this contains equations/math:
       - Extract key formulas and their applications
       - Create cards for underlying concepts
       
    Please create EXACTLY ${numCards} flashcards in this format:
    [
      {
        "front": "Clear, concise question about a specific concept",
        "back": "Comprehensive answer with the key information"
      }
    ]
    
    IMPORTANT: Your flashcards should be:
    - Directly based on the specific content in the image
    - Focused on testing understanding, not just memorization
    - Clear and concise
    - Number EXACTLY ${numCards} cards, no more and no less
    
    DO NOT create generic flashcards not specifically related to this content.
    ONLY return the valid JSON array with no other text.`;

    const result = await model.generateContent([prompt, fileBytes]);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/\[\s*\{[\s\S]*\}\s*\]/) ||
                      [null, text];
    
    const jsonText = jsonMatch[1] || text;
    
    try {
      const parsedCards = JSON.parse(jsonText);
      
      // Ensure each card has a unique ID and required fields
      return parsedCards.map((card: any, index: number) => ({
        id: `img-card-${Date.now()}-${index}`,
        front: card.front,
        back: card.back,
        confidence: 'low',
        deckId: deckId,
        lastReviewed: new Date()
      }));
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Failed to parse generated flashcards');
    }
  } catch (error) {
    console.error('Error generating flashcards from image:', error);
    // Return fallback cards if there's an error
    return generateFallbackFlashcards(numCards).map(card => ({
      ...card,
      deckId: deckId,
      lastReviewed: new Date()
    }));
  }
}

/**
 * Processes a PDF file and sends it to Gemini to generate flashcards
 * @param pdfFile The PDF file to analyze
 * @param numCards Number of flashcards to generate
 * @param deckId The ID of the deck to assign flashcards to
 * @returns Promise with generated flashcards
 */
export async function generateFlashcardsFromPDF(pdfFile: File, numCards: number = 10, deckId: string) {
  try {
    // Convert file to base64 for Gemini
    const fileBytes = await fileToGenerativePart(pdfFile);
    
    // Use Gemini 2.0 Flash for document understanding
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings
    });
    
    const prompt = `
    You are an expert educational content analyzer. I've provided a PDF document.
    
    Carefully analyze this PDF and create high-quality flashcards based ONLY on the information provided.
    
    Create EXACTLY ${numCards} flashcards in this JSON format:
    [
      {
        "front": "Specific question about a key concept from the PDF content",
        "back": "Comprehensive answer using information from the PDF"
      }
    ]

    Your flashcards MUST:
    - Be directly based on the specific content provided in the PDF
    - Test understanding of the important concepts, not just memorization
    - Cover the most significant information from the material
    - Be clear, accurate, and educational
    - Number EXACTLY ${numCards} cards, no more and no less
    
    DO NOT create generic flashcards or include information not found in the PDF.
    ONLY return the valid JSON array with no other text.`;

    const result = await model.generateContent([prompt, fileBytes]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/\[\s*\{[\s\S]*\}\s*\]/) ||
                      [null, text];
    
    const jsonText = jsonMatch[1] || text;
    
    try {
      const parsedCards = JSON.parse(jsonText);
      
      // Map to proper flashcard format
      return parsedCards.map((card: any, index: number) => ({
        id: `pdf-card-${Date.now()}-${index}`,
        front: card.front,
        back: card.back,
        confidence: 'low',
        deckId: deckId,
        lastReviewed: new Date()
      }));
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Failed to parse generated flashcards');
    }
  } catch (error) {
    console.error('Error generating flashcards from PDF:', error);
    throw error; // Let the calling function handle the error
  }
}

/**
 * Processes a document file and sends it to Gemini to generate flashcards
 * @param docFile The document file to analyze
 * @param deckId The ID of the deck to assign flashcards to
 * @returns Promise with generated flashcards
 */
export async function generateFlashcardsFromDocument(docFile: File, deckId: string) {
  try {
    // Convert file to base64 for Gemini
    const fileBytes = await fileToGenerativePart(docFile);
    
    // Use Gemini 2.0 Flash for document understanding
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings
    });
    
    const prompt = `
    You are an expert educational content analyzer. I've provided a document.
    
    Carefully analyze this document and create high-quality flashcards based ONLY on the information provided.
    
    Create 5-10 flashcards in this JSON format:
    [
      {
        "front": "Specific question about a key concept from the document content",
        "back": "Comprehensive answer using information from the document"
      }
    ]

    Your flashcards MUST:
    - Be directly based on the specific content provided in the document
    - Test understanding of the important concepts, not just memorization
    - Cover the most significant information from the material
    - Be clear, accurate, and educational
    
    DO NOT create generic flashcards or include information not found in the document.
    ONLY return the valid JSON array with no other text.`;

    const result = await model.generateContent([prompt, fileBytes]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/\[\s*\{[\s\S]*\}\s*\]/) ||
                      [null, text];
    
    const jsonText = jsonMatch[1] || text;
    
    try {
      const parsedCards = JSON.parse(jsonText);
      
      // Map to proper flashcard format
      return parsedCards.map((card: any, index: number) => ({
        id: `doc-card-${Date.now()}-${index}`,
        front: card.front,
        back: card.back,
        confidence: 'low',
        deckId: deckId,
        lastReviewed: new Date()
      }));
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Failed to parse generated flashcards');
    }
  } catch (error) {
    console.error('Error generating flashcards from document:', error);
    throw error; // Let the calling function handle the error
  }
}

export default {
  generateAIResponse,
  generateStudyHelp,
  analyzeText,
  generateFlashcards,
  summarizeText,
  generateQuiz,
  generateFlashcardsFromImage,
  generateFlashcardsFromPDF,
  generateFlashcardsFromDocument,
}; 