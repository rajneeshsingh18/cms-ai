import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostDisplay from '@/components/PostDisplay'; // Import the new component

// ... (keep the getPost and generateStaticParams functions as they are) ...
async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      tags: true,
    },
  });
  return post;
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}


export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  // The page now simply fetches the data and passes it to the display component
  return <PostDisplay post={post} />;
}