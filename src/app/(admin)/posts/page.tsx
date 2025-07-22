import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import PostList from '@/components/PostList'; // Assuming this component renders your styled PostCards
import { type Post, type Tag } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import PaginationControls from '@/components/PaginationControls';

const POSTS_PER_PAGE = 10;

type PostWithTags = Post & {
  tags: Tag[];
};

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
  
  const [{ posts, totalPosts }, tags] = await Promise.all([
    getPaginatedPosts(page),
    getAllTags(),
  ]);

  const hasNextPage = page * POSTS_PER_PAGE < totalPosts;
  const hasPrevPage = page > 1;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-wide">Posts</h1>
        <Button 
          asChild
          className="bg-foreground text-amber-50 rounded-md border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <Link href="/posts/new">Create Post</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b-2 border-foreground pb-6">
        <Link href="/dashboard/posts">
            <Badge className="bg-amber-200 text-foreground border-2 border-foreground rounded-none font-mono text-xs px-3 py-1 hover:bg-amber-300">
              All Posts
            </Badge>
        </Link>
        {tags.map((tag) => (
          <Link href={`/dashboard/posts/filter/${encodeURIComponent(tag.name)}`} key={tag.id}>
            <Badge className="bg-white text-foreground border-2 border-foreground rounded-none font-mono text-xs px-3 py-1 hover:bg-amber-100">
              {tag.name}
            </Badge>
          </Link>
        ))}
      </div>
      
      <div className="flex-grow">
        <PostList posts={posts} />
      </div>

      <div className="mt-8">
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