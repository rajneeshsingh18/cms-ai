import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { Badge } from '@/components/ui/badge';

interface PublicTagPageProps {
  params: {
    tagName: string;
  };
}

/**
 * Fetches all PUBLISHED posts associated with a specific tag name.
 */
async function getPostsByTag(tagName: string) {
  const posts = await prisma.post.findMany({
    where: {
      published: true, // Only get published posts
      tags: {
        some: { // Find posts where at least one tag matches the condition
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

  return posts;
}

export default async function PublicTagPage({ params }: PublicTagPageProps) {
  const tagName = decodeURIComponent(params.tagName);
  const posts = await getPostsByTag(tagName);

  if (posts.length === 0) {
    // You can either show a 404 or a message that no posts were found
    // For a better user experience, let's show a message.
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Posts Tagged With
        </h1>
        <Badge className="text-2xl mt-4">{tagName}</Badge>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold">No posts found for this tag.</h2>
          <p className="text-muted-foreground mt-2">
            Try exploring other tags.
          </p>
        </div>
      )}
    </main>
  );
}