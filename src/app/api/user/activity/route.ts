import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/user/activity - Get user activity data
export async function GET() {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    console.log("Activity API - Session:", session?.user?.id);

    // Check if user is authenticated
    if (!session || !session.user) {
      console.log("Activity API - User not authenticated");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("Activity API - User not found:", userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get study sessions for the user
    const studySessions = await prisma.studySession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to 10 most recent sessions
    });
    console.log("Activity API - Found study sessions:", studySessions.length);

    // Get total study time
    const totalStudyTime = await prisma.studySession.aggregate({
      where: { userId },
      _sum: { duration: true },
    });
    console.log("Activity API - Total study time:", totalStudyTime._sum.duration);

    // Get streak data
    const currentStreak = user.currentStreak || 0;
    console.log("Activity API - Current streak:", currentStreak);
    
    const response = {
      studySessions,
      stats: {
        totalStudyTime: totalStudyTime._sum.duration || 0,
        currentStreak
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user activity' },
      { status: 500 }
    );
  }
} 