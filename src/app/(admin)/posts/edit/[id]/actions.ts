'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (it's safe to have this in multiple action files)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Re-using the image upload action
export async function uploadImageAction(formData: FormData) {
  const file = formData.get('image') as File;
  if (!file || file.size === 0) {
    return { error: 'No image provided.' };
  }

  try {
    const fileBuffer = await file.arrayBuffer();
    const mime = file.type;
    const encoding = 'base64';
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    const fileUri = `data:${mime};${encoding},${base64Data}`;

    const result = await cloudinary.uploader.upload(fileUri, {
      folder: 'cms-ai-project',
    });
    
    return { imageUrl: result.secure_url };
  } catch (error) {
    console.error('Upload error:', error);
    return { error: 'Failed to upload image.' };
  }
}

// Server Action to UPDATE a post
export async function updatePostAction(prevState: any, formData: FormData) {
  const intent = formData.get('intent') as string;
  const postId = formData.get('postId') as string;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const published = formData.get('published') === 'on';
  const imageUrl = formData.get('imageUrl') as string;
  const tagsString = formData.get('tags') as string;

  if (!postId || !title || !content) {
    return { message: 'Post ID, title, and content are required.' };
  }

  const tagObjects = tagsString
    ? tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => ({
          where: { name: tag },
          create: { name: tag },
        }))
    : [];

  try {
    // Use `update` to modify the existing post
    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        published,
        imageUrl: imageUrl || null,
        tags: {
          set: [], // Disconnect all existing tags first
          connectOrCreate: tagObjects, // Connect the new set of tags
        },
      },
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return { message: 'Database Error: Failed to update post.' };
  }

  // Always revalidate after a successful update
  revalidatePath('/posts');
  revalidatePath(`/posts/edit/${postId}`);

  // Now, check the intent to decide whether to redirect
  if (intent === 'save-and-close') {
    redirect('/posts'); // This will now correctly stop execution and redirect
  }

  // If the intent was not 'save-and-close', it was an autosave.
  // Return a success message for the autosave status.
  return { message: 'Post updated successfully.' };
}

// Server Action to DELETE a post
export async function deletePostAction(postId: string) {
  if (!postId) {
    throw new Error('Post ID is required.');
  }
  
  try {
    await prisma.post.delete({
      where: { id: postId },
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    throw new Error('Failed to delete post.');
  }

  // On successful deletion, revalidate and redirect
  revalidatePath('/posts');
  redirect('/posts');
}