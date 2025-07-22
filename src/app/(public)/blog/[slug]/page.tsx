import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';

interface PostPageProps {
  params: {
    slug: string;
  };
}

// Function to fetch a single published post by its slug
async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      tags: true,
    },
  });
  return post;
}

// Function to generate dynamic metadata for SEO
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'This post could not be found.',
    };
  }

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

// Statically generate routes for all posts at build time
export async function generateStaticParams() {
    const posts = await prisma.post.findMany({ where: { published: true } });
    return posts.map((post) => ({
      slug: post.slug,
    }));
}


export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-amber-100 py-8 md:py-12">
      <article className="max-w-4xl mx-auto p-6 sm:p-8 md:p-10 bg-white border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg">
        {/* Post Header */}
        <header className="border-b-2 border-foreground pb-6 mb-6">
            {post.imageUrl && (
                <div className="relative h-72 md:h-96 w-full mb-8 border-2 border-foreground rounded-md overflow-hidden">
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold font-serif tracking-tight mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm font-mono text-foreground/80">
                <span>Published on {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="text-foreground/50">|</span>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                        <Badge 
                          key={tag.id}
                          className="bg-amber-200 text-foreground border-2 border-foreground rounded-none font-mono text-xs px-2 py-0.5"
                        >
                          {tag.name}
                        </Badge>
                    ))}
                </div>
            </div>
        </header>

        {/* Post Content with Enhanced Readability */}
        <div
          className="prose prose-lg lg:prose-xl max-w-none
                     prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground
                     prose-p:text-foreground/90 prose-p:leading-relaxed
                     prose-a:text-blue-600 prose-a:font-semibold prose-a:underline hover:prose-a:text-blue-800
                     prose-blockquote:font-mono prose-blockquote:border-l-4 prose-blockquote:border-foreground prose-blockquote:bg-amber-50 prose-blockquote:p-4
                     prose-ul:list-disc prose-ol:list-decimal
                     prose-strong:font-bold prose-strong:text-foreground
                     prose-code:font-mono prose-code:bg-amber-100 prose-code:p-1 prose-code:rounded-sm prose-code:border prose-code:border-foreground/20"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}