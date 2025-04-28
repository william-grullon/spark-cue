# SparkCue

SparkCue is a Next.js application that helps you generate, manage, and track opening messages (cues) for profiles using AI (OpenAI GPT-4 Turbo) with automatic fallback templates.

## Features

- Profiles: create, edit, delete profiles with name, bio, location, pictures, and avatar
- Message Generation: AI-powered generation with fallback to JSON templates per persona
- Personas: Classy, Playful, Flirty, Adventurous, Intellectual, Sweet, Bold, Mysterious, Funny, Romantic
- Message Management: save, mark sent/responded, compute latency and success
- Analytics: time‐of‐day engagement charts
- Offline Support: cache in localStorage and sync when online
- Frontend: Next.js, React, Tailwind CSS, React Hook Form
- Backend/API: Next.js API routes, CORS, SQLite database
- Docker: containerized development and production setup

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- Docker & Docker Compose (optional)

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/your-org/spark-cue.git
   cd spark-cue
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Configure `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_key
   AI_PROVIDER=openai
   AI_MODEL=gpt-4-turbo
   # Optional billing or Stripe keys
   ```
5. Run in development mode:
   ```bash
   npm run dev
   ```

App will be available at http://localhost:3000.

## Docker

Build and run with Docker Compose:

```bash
docker-compose up --build
```

## Project Structure

```
├── data/                  # Fallback templates JSON
├── docs/                  # Design and planning
├── lib/                   # Database and OpenAI client
├── public/                # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Shared React components
│   ├── utils/             # Helpers (fetcher, messageGenerator)
│   └── middleware.ts      # Edge middleware
├── Dockerfile
├── docker-compose.yml
├── next.config.ts
├── package.json
└── tsconfig.json
```

## API Routes

- GET `/api/profiles` : list profiles
- POST `/api/profiles` : create profile
- PUT `/api/profiles/:id` : update profile
- DELETE `/api/profiles/:id` : delete profile
- POST `/api/messages/generate` : generate message (AI + fallback)
- POST `/api/messages/add` : save generated message
- GET `/api/messages` : list messages (filter by profile)
- PUT `/api/messages/update-status` : mark sent/responded and compute latency
- GET `/api/analytics/time-of-day` : hourly engagement stats

## Data & Database

- `data/fallbackTemplates.json` contains ≥10 templates per persona using variables `${name}`, `${pictures[N].description}`, `${location}`.
- SQLite schema:
  - `profiles` (id, name, bio, location, pictures JSON, avatar_url, created_at)
  - `messages` (id, profile_id, source, persona, message, created_at, sent_at, responded_at, response_latency, success)

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## License

MIT © SparkCue
