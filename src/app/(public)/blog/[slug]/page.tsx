import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next'; // Import the Metadata type

interface PostPageProps {
  params: {
    slug: string;
  };
}

// Function to fetch a single published post by its slug (reused for metadata and page)
async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      tags: true,
    },
  });
  return post;
}

// NEW: Function to generate dynamic metadata
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'This post could not be found.',
    };
  }

  // Create a plain text excerpt for the meta description
  const excerpt = post.content.replace(/<[^>]*>?/gm, '').substring(0, 150);

  return {
    title: `${post.title} | My AI Blog`,
    description: excerpt,
    openGraph: {
      title: post.title,
      description: excerpt,
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
  };
}

// ... (generateStaticParams function remains the same) ...

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
      {/* ... (rest of the page component remains the same) ... */}
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
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}