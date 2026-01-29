import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function ensureUser() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Check if user exists in our database
  let user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  // Create user if they don't exist
  if (!user) {
    const clerkUser = await currentUser()
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress
      }
    })
  }

  return user
}
