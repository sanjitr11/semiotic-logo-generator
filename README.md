# Semiotic Logo Generator

A web application that generates professional logo concepts from meeting transcripts using AI. Built with Next.js, Supabase, and Gemini API.

## Features

- **Transcript Analysis**: Upload meeting transcripts to extract brand attributes
- **AI Logo Generation**: Generate 3 distinct logo concepts (wordmark, pictorial, abstract)
- **SVG Export**: Download high-quality SVG logos
- **Regeneration**: Regenerate individual logos or all at once
- **Project History**: View and revisit previous projects

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: Gemini 2.0 Flash (Google AI - Free Tier)
- **Deployment**: Vercel

## Setup

### 1. Clone and Install

```bash
cd semiotic-logo-generator
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Copy your project URL and keys from Settings > API

### 3. Get Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key
3. The free tier includes 15 requests/minute and 1500 requests/day

### 4. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

## Usage

### Transcript Format

The app accepts JSON transcripts in this format:

```json
[
  {
    "speaker": "Designer",
    "text": "Tell me about your company.",
    "timestamp": "00:00"
  },
  {
    "speaker": "Client",
    "text": "We build AI-powered tools...",
    "timestamp": "00:15"
  }
]
```

### Sample Transcripts

Two sample transcripts are included in `sample-transcripts/`:

- `hillclimb.json` - Data services company for research labs
- `heliogrid.json` - Energy cost reduction for commercial buildings

## API Routes

- `POST /api/analyze` - Analyze transcript and generate logos
- `GET /api/projects` - List recent projects
- `GET /api/project/[id]` - Get project details
- `POST /api/generate` - Generate a single logo
- `POST /api/regenerate` - Regenerate logos

## Project Structure

```
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Home / Upload
│   ├── project/[id]/page.tsx       # Project view
│   └── api/                        # API routes
├── components/
│   ├── TranscriptInput.tsx
│   ├── BrandAnalysis.tsx
│   ├── LogoCard.tsx
│   ├── LogoGrid.tsx
│   ├── ProjectList.tsx
│   ├── LoadingSkeleton.tsx
│   └── SvgRenderer.tsx
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── gemini.ts                   # Gemini API client
│   ├── prompts.ts                  # AI prompt templates
│   └── types.ts                    # TypeScript types
└── sample-transcripts/             # Test transcripts
```

## License

MIT
