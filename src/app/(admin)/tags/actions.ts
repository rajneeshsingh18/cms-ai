'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteTagAction(tagId: string) {
  if (!tagId) {
    return { error: 'Tag ID is required.' };
  }

  try {
    // Find the tag to get its name for the success message
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      return { error: 'Tag not found.' };
    }

    // Delete the tag
    await prisma.tag.delete({
      where: { id: tagId },
    });

    // Revalidate the tags page to show the updated list
    revalidatePath('/tags');
    return { success: `Tag "${tag.name}" has been deleted.` };

  } catch (error) {
    console.error('Error deleting tag:', error);
    return { error: 'Failed to delete tag.' };
  }
}

// NEW: Server Action to update a tag's name
export async function updateTagAction(tagId: string, newName: string) {
  if (!tagId || !newName) {
    return { error: 'Tag ID and new name are required.' };
  }

  try {
    // Check if a tag with the new name already exists to prevent duplicates
    const existingTag = await prisma.tag.findUnique({
      where: { name: newName },
    });

    if (existingTag && existingTag.id !== tagId) {
      return { error: `A tag named "${newName}" already exists.` };
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: { name: newName },
    });

    revalidatePath('/tags');
    return { success: `Tag renamed to "${updatedTag.name}" successfully.` };
  } catch (error) {
    console.error('Error updating tag:', error);
    return { error: 'Failed to update tag.' };
  }
}