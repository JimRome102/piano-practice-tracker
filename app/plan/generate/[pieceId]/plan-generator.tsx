'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export function PlanGenerator({ pieceId }: { pieceId: string }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generatePlan(duration: number) {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pieceId,
          durationChoice: duration
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate plan');
      }

      const { planId } = await response.json();
      router.push(`/plan/${planId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
      setIsGenerating(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Choose Practice Duration
      </h2>
      <p className="text-gray-600 mb-6">
        AI will generate a customized practice plan based on your recent work blocks.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            Make sure you have set your ANTHROPIC_API_KEY in the .env file.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => generatePlan(15)}
          disabled={isGenerating}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <p className="text-3xl font-bold text-gray-900 mb-2">15</p>
          <p className="text-sm text-gray-600">minutes</p>
        </button>

        <button
          onClick={() => generatePlan(30)}
          disabled={isGenerating}
          className="p-6 border-2 border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <p className="text-3xl font-bold text-blue-600 mb-2">30</p>
          <p className="text-sm text-gray-600">minutes</p>
          <p className="text-xs text-blue-600 mt-1">Recommended</p>
        </button>

        <button
          onClick={() => generatePlan(60)}
          disabled={isGenerating}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <p className="text-3xl font-bold text-gray-900 mb-2">60</p>
          <p className="text-sm text-gray-600">minutes</p>
        </button>
      </div>

      {isGenerating && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">Generating your practice plan...</p>
          <p className="text-sm text-blue-600 mt-1">
            This may take 10-20 seconds.
          </p>
        </div>
      )}
    </div>
  );
}
