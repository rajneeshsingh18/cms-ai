import { prisma } from '@/lib/prisma';
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
      published: true,
      tags: {
        some: {
          name: decodeURIComponent(tagName),
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

  return (
    <main className="bg-amber-50 min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4">
        <header className="text-center mb-16 md:mb-20">
          <h1 
            className="text-4xl md:text-5xl font-bold font-serif tracking-tighter text-foreground"
            style={{ textShadow: '2px 2px 2px rgba(0,0,0,1)' }}
          >
            Posts Tagged With
          </h1>
          <Badge 
            className="text-2xl mt-4 bg-amber-100 text-foreground border-2 border-foreground rounded-none font-mono px-4 py-2"
          >
            {tagName}
          </Badge>
        </header>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-foreground">
            <h2 className="text-2xl md:text-3xl font-semibold font-serif text-foreground">
              No Posts Found
            </h2>
            <p className="mt-2 text-foreground/80 font-mono max-w-md mx-auto">
              There are no posts with this tag yet. Try exploring others!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}