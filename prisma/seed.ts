import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { clerkId: 'demo_user' },
    update: {},
    create: {
      clerkId: 'demo_user',
      email: 'demo@repertoire.app'
    }
  })

  console.log('Created demo user:', demoUser.id)

  // Create sample pieces
  const piece1 = await prisma.piece.create({
    data: {
      userId: demoUser.id,
      composer: 'Chopin',
      title: 'Nocturne Op. 9 No. 2',
      status: 'polishing',
      tags: 'romantic,nocturne',
      notes: 'Focus on expressive phrasing and rubato',
      links: 'https://imslp.org/wiki/Nocturnes,_Op.9_(Chopin,_Fr%C3%A9d%C3%A9ric)'
    }
  })

  const piece2 = await prisma.piece.create({
    data: {
      userId: demoUser.id,
      composer: 'Bach',
      title: 'Prelude in C Major, BWV 846',
      status: 'maintaining',
      tags: 'baroque,prelude',
      notes: 'Keep it fresh and flowing',
      links: 'https://imslp.org/wiki/The_Well-Tempered_Clavier,_Book_1,_BWV_846-869_(Bach,_Johann_Sebastian)'
    }
  })

  const piece3 = await prisma.piece.create({
    data: {
      userId: demoUser.id,
      composer: 'Beethoven',
      title: 'Sonata No. 14 "Moonlight" - 1st Movement',
      status: 'learning',
      tags: 'classical,sonata',
      notes: 'Working on consistent triplet flow and pedaling',
      links: null
    }
  })

  console.log('Created 3 pieces')

  // Create sample sessions
  const session1 = await prisma.session.create({
    data: {
      userId: demoUser.id,
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      totalMinutes: 45
    }
  })

  const session2 = await prisma.session.create({
    data: {
      userId: demoUser.id,
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
      endedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      totalMinutes: 60
    }
  })

  console.log('Created 2 sessions')

  // Create work blocks for session 1
  await prisma.workBlock.createMany({
    data: [
      {
        sessionId: session1.id,
        pieceId: piece1.id,
        section: 'm.1-16',
        focusTags: 'tempo,voicing',
        minutes: 15,
        tempoNote: '♩=120',
        improved: 'More consistent voicing in RH melody',
        sticky: 'LH accompaniment still uneven in spots'
      },
      {
        sessionId: session1.id,
        pieceId: piece1.id,
        section: 'm.17-32',
        focusTags: 'rhythm,pedaling',
        minutes: 20,
        tempoNote: '♩=116',
        improved: 'Pedal changes cleaner',
        sticky: 'Need to work on rubato timing'
      },
      {
        sessionId: session1.id,
        pieceId: piece2.id,
        section: 'full piece',
        focusTags: 'tempo,articulation',
        minutes: 10,
        tempoNote: '♩=80',
        improved: 'Smoother overall flow',
        sticky: null
      }
    ]
  })

  // Create work blocks for session 2
  await prisma.workBlock.createMany({
    data: [
      {
        sessionId: session2.id,
        pieceId: piece3.id,
        section: 'm.1-8',
        focusTags: 'tempo,pedaling',
        minutes: 15,
        tempoNote: '♩=60',
        improved: 'Triplets more even',
        sticky: 'Pedal timing needs work - muddying the harmony'
      },
      {
        sessionId: session2.id,
        pieceId: piece3.id,
        section: 'm.9-24',
        focusTags: 'pedaling,voicing',
        minutes: 25,
        tempoNote: '♩=58',
        improved: 'Better bass voicing',
        sticky: 'Still struggling with smooth pedal changes in m.15-18'
      },
      {
        sessionId: session2.id,
        pieceId: piece1.id,
        section: 'full piece',
        focusTags: 'tempo,memory',
        minutes: 20,
        tempoNote: '♩=126',
        improved: 'More confident with memory',
        sticky: 'Ornament in m.25 still inconsistent'
      }
    ]
  })

  console.log('Created work blocks')

  // Create a sample plan
  const plan = await prisma.plan.create({
    data: {
      userId: demoUser.id,
      pieceId: piece3.id,
      durationChoice: 30,
      contentJson: JSON.stringify({
        warmup: [
          {
            label: 'Triplet rhythm exercise',
            minutes: 2,
            instructions: 'Practice even triplet patterns on C major scale to prepare for the piece texture'
          }
        ],
        drills: [
          {
            id: 'drill-1',
            label: 'Isolate pedal changes (m.1-8)',
            minutes: 8,
            goal: 'Clean pedal changes on each bass note without muddying harmony',
            method: 'Hands separate: LH only with pedal, focus on lifting pedal exactly with bass note change',
            tempoTargets: '♩=50→60'
          },
          {
            id: 'drill-2',
            label: 'RH triplets (m.1-8)',
            minutes: 6,
            goal: 'Perfectly even triplets',
            method: 'RH alone, metronome on triplet subdivision, gradually increase tempo',
            tempoTargets: '♩=50→65'
          },
          {
            id: 'drill-3',
            label: 'Hands together (m.1-8)',
            minutes: 8,
            goal: 'Integrate clean pedaling with even triplets',
            method: 'HT slowly, focus on coordination between pedal lift and bass note',
            tempoTargets: '♩=55→60'
          },
          {
            id: 'drill-4',
            label: 'Problem spot: m.15-18 pedal',
            minutes: 4,
            goal: 'Smooth pedal changes in this passage',
            method: 'Loop m.15-18 with half-pedal technique, listening for clarity',
            tempoTargets: '♩=50'
          }
        ],
        checkpoint: {
          label: 'Record m.1-24',
          instructions: 'Record yourself playing m.1-24 at ♩=58 and listen back for pedal clarity'
        },
        notes: [
          'Based on recent practice: focus on pedal timing issues identified in m.15-18',
          'Building on improved bass voicing from last session'
        ]
      })
    }
  })

  console.log('Created sample plan:', plan.id)
  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
