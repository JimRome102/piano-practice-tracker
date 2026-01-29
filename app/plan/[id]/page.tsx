import Link from 'next/link';
import { ensureUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PlanChecklist } from './plan-checklist';

interface PracticePlan {
  warmup: Array<{ label: string; minutes: number; instructions: string }>;
  drills: Array<{
    id: string;
    label: string;
    minutes: number;
    goal: string;
    method: string;
    tempoTargets?: string;
  }>;
  checkpoint: { label: string; instructions: string };
  notes: string[];
}

export default async function PlanViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await ensureUser();

  const plan = await prisma.plan.findFirst({
    where: { id, userId: user.id },
    include: {
      piece: true
    }
  });

  if (!plan) {
    notFound();
  }

  const planContent: PracticePlan = JSON.parse(plan.contentJson);
  const checkedItems = plan.checkedItems ? JSON.parse(plan.checkedItems) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/pieces/${plan.piece.id}`} className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Practice Plan</h1>
                <p className="text-sm text-gray-600">
                  {plan.piece.title} • {plan.durationChoice} minutes
                </p>
              </div>
            </div>
            <Link
              href={`/plan/generate/${plan.piece.id}`}
              className="text-sm text-purple-600 hover:underline"
            >
              Regenerate Plan
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600">
                Generated {new Date(plan.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {planContent.notes && planContent.notes.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-purple-900 mb-2">Plan Notes</h3>
              <ul className="space-y-1">
                {planContent.notes.map((note: any, i: number) => (
                  <li key={i} className="text-sm text-purple-800">• {note}</li>
                ))}
              </ul>
            </div>
          )}

          <PlanChecklist
            planId={plan.id}
            planContent={planContent}
            initialCheckedItems={checkedItems}
          />
        </div>
      </main>
    </div>
  );
}
