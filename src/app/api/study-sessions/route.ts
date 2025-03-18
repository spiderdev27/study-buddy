import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: Get study sessions for a user
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
    const id = url.searchParams.get('id');

    // If id is provided, get a specific study session
    if (id) {
      const studySession = await prisma.studySession.findUnique({
        where: {
          id,
          userId: session.user.id,
        },
      });

      if (!studySession) {
        return NextResponse.json(
          { error: 'Study session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ studySession });
    }

    // Get all study sessions for the user
    const studySessions = await prisma.studySession.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json({ studySessions });
  } catch (error) {
    console.error('Study sessions API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving study sessions' },
      { status: 500 }
    );
  }
}

// POST: Create a new study session
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
    const { startTime, topic } = body;
    
    if (!startTime) {
      return NextResponse.json(
        { error: 'Start time is required' },
        { status: 400 }
      );
    }

    // Create new study session
    const studySession = await prisma.studySession.create({
      data: {
        startTime: new Date(startTime),
        topic,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { studySession, message: 'Study session created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Study session creation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the study session' },
      { status: 500 }
    );
  }
}

// PATCH: Update a study session (e.g., end a session)
export async function PATCH(request: Request) {
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
    const { id, endTime, notes } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Study session ID is required' },
        { status: 400 }
      );
    }

    // Check if study session exists and belongs to the user
    const existingSession = await prisma.studySession.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Study session not found or unauthorized' },
        { status: 404 }
      );
    }

    // Calculate duration if endTime is provided
    let duration = undefined;
    let endTimeDate = undefined;
    
    if (endTime) {
      endTimeDate = new Date(endTime);
      const startTimeMs = existingSession.startTime.getTime();
      const endTimeMs = endTimeDate.getTime();
      
      // Calculate duration in minutes
      duration = (endTimeMs - startTimeMs) / (1000 * 60);
      
      // Update user's total study hours
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          totalStudyHours: {
            increment: duration / 60, // Convert minutes to hours
          },
        },
      });
    }

    // Update the study session
    const studySession = await prisma.studySession.update({
      where: {
        id,
      },
      data: {
        endTime: endTimeDate,
        duration,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json(
      { studySession, message: 'Study session updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Study session update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the study session' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a study session
export async function DELETE(request: Request) {
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
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Study session ID is required' },
        { status: 400 }
      );
    }

    // Check if study session exists and belongs to the user
    const existingSession = await prisma.studySession.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Study session not found or unauthorized' },
        { status: 404 }
      );
    }

    // If the session has a duration, subtract it from the user's total study hours
    if (existingSession.duration) {
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          totalStudyHours: {
            decrement: existingSession.duration / 60, // Convert minutes to hours
          },
        },
      });
    }

    // Delete the study session
    await prisma.studySession.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: 'Study session deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Study session delete error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the study session' },
      { status: 500 }
    );
  }
} 