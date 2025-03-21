import { LearningPreferences } from '@/components/ai-tutor/LearningSettings';

// For TypeScript type safety
export interface GeminiMessage {
  role: 'user' | 'model';
  parts: {
    text: string;
  }[];
}

export interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: any[];
  }[];
  promptFeedback?: {
    safetyRatings: any[];
  };
}

const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

export async function generateGeminiResponse(
  messages: GeminiMessage[],
  subject?: string,
  topic?: string,
  preferences?: LearningPreferences
): Promise<string> {
  try {
    // Create a customized system prompt based on subject, topic and preferences
    const systemPrompt = createSystemPrompt(subject, topic, preferences);
    
    // Add system message to the beginning of the messages array if it exists
    const allMessages = systemPrompt
      ? [{ role: 'user' as const, parts: [{ text: systemPrompt }] }, ...messages]
      : messages;

    // Prepare the request payload
    const requestBody: GeminiRequest = {
      contents: allMessages,
      generationConfig: DEFAULT_GENERATION_CONFIG,
    };

    // Call the Gemini API (via your backend proxy for API key security)
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    console.log("Gemini response:", JSON.stringify(data, null, 2));
    
    // Extract the generated text from the response
    if (data.candidates && data.candidates.length > 0) {
      // Handle both text format versions for Gemini 1.0/2.0 compatibility
      // For Gemini 2.0, we need to collect all text parts
      const textParts = data.candidates[0].content.parts.map(part => part.text || "");
      const fullText = textParts.join("");
      
      if (fullText) {
        return fullText;
      } else {
        console.error("Empty response from Gemini API:", data);
        throw new Error('Empty response text');
      }
    } else {
      console.error("No candidates in response:", data);
      throw new Error('No response generated');
    }
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    return "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
}

// Create a system prompt based on the selected subject, topic, and learning preferences
function createSystemPrompt(
  subject?: string,
  topic?: string,
  preferences?: LearningPreferences
): string | null {
  if (!subject && !topic) {
    return null;
  }

  let prompt = `You are an expert AI tutor specializing in ${subject || 'various subjects'}`;
  
  if (topic) {
    prompt += `, particularly in ${topic}`;
  }
  
  prompt += `. Your goal is to help students learn and understand concepts clearly.`;
  
  if (preferences) {
    prompt += `\n\nPlease tailor your teaching style to the following preferences:`;
    
    // Add difficulty level
    prompt += `\n- Difficulty level: ${preferences.difficulty.charAt(0).toUpperCase() + preferences.difficulty.slice(1)}`;
    
    // Add learning style
    prompt += `\n- Learning style: ${preferences.learningStyle.charAt(0).toUpperCase() + preferences.learningStyle.slice(1)}`;
    
    // Add session duration context
    prompt += `\n- Session duration: ${preferences.sessionDuration} minutes`;
    
    // Add additional preferences
    const additionalPrefs = [];
    if (preferences.includeExamples) additionalPrefs.push('Include practical examples');
    if (preferences.includePracticeQuestions) additionalPrefs.push('Provide practice questions');
    if (preferences.explainInDepth) additionalPrefs.push('Explain concepts in depth');
    
    if (additionalPrefs.length > 0) {
      prompt += `\n- Additional preferences: ${additionalPrefs.join(', ')}`;
    }
  }
  
  prompt += `\n\nRespond in a friendly, encouraging manner. Keep explanations ${preferences?.explainInDepth ? 'thorough and detailed' : 'concise and to the point'}. Use ${preferences?.learningStyle === 'visual' ? 'visual descriptions and metaphors' : 'clear verbal explanations'} when possible.`;
  
  return prompt;
} 