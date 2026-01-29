import Link from 'next/link';
import { ensureUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PlanGenerator } from './plan-generator';

export default async function GeneratePlanPage({ params }: { params: Promise<{ pieceId: string }> }) {
  const { pieceId } = await params;
  const user = await ensureUser();

  const piece = await prisma.piece.findFirst({
    where: { id: pieceId, userId: user.id }
  });

  if (!piece) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href={`/pieces/${piece.id}`} className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generate Practice Plan</h1>
              <p className="text-sm text-gray-600">
                {piece.title} - {piece.composer}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PlanGenerator pieceId={piece.id} />
      </main>
    </div>
  );
}
