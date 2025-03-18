import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: Get all resources for a user
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
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const searchQuery = url.searchParams.get('q');

    // If id is provided, get a specific resource
    if (id) {
      const resource = await prisma.resource.findUnique({
        where: {
          id,
          userId: session.user.id,
        },
        include: {
          notes: true,
          flashcards: true,
        },
      });

      if (!resource) {
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ resource });
    }

    // Build the filter
    const filter: any = {
      userId: session.user.id,
    };

    if (category) {
      filter.category = category;
    }

    if (type) {
      filter.type = type;
    }

    if (searchQuery) {
      filter.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { has: searchQuery } },
      ];
    }

    // Get all resources for the user with filters
    const resources = await prisma.resource.findMany({
      where: filter,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Resources API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving resources' },
      { status: 500 }
    );
  }
}

// POST: Create a new resource
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
    const { title, description, type, url, coverImage, coverColor, tags, category } = body;
    
    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }

    // Create new resource
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        type,
        url,
        coverImage,
        coverColor,
        tags: tags || [],
        category,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { resource, message: 'Resource created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Resource creation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the resource' },
      { status: 500 }
    );
  }
}

// PATCH: Update a resource
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
    const { id, title, description, type, url, coverImage, coverColor, tags, category, progress, rating } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    // Check if resource exists and belongs to the user
    const existingResource = await prisma.resource.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingResource) {
      return NextResponse.json(
        { error: 'Resource not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the resource
    const resource = await prisma.resource.update({
      where: {
        id,
      },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        type: type !== undefined ? type : undefined,
        url: url !== undefined ? url : undefined,
        coverImage: coverImage !== undefined ? coverImage : undefined,
        coverColor: coverColor !== undefined ? coverColor : undefined,
        tags: tags !== undefined ? tags : undefined,
        category: category !== undefined ? category : undefined,
        progress: progress !== undefined ? progress : undefined,
        rating: rating !== undefined ? rating : undefined,
      },
    });

    return NextResponse.json(
      { resource, message: 'Resource updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resource update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the resource' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a resource
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
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    // Check if resource exists and belongs to the user
    const existingResource = await prisma.resource.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingResource) {
      return NextResponse.json(
        { error: 'Resource not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the resource
    await prisma.resource.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: 'Resource deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resource delete error:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the resource' },
      { status: 500 }
    );
  }
} 