import { NextRequest, NextResponse } from 'next/server';
import { ensureUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface PlanDrill {
  id: string;
  label: string;
  minutes: number;
  goal: string;
  method: string;
  tempoTargets?: string;
}

interface PlanCheckpoint {
  label: string;
  instructions: string;
}

interface PlanWarmup {
  label: string;
  minutes: number;
  instructions: string;
}

interface PracticePlan {
  warmup: PlanWarmup[];
  drills: PlanDrill[];
  checkpoint: PlanCheckpoint;
  notes: string[];
}

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUser();
    const { pieceId, durationChoice } = await request.json();

    if (!pieceId || !durationChoice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const piece = await prisma.piece.findFirst({
      where: { id: pieceId, userId: user.id },
      include: {
        workBlocks: {
          orderBy: { createdAt: 'desc' },
          take: 12,
          include: {
            session: true
          }
        }
      }
    });

    if (!piece) {
      return NextResponse.json(
        { error: 'Piece not found' },
        { status: 404 }
      );
    }

    const systemPrompt = `You are a piano practice coach for classical repertoire. You produce concrete, drill-based practice plans.

Avoid generic encouragement. Be concrete and specific. Assume classical practice habits.`;

    const userPrompt = `Generate a ${durationChoice}-minute practice plan for the following piece:

**Piece Information:**
- Composer: ${piece.composer}
- Title: ${piece.title}
- Status: ${piece.status}
- Tags: ${piece.tags || 'None'}
${piece.notes ? `- Notes: ${piece.notes}` : ''}

**Recent Practice Work Blocks (most recent first):**
${piece.workBlocks.length === 0
  ? 'No recent practice logged.'
  : piece.workBlocks.map((block: any, i: number) => `
${i + 1}. Section: ${block.section}
   Focus: ${block.focusTags}
   ${block.minutes ? `Duration: ${block.minutes} min` : ''}
   ${block.tempoNote ? `Tempo: ${block.tempoNote}` : ''}
   ${block.improved ? `✓ Improved: ${block.improved}` : ''}
   ${block.sticky ? `⚠ Still sticky: ${block.sticky}` : ''}
`).join('\n')
}

**Instructions:**
Based on the recent practice work blocks, create a specific ${durationChoice}-minute practice plan. Focus on addressing the "sticky" items and building on improvements.

Return ONLY valid JSON matching this exact schema (no markdown, no code blocks):

{
  "warmup": [
    {
      "label": "Brief warmup description",
      "minutes": 2,
      "instructions": "Specific warmup instructions"
    }
  ],
  "drills": [
    {
      "id": "drill-1",
      "label": "Drill name",
      "minutes": 8,
      "goal": "What this drill achieves",
      "method": "How to practice this",
      "tempoTargets": "♩=50→60" (optional)
    }
  ],
  "checkpoint": {
    "label": "Final checkpoint",
    "instructions": "What to record or test"
  },
  "notes": [
    "Brief note about the plan focus"
  ]
}

Important:
- Reference specific "sticky" items from recent practice
- Build on recent improvements
- Keep drills doable and specific
- Total drill minutes should sum to approximately ${durationChoice - 3} (leaving ~3 min for warmup and checkpoint)`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: systemPrompt,
      temperature: 0.7,
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let planContent: PracticePlan;
    try {
      planContent = JSON.parse(content.text);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text);
      throw new Error('Failed to parse practice plan from AI');
    }

    const plan = await prisma.plan.create({
      data: {
        userId: user.id,
        pieceId,
        durationChoice,
        contentJson: JSON.stringify(planContent)
      }
    });

    return NextResponse.json({
      planId: plan.id,
      content: planContent
    });
  } catch (error) {
    console.error('Error generating plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate practice plan' },
      { status: 500 }
    );
  }
}
