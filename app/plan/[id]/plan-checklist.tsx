'use client';

import { useState } from 'react';

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

export function PlanChecklist({
  planId,
  planContent,
  initialCheckedItems
}: {
  planId: string;
  planContent: PracticePlan;
  initialCheckedItems: string[];
}) {
  const [checkedItems, setCheckedItems] = useState<string[]>(initialCheckedItems);

  async function toggleItem(itemId: string) {
    const newChecked = checkedItems.includes(itemId)
      ? checkedItems.filter(id => id !== itemId)
      : [...checkedItems, itemId];

    setCheckedItems(newChecked);

    try {
      await fetch(`/api/plan/${planId}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkedItems: newChecked })
      });
    } catch (error) {
      console.error('Failed to save checklist state:', error);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Warmup</h2>
        <div className="space-y-2">
          {planContent.warmup.map((item, i) => {
            const id = `warmup-${i}`;
            return (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id={id}
                  checked={checkedItems.includes(id)}
                  onChange={() => toggleItem(id)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor={id} className="flex-1 cursor-pointer">
                  <p className="font-semibold text-gray-900">
                    {item.label} ({item.minutes} min)
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{item.instructions}</p>
                </label>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Drills</h2>
        <div className="space-y-3">
          {planContent.drills.map((drill) => (
            <div key={drill.id} className="border-l-4 border-blue-500 bg-gray-50 rounded-r-lg">
              <div className="flex items-start gap-3 p-4">
                <input
                  type="checkbox"
                  id={drill.id}
                  checked={checkedItems.includes(drill.id)}
                  onChange={() => toggleItem(drill.id)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor={drill.id} className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-900">{drill.label}</p>
                    <span className="text-sm font-semibold text-blue-600">
                      {drill.minutes} min
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Goal:</strong> {drill.goal}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Method:</strong> {drill.method}
                  </p>
                  {drill.tempoTargets && (
                    <p className="text-sm text-gray-700">
                      <strong>Tempo:</strong> {drill.tempoTargets}
                    </p>
                  )}
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Checkpoint</h2>
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <input
            type="checkbox"
            id="checkpoint"
            checked={checkedItems.includes('checkpoint')}
            onChange={() => toggleItem('checkpoint')}
            className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500"
          />
          <label htmlFor="checkpoint" className="flex-1 cursor-pointer">
            <p className="font-semibold text-gray-900">{planContent.checkpoint.label}</p>
            <p className="text-sm text-gray-700 mt-1">{planContent.checkpoint.instructions}</p>
          </label>
        </div>
      </section>

      <div className="pt-4 border-t">
        <p className="text-sm text-gray-600">
          Progress: {checkedItems.length} / {planContent.warmup.length + planContent.drills.length + 1} completed
        </p>
      </div>
    </div>
  );
}
