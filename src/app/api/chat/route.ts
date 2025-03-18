import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateAIResponse } from '@/lib/gemini';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { message, chatId } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let chatSession;
    let sessionHistory: any[] = [];

    // If chatId is provided, get the existing chat session
    if (chatId) {
      chatSession = await prisma.chatSession.findUnique({
        where: {
          id: chatId,
          userId: session.user.id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      // Format chat history for Gemini API
      if (chatSession) {
        sessionHistory = chatSession.messages.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: msg.content,
        }));
      }
    }

    // If no chatId or chat session not found, create a new one
    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          title: message.substring(0, 30) + '...',
          userId: session.user.id,
        },
      });
    }

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        content: message,
        role: 'user',
        chatSessionId: chatSession.id,
      },
    });

    try {
      // Generate AI response
      const messages = [{ role: 'user', content: message }];
      const aiResponse = await generateAIResponse(messages, sessionHistory);

      // Save AI response to database
      await prisma.chatMessage.create({
        data: {
          content: aiResponse.text,
          role: 'assistant',
          chatSessionId: chatSession.id,
        },
      });

      return NextResponse.json({
        message: aiResponse.text,
        chatId: chatSession.id,
      });
    } catch (aiError) {
      console.error('AI response error:', aiError);
      
      // Save error message to database
      const errorMessage = "I'm sorry, I encountered an error processing your request. Please try again later.";
      
      await prisma.chatMessage.create({
        data: {
          content: errorMessage,
          role: 'assistant',
          chatSessionId: chatSession.id,
        },
      });
      
      return NextResponse.json({
        message: errorMessage,
        chatId: chatSession.id,
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'An error occurred during the chat' },
      { status: 500 }
    );
  }
} 