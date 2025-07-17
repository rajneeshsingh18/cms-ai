import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditPostForm from './EditPostForm';

interface EditPostPageProps {
  params: {
    id: string;
  };
}

async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: true,
    },
  });
  return post;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  // First, validate that params.id exists
  if (!params.id) {
    return notFound();
  }

  // Then, fetch the post
  const post = await getPost(params.id);

  // If no post is found for the ID, render the 404 page
  if (!post) {
    notFound();
  }

  // Pass the fully fetched post data to the client component
  return <EditPostForm post={post} />;
}