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