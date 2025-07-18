'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { v2 as cloudinary } from 'cloudinary';
import { geminiService } from '@/lib/gemini-service'; // Import your Gemini Service

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Action to upload an image
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
    const result = await cloudinary.uploader.upload(fileUri, { folder: 'cms-ai-project' });
    return { imageUrl: result.secure_url };
  } catch (error) {
    console.error('Upload error:', error);
    return { error: 'Failed to upload image.' };
  }
}

// Action to UPDATE a post
export async function updatePostAction(prevState: any, formData: FormData) {
  const intent = formData.get('intent') as string;
  const postId = formData.get('postId') as string;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const published = formData.get('published') === 'on';
  const imageUrl = formData.get('imageUrl') as string;
  const tagsString = formData.get('tags') as string;
  const metaDescription = formData.get('metaDescription') as string; // Get the new field

  if (!postId || !title || !content) {
    return { message: 'Post ID, title, and content are required.' };
  }

  const tagObjects = tagsString
    ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => ({
        where: { name: tag },
        create: { name: tag },
      }))
    : [];

  try {
    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        published,
        imageUrl: imageUrl || null,
        metaDescription: metaDescription || null, // Save the new field
        tags: {
          set: [],
          connectOrCreate: tagObjects,
        },
      },
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return { message: 'Database Error: Failed to update post.' };
  }

  revalidatePath('/posts');
  revalidatePath(`/posts/edit/${postId}`);

  if (intent === 'save-and-close') {
    redirect('/posts');
  }

  return { message: 'Post updated successfully.' };
}

// Action to DELETE a post
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
  revalidatePath('/posts');
  redirect('/posts');
}

// NEW: Server Action to generate an SEO meta description
// CORRECTED: Server Action to generate an SEO meta description
export async function generateMetaDescriptionAction(postContent: string) {
  if (!postContent) {
    return { error: 'Post content is required to generate a description.' };
  }
  const prompt = `Based on the following blog post content, write a compelling and concise SEO meta description. The description should be a single paragraph, under 155 characters, and encourage users to click. Do not include any quotation marks in the output. Post Content: "${postContent.replace(/<[^>]*>?/gm, '').substring(0, 1000)}..."`;
  
  try {
    // THE FIX: Use the 'text' property from the response, not 'html'.
    const { text } = await geminiService.generateArticle(prompt);
    return { description: text.trim() };
  } catch (error) {
    console.error('AI Meta Description Error:', error);
    return { error: 'Failed to generate meta description.' };
  }
}

// CORRECTED: Server Action to suggest tags
export async function suggestTagsAction(postContent: string) {
  if (!postContent) {
    return { error: 'Post content is required to suggest tags.' };
  }
  const prompt = `Based on the following blog post content, suggest 5-7 relevant tags. The output should be a single string of comma-separated values. For example: "tech, AI, web development". Do not include any introductory text or quotation marks in the output. Post Content: "${postContent.replace(/<[^>]*>?/gm, '').substring(0, 1000)}..."`;
  
  try {
    // THE FIX: Use the 'text' property from the response, not 'html'.
    const { text } = await geminiService.generateArticle(prompt);
    // Also, remove any potential paragraph tags just in case.
    const cleanTags = text.replace(/<\/?p>/g, '').trim();
    return { tags: cleanTags };
  } catch (error) {
    console.error('AI Tag Suggestion Error:', error);
    return { error: 'Failed to suggest tags.' };
  }
}


// NEW: Server Action to generate affiliate content
export async function generateAffiliateContentAction(productName: string, affiliateLink: string) {
  const prompt = `
    Generate a short, engaging product review section for a blog post.
    The product is "${productName}".
    The output must be a single block of HTML.
    
    It should include:
    1. An <h2> heading with a catchy title for the review section.
    2. A short introductory paragraph.
    3. An <h3> for "Pros" followed by a short unordered list (<ul>) of 4-6 pros.
    4. An <h3> for "Cons" followed by a short unordered list (<ul>) of 2-3 cons.
    5. A concluding paragraph.
    6. A call-to-action button that links to the following affiliate URL: ${affiliateLink}. The button must be a styled <a href="${affiliateLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:10px 20px; background-color:#007bff; color:white; text-decoration:none; border-radius:5px;">Buy Now on Amazon</a>.

    Do not include any text or markdown outside of the main HTML block.
  `;

  try {
    const { html } = await geminiService.generateArticle(prompt);
    return { htmlContent: html };
  } catch (error) {
    console.error('AI Affiliate Content Error:', error);
    return { error: 'Failed to generate affiliate content.' };
  }
}