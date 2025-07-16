import { auth } from '@clerk/nextjs/server'

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')
  return { userId }
}