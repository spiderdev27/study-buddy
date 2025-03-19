import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract data from the request body
    const { studyTopicId, startTime, endTime, distractionCount } = await req.json();
    
    // Validate required fields
    if (!studyTopicId || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Calculate duration if start and end times are provided
    let duration = null;
    if (startTime && endTime) {
      duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);
    }
    
    // Create a new study session
    const studySession = await prisma.studySession.create({
      data: {
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
        distractionCount: distractionCount || 0,
        studyTopic: {
          connect: { id: studyTopicId }
        },
        user: {
          connect: { id: session.user.id }
        }
      }
    });
    
    // Update the topic status to in-progress if it's not already completed
    await prisma.studyTopic.updateMany({
      where: {
        id: studyTopicId,
        status: {
          not: 'completed'
        }
      },
      data: {
        status: 'in_progress'
      }
    });
    
    // Return the created study session
    return NextResponse.json(studySession);
    
  } catch (error) {
    console.error("Error creating study session:", error);
    return NextResponse.json(
      { error: 'Failed to create study session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');
    
    // Build query
    const query: any = {
      where: {
        userId: session.user.id
      },
      orderBy: {
        startTime: 'desc'
      },
      include: {
        studyTopic: {
          select: {
            id: true,
            title: true
          }
        }
      }
    };
    
    // Add topic filter if provided
    if (topicId) {
      query.where.studyTopicId = topicId;
    }
    
    // Get the study sessions
    const studySessions = await prisma.studySession.findMany(query);
    
    // Return the study sessions
    return NextResponse.json(studySessions);
    
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    return NextResponse.json(
      { error: 'Failed to fetch study sessions' },
      { status: 500 }
    );
  }
} 