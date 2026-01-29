import Link from 'next/link';
import { ensureUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { WorkBlockForm } from './work-block-form';

async function addWorkBlock(sessionId: string, formData: FormData) {
  'use server';
  const user = await ensureUser();

  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId: user.id }
  });

  if (!session) {
    throw new Error('Session not found');
  }

  await prisma.workBlock.create({
    data: {
      sessionId,
      pieceId: formData.get('pieceId') as string,
      section: formData.get('section') as string,
      focusTags: formData.get('focusTags') as string,
      minutes: formData.get('minutes') ? parseInt(formData.get('minutes') as string) : null,
      tempoNote: (formData.get('tempoNote') as string) || null,
      improved: (formData.get('improved') as string) || null,
      sticky: (formData.get('sticky') as string) || null,
    }
  });

  revalidatePath(`/practice/${sessionId}`);
}

async function endSession(sessionId: string) {
  'use server';
  const user = await ensureUser();

  const workBlocks = await prisma.workBlock.findMany({
    where: { sessionId }
  });

  const totalMinutes = workBlocks.reduce((sum, block) => sum + (block.minutes || 0), 0);

  await prisma.session.updateMany({
    where: { id: sessionId, userId: user.id },
    data: {
      endedAt: new Date(),
      totalMinutes: totalMinutes > 0 ? totalMinutes : null
    }
  });

  redirect('/dashboard');
}

export default async function PracticeSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await ensureUser();

  const session = await prisma.session.findFirst({
    where: { id, userId: user.id },
    include: {
      workBlocks: {
        include: {
          piece: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!session) {
    notFound();
  }

  if (session.endedAt) {
    redirect('/dashboard');
  }

  const pieces = await prisma.piece.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' }
  });

  const totalMinutes = session.workBlocks.reduce((sum, block) => sum + (block.minutes || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Practice Session</h1>
              <p className="text-sm text-gray-600">
                Started {new Date(session.startedAt).toLocaleTimeString()} • {totalMinutes} min total
              </p>
            </div>
            <form action={endSession.bind(null, session.id)}>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                End Session
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add Work Block</h2>
              <WorkBlockForm
                pieces={pieces}
                sessionId={session.id}
                addWorkBlock={addWorkBlock}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Work Blocks ({session.workBlocks.length})
              </h2>
              {session.workBlocks.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No work blocks yet. Use the form to log your practice.
                </p>
              ) : (
                <div className="space-y-4">
                  {session.workBlocks.map((block) => (
                    <div key={block.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {block.piece.title} - {block.section}
                          </p>
                          <p className="text-sm text-gray-600">
                            {block.piece.composer}
                            {block.minutes && ` • ${block.minutes} min`}
                            {block.tempoNote && ` • ${block.tempoNote}`}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {block.focusTags.split(',').map((tag) => (
                            <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {block.improved && (
                        <p className="text-sm text-green-700 mb-1">
                          ✓ Improved: {block.improved}
                        </p>
                      )}
                      {block.sticky && (
                        <p className="text-sm text-orange-700">
                          ⚠ Still sticky: {block.sticky}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
