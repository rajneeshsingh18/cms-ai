'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new tag in the database.
 * @param formData Contains the 'name' of the new tag.
 * @returns An object with a 'success' or 'error' message.
 */
export async function createTagAction(formData: FormData) {
  const name = formData.get('name') as string;

  if (!name) {
    return { error: 'Tag name is required.' };
  }

  try {
    const existingTag = await prisma.tag.findUnique({ where: { name } });
    if (existingTag) {
      return { error: `A tag named "${name}" already exists.` };
    }

    await prisma.tag.create({
      data: { name },
    });
    
    revalidatePath('/dashboard/tags');
    return { success: `Tag "${name}" created successfully.` };
  } catch (error) {
    return { error: 'Failed to create tag.' };
  }
}

/**
 * Updates an existing tag's name.
 * @param formData Contains the 'tagId' and the 'name' for the update.
 * @returns An object with a 'success' or 'error' message.
 */
export async function updateTagAction(formData: FormData) {
  const id = formData.get('tagId') as string;
  const newName = formData.get('name') as string;

  if (!id || !newName) {
    return { error: 'Missing required fields.' };
  }

  try {
    const existingTagWithNewName = await prisma.tag.findUnique({
      where: { name: newName },
    });

    if (existingTagWithNewName && existingTagWithNewName.id !== id) {
      return { error: `A tag named "${newName}" already exists.` };
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: { name: newName },
    });

    revalidatePath('/dashboard/tags');
    return { success: `Tag renamed to "${updatedTag.name}".` };
  } catch (error) {
    return { error: 'Failed to update tag.' };
  }
}

/**
 * Deletes a tag from the database.
 * @param formData Contains the 'tagId' of the tag to delete.
 * @returns An object with a 'success' or 'error' message.
 */
export async function deleteTagAction(formData: FormData) {
  const id = formData.get('tagId') as string;

  if (!id) {
    return { error: 'Tag ID is required.' };
  }

  try {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      return { error: 'Tag not found.' };
    }

    await prisma.tag.delete({ where: { id } });

    revalidatePath('/dashboard/tags');
    return { success: `Tag "${tag.name}" has been deleted.` };
  } catch (error) {
    return { error: 'Failed to delete tag.' };
  }
}