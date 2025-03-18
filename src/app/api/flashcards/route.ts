import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateFlashcards } from '@/lib/gemini';

// GET: Get all flashcards for a user
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
    const resourceId = url.searchParams.get('resourceId');
    const tag = url.searchParams.get('tag');
    const difficulty = url.searchParams.get('difficulty');

    // If id is provided, get a specific flashcard
    if (id) {
      const flashcard = await prisma.flashcard.findUnique({
        where: {
          id,
          userId: session.user.id,
        },
      });

      if (!flashcard) {
        return NextResponse.json(
          { error: 'Flashcard not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ flashcard });
    }

    // Build the filter
    const filter: any = {
      userId: session.user.id,
    };

    if (resourceId) {
      filter.resourceId = resourceId;
    }

    if (tag) {
      filter.tags = { has: tag };
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Get all flashcards for the user with filters
    const flashcards = await prisma.flashcard.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error('Flashcards API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving flashcards' },
      { status: 500 }
    );
  }
}

// POST: Create a new flashcard
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
    const { question, answer, tags, difficulty, resourceId, generateFromContent } = body;
    
    // If generateFromContent is provided, use Gemini to generate flashcards
    if (generateFromContent) {
      try {
        const numberOfCards = body.numberOfCards || 5;
        const generatedFlashcards = await generateFlashcards(
          generateFromContent,
          numberOfCards
        );
        
        if (!generatedFlashcards || generatedFlashcards.length === 0) {
          return NextResponse.json(
            { error: 'Failed to generate flashcards' },
            { status: 400 }
          );
        }
        
        // Create the flashcards in the database
        const createdFlashcards = await Promise.all(
          generatedFlashcards.map(async (card: any) => {
            return prisma.flashcard.create({
              data: {
                question: card.question,
                answer: card.answer,
                tags: tags || [],
                difficulty: difficulty || 'medium',
                resourceId: resourceId || null,
                userId: session.user.id,
              },
            });
          })
        );
        
        return NextResponse.json(
          { flashcards: createdFlashcards, message: 'Flashcards generated successfully' },
          { status: 201 }
        );
      } catch (error) {
        console.error('Flashcard generation error:', error);
        return NextResponse.json(
          { error: 'An error occurred while generating flashcards' },
          { status: 500 }
        );
      }
    }
    
    // Manual flashcard creation
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    // Create new flashcard
    const flashcard = await prisma.flashcard.create({
      data: {
        question,
        answer,
        tags: tags || [],
        difficulty: difficulty || 'medium',
        resourceId: resourceId || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { flashcard, message: 'Flashcard created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Flashcard creation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the flashcard' },
      { status: 500 }
    );
  }
}

// PATCH: Update a flashcard
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
    const { id, question, answer, tags, difficulty, nextReview } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Flashcard ID is required' },
        { status: 400 }
      );
    }

    // Check if flashcard exists and belongs to the user
    const existingFlashcard = await prisma.flashcard.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingFlashcard) {
      return NextResponse.json(
        { error: 'Flashcard not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the flashcard
    const flashcard = await prisma.flashcard.update({
      where: {
        id,
      },
      data: {
        question: question !== undefined ? question : undefined,
        answer: answer !== undefined ? answer : undefined,
        tags: tags !== undefined ? tags : undefined,
        difficulty: difficulty !== undefined ? difficulty : undefined,
        nextReview: nextReview !== undefined ? nextReview : undefined,
      },
    });

    return NextResponse.json(
      { flashcard, message: 'Flashcard updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Flashcard update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the flashcard' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a flashcard
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
        { error: 'Flashcard ID is required' },
        { status: 400 }
      );
    }

    // Check if flashcard exists and belongs to the user
    const existingFlashcard = await prisma.flashcard.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingFlashcard) {
      return NextResponse.json(
        { error: 'Flashcard not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the flashcard
    await prisma.flashcard.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: 'Flashcard deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Flashcard delete error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the flashcard' },
      { status: 500 }
    );
  }
} 