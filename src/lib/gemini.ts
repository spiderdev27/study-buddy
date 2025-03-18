import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Google Generativeai with the API key
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

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
  model: "gemini-1.5-pro", // Updated model name to the latest version
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
export async function generateFlashcards(content: string, numberOfCards: number = 5) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings,
      apiVersion: "v1beta",
    });

    const prompt = `Based on the following content, generate ${numberOfCards} flashcards in a JSON format with "question" and "answer" fields:

${content}

Return ONLY valid JSON in the following format:
[
  {"question": "Question 1", "answer": "Answer 1"},
  {"question": "Question 2", "answer": "Answer 2"},
  ...
]`;
    
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    });
    
    const responseText = result.response.text();
    
    try {
      // Parse the JSON response
      const jsonResponse = JSON.parse(responseText);
      
      // Check if the response has the expected format (array of flashcards)
      if (Array.isArray(jsonResponse)) {
        return jsonResponse;
      } else {
        console.error('Unexpected JSON format:', jsonResponse);
        return generateFallbackFlashcards(numberOfCards);
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return generateFallbackFlashcards(numberOfCards);
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return generateFallbackFlashcards(numberOfCards);
  }
}

// Generate fallback flashcards for testing
function generateFallbackFlashcards(count: number = 5) {
  const defaultFlashcards = [
    { question: "What is the study of living organisms called?", answer: "Biology" },
    { question: "What is the formula for the area of a circle?", answer: "A = πr²" },
    { question: "Who wrote 'Romeo and Juliet'?", answer: "William Shakespeare" },
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "What is the chemical symbol for gold?", answer: "Au" }
  ];
  
  return defaultFlashcards.slice(0, count);
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

export default {
  generateAIResponse,
  generateStudyHelp,
  analyzeText,
  generateFlashcards,
  summarizeText,
  generateQuiz,
}; 