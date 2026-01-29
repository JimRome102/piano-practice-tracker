import Link from 'next/link';
import { ensureUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function PieceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await ensureUser();

  const piece = await prisma.piece.findFirst({
    where: { id, userId: user.id },
    include: {
      workBlocks: {
        include: {
          session: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      plans: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!piece) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/repertoire" className="text-gray-600 hover:text-gray-900">
                ← Back to Repertoire
              </Link>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/plan/generate/${piece.id}`}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Generate Practice Plan
              </Link>
              <Link
                href={`/repertoire/edit/${piece.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{piece.title}</h1>
              <p className="text-xl text-gray-600 mt-1">{piece.composer}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                piece.status === 'learning'
                  ? 'bg-yellow-100 text-yellow-800'
                  : piece.status === 'polishing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {piece.status}
            </span>
          </div>

          {piece.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {piece.tags.split(',').map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {piece.notes && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-700">{piece.notes}</p>
            </div>
          )}

          {piece.links && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Links</h3>
              <a
                href={piece.links}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {piece.links}
              </a>
            </div>
          )}
        </div>

        {piece.plans.length > 0 && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Practice Plan</h2>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Generated {new Date(piece.plans[0].createdAt).toLocaleDateString()} ({piece.plans[0].durationChoice} min)
              </p>
              <Link
                href={`/plan/${piece.plans[0].id}`}
                className="text-blue-600 hover:underline"
              >
                View Plan →
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Practice</h2>
          {piece.workBlocks.length === 0 ? (
            <p className="text-gray-600">No practice sessions yet</p>
          ) : (
            <div className="space-y-4">
              {piece.workBlocks.map((block) => (
                <div key={block.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{block.section}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(block.session.startedAt).toLocaleDateString()}
                        {block.minutes && ` • ${block.minutes} min`}
                        {block.tempoNote && ` • ${block.tempoNote}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {block.focusTags.split(',').map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
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
      </main>
    </div>
  );
}
