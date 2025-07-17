'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from your .env.local file
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Action to upload an image to Cloudinary
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
    console.error('Cloudinary Upload Error:', error);
    return { error: 'Failed to upload image.' };
  }
}

// Action to create the post in the database
export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const published = formData.get('published') === 'on';
  const imageUrl = formData.get('imageUrl') as string;

  if (!title || !content) {
    return { message: 'Title and content are required.' };
  }

  try {
    await prisma.post.create({
      data: {
        title,
        content,
        published,
        slug: createUniqueSlug(title),
        imageUrl: imageUrl || null,
        tags: [],
      },
    });
  } catch (e) {
    console.error('Database Create Error:', e);
    return { message: 'Database Error: Failed to create post.' };
  }

  // On success, clear the cache and redirect
  revalidatePath('/posts'); 
  redirect('/posts');
}

function createUniqueSlug(title: string): string {
  const baseSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}