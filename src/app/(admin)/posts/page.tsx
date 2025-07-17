import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import PostList from '@/components/PostList';
import { type Post, type Tag } from '@prisma/client';
import { Badge } from '@/components/ui/badge';

type PostWithTags = Post & {
  tags: Tag[];
};

// Fetches all posts
async function getPosts(): Promise<PostWithTags[]> {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tags: true },
  });
  return posts;
}

// Fetches all unique tags
async function getAllTags() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });
  return tags;
}

export default async function PostsPage() {
  // Fetch both posts and tags at the same time for efficiency
  const [posts, tags] = await Promise.all([getPosts(), getAllTags()]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
        <Button asChild>
          <Link href="/posts/new">Create Post</Link>
        </Button>
      </div>

      {/* Display the clickable tag filters */}
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
      
      {/* Display the list of posts */}
      <PostList posts={posts} />
    </div>
  );
}