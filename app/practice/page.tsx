import Link from 'next/link';
import { ensureUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

async function startSession() {
  'use server';
  const user = await ensureUser();

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      startedAt: new Date(),
    }
  });

  redirect(`/practice/${session.id}`);
}

export default async function PracticePage() {
  const user = await ensureUser();

  const pieces = await prisma.piece.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' }
  });

  const activeSessions = await prisma.session.findMany({
    where: {
      userId: user.id,
      endedAt: null
    },
    orderBy: { startedAt: 'desc' },
    take: 1
  });

  if (activeSessions.length > 0) {
    redirect(`/practice/${activeSessions[0].id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Start Practice Session</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border p-8 text-center">
          {pieces.length === 0 ? (
            <div>
              <p className="text-gray-600 mb-4">
                You need to add pieces to your repertoire before starting a practice session.
              </p>
              <Link
                href="/repertoire/new"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Add Your First Piece
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-xl text-gray-700 mb-6">
                Ready to practice? Start a new session to log your work.
              </p>
              <form action={startSession}>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700"
                >
                  Start Practice Session
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
