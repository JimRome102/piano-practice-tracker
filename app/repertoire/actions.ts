'use server';

import { ensureUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPiece(formData: FormData) {
  const user = await ensureUser();

  const piece = await prisma.piece.create({
    data: {
      userId: user.id,
      composer: formData.get('composer') as string,
      title: formData.get('title') as string,
      status: formData.get('status') as string,
      tags: formData.get('tags') as string || '',
      notes: formData.get('notes') as string || null,
      links: formData.get('links') as string || null,
    }
  });

  revalidatePath('/repertoire');
  redirect('/repertoire');
}

export async function updatePiece(pieceId: string, formData: FormData) {
  const user = await ensureUser();

  await prisma.piece.updateMany({
    where: { id: pieceId, userId: user.id },
    data: {
      composer: formData.get('composer') as string,
      title: formData.get('title') as string,
      status: formData.get('status') as string,
      tags: formData.get('tags') as string || '',
      notes: formData.get('notes') as string || null,
      links: formData.get('links') as string || null,
    }
  });

  revalidatePath('/repertoire');
  revalidatePath(`/pieces/${pieceId}`);
  redirect('/repertoire');
}

export async function deletePiece(pieceId: string) {
  const user = await ensureUser();

  await prisma.piece.deleteMany({
    where: { id: pieceId, userId: user.id }
  });

  revalidatePath('/repertoire');
  redirect('/repertoire');
}
