import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

/**
 * Fetches all tags from the database and includes a count of how many
 * PUBLISHED posts are associated with each tag.
 */
async function getAllTags() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { 
          posts: { where: { published: true } } // Only count published posts
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Filter out tags that have no published posts
  return tags.filter(tag => tag._count.posts > 0);
}

export default async function PublicTagsPage() {
  const tags = await getAllTags();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Browse by Tag
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Explore content by topics you're interested in.
        </p>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {tags.map((tag) => (
            <Link href={`/tags/${tag.name}`} key={tag.id}>
              <Badge 
                variant="outline" 
                className="text-lg py-2 px-4 transition-all hover:bg-accent hover:scale-105"
              >
                {tag.name} ({tag._count.posts})
              </Badge>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold">No tags yet!</h2>
          <p className="text-muted-foreground mt-2">
            Once posts are published with tags, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
}