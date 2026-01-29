import Link from 'next/link';
import { ensureUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';

async function getWeeklyStats(userId: string) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const sessions = await prisma.session.findMany({
    where: {
      userId,
      startedAt: { gte: oneWeekAgo }
    },
    include: {
      workBlocks: {
        include: {
          piece: true
        }
      }
    }
  });

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.totalMinutes || 0), 0);

  const daysWithPractice = new Set(
    sessions.map(s => new Date(s.startedAt).toDateString())
  ).size;

  const pieceMinutes = new Map<string, { piece: any; minutes: number }>();
  sessions.forEach(session => {
    session.workBlocks.forEach(block => {
      const existing = pieceMinutes.get(block.pieceId);
      if (existing) {
        existing.minutes += block.minutes || 0;
      } else {
        pieceMinutes.set(block.pieceId, {
          piece: block.piece,
          minutes: block.minutes || 0
        });
      }
    });
  });

  const topPieces = Array.from(pieceMinutes.values())
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);

  return {
    totalMinutes,
    daysWithPractice,
    topPieces,
    sessionCount: sessions.length
  };
}

async function getNeglectedPieces(userId: string) {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const pieces = await prisma.piece.findMany({
    where: {
      userId,
      status: { in: ['learning', 'polishing'] }
    },
    include: {
      workBlocks: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  return pieces.filter(piece => {
    if (piece.workBlocks.length === 0) return true;
    return new Date(piece.workBlocks[0].createdAt) < twoWeeksAgo;
  });
}

export default async function DashboardPage() {
  const user = await ensureUser();
  const stats = await getWeeklyStats(user.id);
  const neglectedPieces = await getNeglectedPieces(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <Link
              href="/practice"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Start Practice
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <p className="text-sm text-gray-600 mb-1">Total Minutes</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalMinutes}</p>
            <p className="text-xs text-gray-500 mt-1">Past 7 days</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <p className="text-sm text-gray-600 mb-1">Days Practiced</p>
            <p className="text-3xl font-bold text-gray-900">{stats.daysWithPractice}</p>
            <p className="text-xs text-gray-500 mt-1">Out of 7 days</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <p className="text-sm text-gray-600 mb-1">Sessions</p>
            <p className="text-3xl font-bold text-gray-900">{stats.sessionCount}</p>
            <p className="text-xs text-gray-500 mt-1">Past 7 days</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <p className="text-sm text-gray-600 mb-1">Avg Session</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.sessionCount > 0 ? Math.round(stats.totalMinutes / stats.sessionCount) : 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Minutes</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Pieces This Week</h2>
            {stats.topPieces.length === 0 ? (
              <p className="text-gray-600">No practice logged this week</p>
            ) : (
              <div className="space-y-3">
                {stats.topPieces.map(({ piece, minutes }) => (
                  <div key={piece.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{piece.title}</p>
                      <p className="text-sm text-gray-600">{piece.composer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{minutes} min</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Neglected Pieces</h2>
            {neglectedPieces.length === 0 ? (
              <p className="text-gray-600">All pieces have recent practice</p>
            ) : (
              <div className="space-y-3">
                {neglectedPieces.map((piece) => (
                  <div key={piece.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{piece.title}</p>
                      <p className="text-sm text-gray-600">{piece.composer}</p>
                      {piece.workBlocks.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Last: {new Date(piece.workBlocks[0].createdAt).toLocaleDateString()}
                        </p>
                      )}
                      {piece.workBlocks.length === 0 && (
                        <p className="text-xs text-gray-500">Never practiced</p>
                      )}
                    </div>
                    <Link
                      href={`/plan/generate/${piece.id}`}
                      className="text-sm text-purple-600 hover:underline"
                    >
                      Generate Plan →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
