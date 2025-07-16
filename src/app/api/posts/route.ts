import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Generates a unique, URL-friendly slug from a title.
 * Appends a random 6-character string to prevent collisions.
 */
function createUniqueSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
  
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Handles GET requests to fetch all posts.
 */
export async function GET() {
  // This route is protected, but we are fetching for an admin
  // so we can assume they should see all posts.
  // Add auth check for security.
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}


/**
 * Handles POST requests to create a new post.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        slug: createUniqueSlug(title),
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}