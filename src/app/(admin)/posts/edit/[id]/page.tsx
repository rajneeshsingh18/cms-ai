import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditPostForm from './EditPostForm'; // We will create this component next

interface EditPostPageProps {
  params: {
    id: string;
  };
}

// Function to fetch a single post by its ID
async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: true, // Also fetch the post's tags
    },
  });
  return post;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const post = await getPost(params.id);

  // If no post is found for the ID, show a 404 page
  if (!post) {
    return notFound();
  }

  // Pass the fetched post data to a client component for the form
  return <EditPostForm post={post} />;
}