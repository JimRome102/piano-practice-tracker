import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if DATABASE_URL is set
    const hasDatabaseUrl = !!process.env.DATABASE_URL

    // Check if Clerk keys are set
    const hasClerkPublic = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    const hasClerkSecret = !!process.env.CLERK_SECRET_KEY

    // Try to connect to database
    let dbConnected = false
    let dbError = null
    try {
      await prisma.$connect()
      dbConnected = true
    } catch (error: any) {
      dbError = error.message
    } finally {
      await prisma.$disconnect()
    }

    return NextResponse.json({
      status: 'ok',
      environment: {
        hasDatabaseUrl,
        hasClerkPublic,
        hasClerkSecret,
      },
      database: {
        connected: dbConnected,
        error: dbError
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}
