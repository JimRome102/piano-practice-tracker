# Repertoire - Piano Practice Tracker

A full-stack web application for serious pianists to track practice sessions, manage repertoire, and get AI-powered practice plans.

## Features

- **Repertoire Management**: Create, edit, and organize your piano pieces with status tracking (learning/polishing/maintaining)
- **Fast Practice Logging**: Quick work block logging during practice sessions with focus tags, tempo notes, and progress tracking
- **Weekly Dashboard**: View practice statistics, top pieces, and identify neglected repertoire
- **AI Practice Plans**: Generate customized, structured practice plans using Claude AI based on your recent work blocks
- **Progress Tracking**: Track improvements and sticky points for each piece over time

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: Clerk
- **AI**: Anthropic Claude API (Sonnet 3.5)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Clerk account (free tier available)
- Anthropic API key (for AI plan generation)

## Setup Instructions

### 1. Clone or navigate to the project

```bash
cd "/Users/jimrome/Documents/Jim piano practice tracker/repertoire"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

The `.env` file in the project root contains the following variables. You need to add your API keys:

```env
# Database (already configured for SQLite)
DATABASE_URL="file:./dev.db"

# Clerk Authentication
# Get these from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Claude API
# Get this from https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

#### Getting Clerk API Keys:
1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up for a free account
3. Create a new application
4. Go to "API Keys" in the sidebar
5. Copy the `Publishable key` and `Secret key`
6. Add them to your `.env` file

#### Getting Anthropic API Key:
1. Go to [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Sign in or create an account
3. Click "Create Key"
4. Copy the key and add it to `.env` as `ANTHROPIC_API_KEY`

### 4. Set up the database

The database is already initialized. You can seed it with demo data:

```bash
npm run db:seed
```

This creates a demo user and sample pieces with practice sessions.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### First Time Setup

1. Sign up/sign in using Clerk authentication
2. Add your first piece to your repertoire
3. Start a practice session and log work blocks
4. View your dashboard to see progress
5. Generate AI practice plans for your pieces

### Key Workflows

#### Logging Practice
1. Click "Start Practice" from the home page
2. Select a piece and add work blocks:
   - Section (e.g., "m.32-48", "coda")
   - Focus tags (tempo, voicing, rhythm, etc.)
   - Duration, tempo notes
   - What improved and what's still sticky
3. End session when done - automatically calculates total time

#### Generating Practice Plans
1. Go to a piece detail page
2. Click "Generate Practice Plan"
3. Choose duration (15/30/60 minutes)
4. Review the AI-generated plan with warmup, drills, and checkpoint
5. Use checklist mode during practice to track progress

## Database Schema

- **User**: Stores user information from Clerk
- **Piece**: Repertoire pieces with composer, title, status, tags, notes, links
- **Session**: Practice sessions with start/end times and total duration
- **WorkBlock**: Individual practice segments within a session
- **Plan**: AI-generated practice plans with checklist state

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed database with demo data
npm run db:studio    # Open Prisma Studio (database GUI)
```

## Project Structure

```
app/
├── api/
│   └── plan/           # AI plan generation API routes
├── dashboard/          # Weekly statistics dashboard
├── pieces/            # Individual piece detail pages
├── plan/              # Practice plan generation and display
├── practice/          # Practice session logging
├── repertoire/        # Repertoire CRUD pages
├── layout.tsx         # Root layout with Clerk
└── page.tsx           # Home page

lib/
├── prisma.ts          # Prisma client instance
└── user.ts            # User authentication helpers

prisma/
├── schema.prisma      # Database schema
├── migrations/        # Database migrations
└── seed.ts           # Seed script
```

## AI Plan Generation Strategy

The app uses Claude 3.5 Sonnet to generate practice plans. The prompt:

1. **Input Context**:
   - Piece metadata (composer, title, status, tags)
   - Recent 8-15 work blocks with focus, improvements, and sticky points
   - Desired practice duration (15/30/60 min)

2. **Output Format**:
   - Warmup exercises (2-3 min)
   - 3-6 specific drills with goals, methods, and tempo targets
   - Final checkpoint to record/assess
   - Notes explaining the plan focus

3. **Guardrails**:
   - Always reference specific "sticky" items from recent practice
   - Build on documented improvements
   - Avoid generic encouragement - be concrete
   - Keep drills doable and specific

## Demo Data

The seed script creates:
- 1 demo user (clerkId: "demo_user")
- 3 sample pieces (Chopin Nocturne, Bach Prelude, Beethoven Moonlight Sonata)
- 2 practice sessions with work blocks
- 1 AI-generated practice plan

**Note**: To use the app with Clerk authentication, you'll need to sign up with your own account. The demo data is for database structure reference only.

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (use a production database like Neon or Turso for production)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `ANTHROPIC_API_KEY`
5. Deploy

For production, consider using:
- **Neon** or **Turso** for PostgreSQL/SQLite hosting
- **Vercel** for hosting the Next.js app
- **Clerk** production instance

## Production Considerations

1. **Database**: Migrate from SQLite to PostgreSQL (Neon/Supabase) for production
2. **Error Handling**: Add proper error boundaries and user feedback
3. **Rate Limiting**: Add rate limiting to AI plan generation
4. **Analytics**: Add analytics to track usage
5. **Mobile**: The UI is responsive but could be enhanced for mobile practice logging
6. **Audio**: Future enhancement to attach audio recordings to work blocks

## License

MIT

## Credits

Built with Claude Code as a portfolio project demonstrating full-stack development with Next.js, Prisma, Clerk, and Claude AI integration.
