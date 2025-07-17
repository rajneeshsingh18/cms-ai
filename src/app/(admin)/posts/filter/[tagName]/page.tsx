import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostList from '@/components/PostList';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface FilteredPostsPageProps {
  params: {
    tagName: string;
  };
}

/**
 * Fetches all posts that are associated with a specific tag name.
 */
async function getPostsByTag(tagName: string) {
  const posts = await prisma.post.findMany({
    where: {
      tags: {
        some: { // 'some' finds posts where at least one tag matches the condition
          name: decodeURIComponent(tagName), // Decode the URL-encoded tag name
        },
      },
    },
    include: {
      tags: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!posts) {
    notFound();
  }

  return posts;
}

export default async function FilteredPostsPage({ params }: FilteredPostsPageProps) {
  const tagName = decodeURIComponent(params.tagName);
  const posts = await getPostsByTag(tagName);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Posts Tagged With:
          </h1>
          <Badge className="text-lg mt-2">{tagName}</Badge>
        </div>
        <Link href="/posts" className="text-sm hover:underline">
          &larr; Back to all posts
        </Link>
      </div>
      
      {/* We reuse the same PostList component to display the filtered results! */}
      <PostList posts={posts} />
    </div>
  );
}