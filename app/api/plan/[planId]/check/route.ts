import { NextRequest, NextResponse } from 'next/server';
import { ensureUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const user = await ensureUser();
    const { checkedItems } = await request.json();

    await prisma.plan.updateMany({
      where: { id: planId, userId: user.id },
      data: {
        checkedItems: JSON.stringify(checkedItems)
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving checklist:', error);
    return NextResponse.json(
      { error: 'Failed to save checklist' },
      { status: 500 }
    );
  }
}
