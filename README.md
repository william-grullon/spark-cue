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
- OpenAI API Key (for AI-powered message generation)

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
   # Optional DB path (defaults to ./db.sqlite)
   DB_PATH=./custom-path.sqlite
   ```
5. Run in development mode:
   ```bash
   npm run dev
   ```

App will be available at http://localhost:3000.

### Production Deployment

For production builds:

```bash
npm run build
npm start
```

## Docker

Build and run with Docker Compose:

```bash
docker-compose up --build
```

For production deployments with Docker:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
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
│   ├── __tests__/         # Jest test files
│   │   └── api/           # API endpoint tests
│   ├── utils/             # Helpers (fetcher, messageGenerator)
│   └── middleware.ts      # Edge middleware
├── Dockerfile
├── docker-compose.yml
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Jest setup and mocks
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

## Testing

The application includes Jest tests for the API endpoints to ensure their functionality and reliability. The tests use mocking to isolate the API functions from external dependencies like the database.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

- API Endpoint Tests:
  - Profiles: Create, read, update, delete
  - Messages: Add messages, update status
  - Analytics: Time-of-day statistics

Tests cover successful operations, error handling, input validation, and edge cases.

### Test Mocking Strategy

The tests mock:

- The database (Better-SQLite3) operations to prevent actual database access
- NextRequest/NextResponse objects to simulate HTTP interactions
- External services like OpenAI when necessary

This ensures tests run quickly, reliably, and without external dependencies.

## Development Guides

### Adding New API Routes

1. Create a new route file in the appropriate directory under `src/app/api/`
2. Implement the handler functions (GET, POST, PUT, DELETE)
3. Add input validation using Zod schemas
4. Add error handling with appropriate status codes
5. Write tests for the new route in `src/__tests__/api/`

### Working with the Database

The application uses Better-SQLite3 for data storage. The database connection is managed in `lib/db.ts`.

```typescript
// Example query
const profiles = db.prepare("SELECT * FROM profiles").all();
```

## Performance Considerations

- The app uses SQLite for simplicity, but can be migrated to PostgreSQL or MySQL for larger deployments
- Message generation uses a fallback system to reduce API costs and latency
- Client-side caching improves responsiveness

## Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure all tests pass before submitting a PR:

```bash
npm test
```

## License

MIT © SparkCue

## Acknowledgements

- [OpenAI](https://openai.com/) for the GPT-4 Turbo API
- [Next.js](https://nextjs.org/) for the React framework
- [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) for database functionality
