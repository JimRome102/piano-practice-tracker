'use client';

import { useState } from 'react';
import { deletePiece } from './actions';

export function DeletePieceButton({ pieceId }: { pieceId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this piece? This will also delete all associated practice logs.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePiece(pieceId);
    } catch (error) {
      console.error('Failed to delete piece:', error);
      alert('Failed to delete piece');
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-3 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200 text-sm disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
