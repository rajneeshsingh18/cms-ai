import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import PostList from '@/components/PostList';
import { type Post, type Tag } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import PaginationControls from '@/components/PaginationControls';

const POSTS_PER_PAGE = 10; // Define how many posts to show per page

type PostWithTags = Post & {
  tags: Tag[];
};

/**
 * Fetches a paginated list of posts and the total post count.
 */
async function getPaginatedPosts(page: number = 1): Promise<{ posts: PostWithTags[], totalPosts: number }> {
  const skip = (page - 1) * POSTS_PER_PAGE;
  const take = POSTS_PER_PAGE;

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tags: true },
      skip,
      take,
    }),
    prisma.post.count(),
  ]);

  return { posts, totalPosts };
}

/**
 * Fetches all unique tags from the database.
 */
async function getAllTags() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });
  return tags;
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams['page']) || 1;
  
  // Fetch paginated posts and all tags concurrently
  const [{ posts, totalPosts }, tags] = await Promise.all([
    getPaginatedPosts(page),
    getAllTags(),
  ]);

  const hasNextPage = page * POSTS_PER_PAGE < totalPosts;
  const hasPrevPage = page > 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
        <Button asChild>
          <Link href="/posts/new">Create Post</Link>
        </Button>
      </div>

      {/* Preserve the clickable tag filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/posts">
            <Badge variant="default">All Posts</Badge>
        </Link>
        {tags.map((tag) => (
          <Link href={`/posts/filter/${encodeURIComponent(tag.name)}`} key={tag.id}>
            <Badge variant="outline">{tag.name}</Badge>
          </Link>
        ))}
      </div>
      
      {/* Display the list of posts for the current page */}
      <PostList posts={posts} />

      {/* Add the pagination controls at the bottom */}
      <div className="mt-6">
        <PaginationControls
          currentPage={page}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          basePath="/posts"
        />
      </div>
    </div>
  );
}