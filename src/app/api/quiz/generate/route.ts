import { NextRequest, NextResponse } from 'next/server';

// Get API key from environment variables
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    const { messages, count = 3 } = await request.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Conversation history is required' },
        { status: 400 }
      );
    }
    
    // Create a prompt for generating quiz questions based on conversation
    const conversationContext = messages
      .filter(m => !m.isProcessing)
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
    
    const prompt = `Based on the following conversation between a tutor (ai) and student (user), generate ${count} multiple choice questions to test the student's understanding of the concepts discussed.

Conversation:
${conversationContext}

Generate questions that:
1. Test key concepts discussed in the conversation
2. Vary in difficulty
3. Cover different aspects of the topics discussed

Format each question as a JSON object with:
{
  "questions": [
    {
      "id": "unique_string",
      "question": "question_text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correctAnswer": "full_correct_answer",
      "explanation": "explanation_text"
    }
  ]
}

Make sure to escape special characters and format the JSON correctly.`;
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }
    
    // Call Gemini API
    const response = await fetch(GEMINI_API_URL + "?key=" + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      })
    });
    
    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    // Extract and parse the JSON response from Gemini
    const textResponse = data.candidates[0].content.parts[0].text;
    let questions;
    
    try {
      // Remove markdown code block markers if present
      const jsonText = textResponse.replace(/^```json\n|\n```$/g, '').trim();
      questions = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', textResponse);
      throw new Error('Failed to parse quiz questions from API response');
    }
    
    if (!questions?.questions?.length) {
      throw new Error('No questions generated');
    }
    
    // Validate question format
    questions.questions = questions.questions.map((q: any, index: number) => ({
      ...q,
      id: q.id || `q${index + 1}`,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || 'No explanation provided'
    }));
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate quiz questions' },
      { status: 500 }
    );
  }
} 