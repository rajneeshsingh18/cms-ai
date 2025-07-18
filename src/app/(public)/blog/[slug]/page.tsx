import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface PostPageProps {
  params: {
    slug: string;
  };
}

/**
 * Fetches a single published post by its slug, including its tags.
 */
async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug, published: true }, // Only find published posts
    include: {
      tags: true,
    },
  });
  return post;
}

/**
 * Generates a list of all published post slugs at build time for static generation.
 */
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound(); // If no post with this slug is found, show a 404 page
  }

  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
      {post.imageUrl && (
        <div className="relative h-96 w-full mb-8">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">{post.title}</h1>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
        <span>Published on {new Date(post.createdAt).toLocaleDateString()}</span>
        <div className="flex gap-2">
            {post.tags.map(tag => (
                <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
            ))}
        </div>
      </div>

      {/* This container will correctly style your HTML content */}
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}