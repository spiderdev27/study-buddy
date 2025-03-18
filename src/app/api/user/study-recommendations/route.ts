import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Google Generative AI with the API key
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.quizResults) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Extract quiz information
    const { quizResults, topic, topics, difficulty } = data;
    
    // Handle both the new topics array and legacy single topic
    const topicsToUse = topics || (topic ? [topic] : ['General Knowledge']);
    
    // Join multiple topics with commas and "and" for the last one
    const combinedTopics = topicsToUse.length > 1 
      ? topicsToUse.join(', ').replace(/,([^,]*)$/, ' and$1')
      : topicsToUse[0];
    
    // Initialize gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings,
      apiVersion: "v1beta",
    });
    
    // Create detailed prompt for gemini
    const prompt = `Based on the following quiz results about "${combinedTopics}" at ${difficulty || 'medium'} difficulty level, provide a personalized study plan and recommendations.

Quiz Performance Summary:
- Score: ${quizResults.score} out of ${quizResults.totalQuestions} (${Math.round((quizResults.score / quizResults.totalQuestions) * 100)}%)
- Time Spent: ${Math.floor(quizResults.timeSpent / 60)} minutes ${quizResults.timeSpent % 60} seconds

Question-by-question breakdown:
${quizResults.questionResults.map((q, i) => `
Question ${i+1}: ${q.question}
- User's answer: ${q.userAnswer}
- Correct answer: ${q.correctAnswer}
- Result: ${q.correct ? 'Correct' : 'Incorrect'}
`).join('')}

Based on this performance, please provide:
1. A personalized study plan with 3-5 specific topics or areas to focus on
2. Learning resources (books, websites, courses) that would help improve in these areas
3. Practice exercises or activities to strengthen understanding
4. A schedule recommendation (how much time to spend on each topic)
5. Specific concepts that weren't understood well based on the incorrect answers

Please format your response in clear sections with markdown headings and bullet points for readability.`;
    
    // Generate response from Gemini
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      }
    });
    
    const recommendations = result.response.text();
    
    // Return success with the recommendations
    return NextResponse.json({ 
      success: true, 
      recommendations,
      quizSummary: {
        score: quizResults.score,
        totalQuestions: quizResults.totalQuestions,
        percentage: Math.round((quizResults.score / quizResults.totalQuestions) * 100),
        topic: combinedTopics,
        topics: topicsToUse,
        difficulty
      }
    });
  } catch (error) {
    console.error('Error generating study recommendations:', error);
    
    // Provide a fallback recommendation if the API call fails
    const fallbackRecommendations = `# Study Recommendations

## Areas to Focus On
* Core concepts in ${data?.topic || data?.topics?.join(', ') || 'this subject'}
* Practice with practical examples
* Review foundational principles

## Recommended Resources
* Online resources like Khan Academy or Coursera
* Textbooks covering the fundamentals
* Practice problems and exercises

## Study Schedule
Spend 30-45 minutes daily on focused learning in the areas you found challenging.

*Note: This is a fallback recommendation. For more personalized guidance, please try again later.*`;
    
    return NextResponse.json({ 
      success: true,
      fallback: true,
      recommendations: fallbackRecommendations,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 