import { ensureUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { DeletePieceButton } from './delete-button';

export default async function RepertoirePage() {
  const user = await ensureUser();

  const pieces = await prisma.piece.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      workBlocks: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Repertoire</h1>
            </div>
            <Link
              href="/repertoire/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Piece
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pieces.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-600 mb-4">No pieces yet</p>
            <Link
              href="/repertoire/new"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Your First Piece
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pieces.map((piece) => (
              <div key={piece.id} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{piece.title}</h3>
                    <p className="text-gray-600">{piece.composer}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
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
                  <div className="flex flex-wrap gap-1 mb-3">
                    {piece.tags.split(',').map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {piece.workBlocks.length > 0 && (
                  <p className="text-sm text-gray-500 mb-3">
                    Last practiced: {new Date(piece.workBlocks[0].createdAt).toLocaleDateString()}
                  </p>
                )}

                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/pieces/${piece.id}`}
                    className="flex-1 text-center bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 text-sm"
                  >
                    View
                  </Link>
                  <Link
                    href={`/repertoire/edit/${piece.id}`}
                    className="flex-1 text-center bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 text-sm"
                  >
                    Edit
                  </Link>
                  <DeletePieceButton pieceId={piece.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
