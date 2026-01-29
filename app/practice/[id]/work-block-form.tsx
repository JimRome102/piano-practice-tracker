'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';

const FOCUS_TAG_OPTIONS = ['tempo', 'voicing', 'rhythm', 'memory', 'pedaling', 'articulation'];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? 'Adding...' : 'Add Work Block'}
    </button>
  );
}

export function WorkBlockForm({
  pieces,
  sessionId,
  addWorkBlock
}: {
  pieces: Array<{ id: string; title: string; composer: string }>;
  sessionId: string;
  addWorkBlock: (sessionId: string, formData: FormData) => Promise<void>;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formKey, setFormKey] = useState(0);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(formData: FormData) {
    formData.set('focusTags', selectedTags.join(','));
    await addWorkBlock(sessionId, formData);
    setSelectedTags([]);
    setFormKey((k) => k + 1);
  }

  return (
    <form key={formKey} action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Piece *
        </label>
        <select
          name="pieceId"
          required
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select piece...</option>
          {pieces.map((piece) => (
            <option key={piece.id} value={piece.id}>
              {piece.title} - {piece.composer}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Section *
        </label>
        <input
          type="text"
          name="section"
          required
          placeholder="e.g., m.32-48, coda, LH alone"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Focus Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {FOCUS_TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minutes
          </label>
          <input
            type="number"
            name="minutes"
            min="1"
            placeholder="15"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tempo
          </label>
          <input
            type="text"
            name="tempoNote"
            placeholder="♩=72"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Improved
        </label>
        <input
          type="text"
          name="improved"
          placeholder="What got better?"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Still Sticky
        </label>
        <input
          type="text"
          name="sticky"
          placeholder="What needs more work?"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
