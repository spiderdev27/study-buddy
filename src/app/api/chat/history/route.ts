import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get URL params
    const url = new URL(request.url);
    const chatId = url.searchParams.get('chatId');

    // If chatId is provided, get messages for that chat
    if (chatId) {
      const chatSession = await prisma.chatSession.findUnique({
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

      if (!chatSession) {
        return NextResponse.json(
          { error: 'Chat session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ chatSession });
    }

    // Otherwise, get all chat sessions for the user
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Just get the last message for preview
        },
      },
    });

    return NextResponse.json({ chatSessions });
  } catch (error) {
    console.error('Chat history API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving chat history' },
      { status: 500 }
    );
  }
} 