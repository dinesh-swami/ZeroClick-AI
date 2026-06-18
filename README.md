# ZeroClick AI

Beautiful, fast, AI-powered email and calendar workflow assistant built for the Corsair hackathon.

ZeroClick AI reimagines Gmail and Google Calendar as a focused productivity workspace where common actions need fewer clicks. It connects email, calendar, AI chat, realtime webhooks, smart search, keyboard shortcuts, and digest generation into one Next.js application powered by Corsair integrations.

## Why ZeroClick AI?

Gmail and Google Calendar are powerful, but everyday workflows often take too many UI steps: searching, drafting, sending, checking schedules, creating invites, archiving messages, or preparing for the day. ZeroClick AI gives users a custom interface where the most important actions are closer, faster, and easier to automate.

The project uses Corsair as the integration layer for Gmail and Google Calendar, so the app can work directly with user email and calendar data while keeping the UI completely custom.

## Core Idea

Instead of adapting your workflow to Gmail, Calendar, Superhuman, or any fixed product experience, ZeroClick AI lets the product adapt to the way you work.

Example goal:

```text
Send a calendar invite to friend@corsair.dev at 9 AM next Thursday.
Send him an email too saying I look forward to our meeting.
```

ZeroClick AI is designed around that kind of intent-first workflow: fewer clicks, smarter actions, and a single place for email plus calendar operations.

## Features

- Gmail connection through Corsair
- Google Calendar connection through Corsair
- Custom inbox experience with paginated email loading
- Inbox, sent, spam, and archived email views
- Send email from the app
- Archive email
- Delete email / move to trash
- Gmail-powered search endpoint for advanced queries
- Calendar event creation with attendees
- Calendar event update and delete support
- Optional Google Meet link creation for events
- Realtime Corsair webhook receiver for new email events
- Redis-backed webhook idempotency
- Server-Sent Events architecture for realtime inbox updates
- AI agent chat endpoint using Vercel AI SDK
- OpenRouter model integration for chat and digest generation
- OpenAI embedding support for vector search workflows
- Morning digest generation from recent emails
- Redis caching for generated digests
- PostgreSQL + Prisma data layer
- `pgvector` schema support for email embeddings
- Local authentication with email verification flow
- Google OAuth routes
- Role and team-aware database schema
- Keyboard shortcut overlay for common inbox actions
- Voice input hook using the browser Speech Recognition API
- Protected app routes for authenticated users
- Responsive UI pages for inbox, calendar, settings, digest, and agent chat

## Hackathon Bonus Coverage

| Bonus Task | Project Status |
| --- | --- |
| Corsair Gmail integration | Implemented |
| Corsair Google Calendar integration | Implemented |
| Agent chat with Corsair MCP direction | Agent chat route implemented; custom MCP tool wiring noted in code |
| Corsair webhooks for realtime updates | Implemented webhook receiver and Redis pub/sub flow |
| Automatic email filtering with LLM | Schema supports `priorityLevel`; roadmap item for deeper classification |
| Keyboard-first actions | Shortcut overlay implemented |
| Corsair / Gmail advanced search UI | Search API implemented |
| Vector database for local search | Prisma schema includes `pgvector` email embedding field |
| Fast local email/calendar search | Data model prepared; can be expanded with embedding search |

## Tech Stack

- **Framework:** Next.js 16 App Router
- **UI:** React 19, Tailwind CSS 4, custom CSS modules/styles
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma 7
- **Vector Search Ready:** PostgreSQL `vector` extension / `pgvector`
- **Integrations:** Corsair, Gmail, Google Calendar
- **AI:** Vercel AI SDK, OpenRouter, OpenAI embeddings
- **Realtime:** Redis, Server-Sent Events, webhooks
- **Auth:** JWT cookies, bcrypt, Google OAuth, email verification
- **Deployment Ready:** Vercel config included
- **Dev Tunnel:** ngrok script included for webhook testing

## Project Structure

```text
ZeroClick-AI/
+-- app/                    # Next.js app routes, pages, API endpoints
|   +-- (app)/              # Authenticated product pages
|   +-- (auth)/             # Login and register pages
|   +-- api/                # Email, calendar, auth, chat, webhook APIs
+-- components/             # UI components and app widgets
+-- hooks/                  # Client hooks such as auth and voice input
+-- lib/                    # Auth, AI, Redis, Prisma, Corsair utilities
+-- prisma/                 # Prisma schema and database models
+-- schemas/                # Zod validation schemas
+-- services/               # Email and calendar service layer
+-- styles/                 # Page and component CSS
+-- public/                 # Static assets and branding
+-- scripts/                # Utility scripts
```

## Main Pages

- `/` - Landing page for ZeroClick AI
- `/login` - User login
- `/register` - User registration
- `/inbox` - Custom Gmail inbox workspace
- `/calendar` - Calendar management UI
- `/agent` - AI assistant chat interface
- `/digest` - AI-generated email digest experience
- `/settings` - Account and integration settings
- `/onboarding` - User onboarding flow

## Important API Routes

- `GET /api/emails` - Fetch paginated emails
- `GET /api/emails/search?q=...` - Search Gmail messages
- `POST /api/emails/send` - Send an email
- `POST /api/emails/[id]/archive` - Archive an email
- `POST /api/emails/[id]/delete` - Delete / trash an email
- `GET /api/calendar` - Fetch calendar events
- `POST /api/calendar/events` - Create calendar events
- `POST /api/chat` - Stream AI agent responses
- `POST /api/webhooks/corsair` - Receive Corsair webhook events
- `GET /api/digest` - Trigger digest generation
- `GET /api/sse` - Realtime event stream endpoint

## Database Models

The Prisma schema includes:

- `User` - user account, auth provider, Corsair connection state
- `Team` - team ownership and member relationships
- `Email` - cached email metadata, body, priority, and vector embedding
- `DigestCache` - generated daily digest storage
- `FollowUp` - scheduled follow-up tasks
- `WebhookLog` - persisted webhook payload history
- `VerificationToken` - email verification tokens
- `CorsairIntegration` - Corsair integration metadata
- `CorsairAccount` - Corsair account connection data
- `CorsairEntity` - synced Corsair entity cache
- `CorsairEvent` - Corsair event cache/log table

## Environment Variables

Create a `.env` file with the values needed for your local setup.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
REDIS_URL="redis://localhost:6380"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

JWT_SECRET="your-jwt-secret"
CRON_SECRET="your-cron-secret"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_ACCESS_TOKEN="optional-dev-access-token"
GOOGLE_REFRESH_TOKEN="optional-dev-refresh-token"

CORSAIR_KEK="your-corsair-encryption-key"
CORSAIR_API_KEY="local"
CORSAIR_WEBHOOK_SECRET="your-webhook-secret"

OPENROUTER_API_KEY="your-openrouter-api-key"
OPENAI_API_KEY="your-openai-api-key"

RESEND_API_KEY="your-resend-api-key"
```

## Getting Started

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

## Useful Commands

```bash
npm run dev       # Start local Next.js development server
npm run build     # Generate Prisma client and build the app
npm run start     # Start production server
npm run lint      # Run ESLint
npm run tunnel    # Start ngrok tunnel for local webhook testing
```

## Webhook Testing

For local realtime email events, expose the local app with ngrok:

```bash
npm run tunnel
```

Then configure your Corsair webhook URL to point to:

```text
https://YOUR_NGROK_URL/api/webhooks/corsair
```

The webhook route logs events, checks idempotency in Redis, maps incoming Gmail events into the app email format, and publishes them to a user-specific Redis channel for realtime UI updates.

## AI Workflow

ZeroClick AI uses:

- OpenRouter for chat and digest text generation
- OpenAI embeddings for vector-search-ready email data
- Vercel AI SDK for streaming assistant responses
- Redis and Postgres for caching and persistence

The agent chat is designed to become the natural-language command center for email and calendar operations.

## Future Roadmap

- Complete direct Corsair MCP tool wiring inside the agent chat
- Add natural-language email sending from the agent
- Add natural-language calendar invite creation from the agent
- Add LLM-based priority classification for incoming emails
- Add local vector search across synced email and calendar data
- Add sub-second semantic search UI using Postgres `pgvector`
- Add richer keyboard command palette
- Add smarter follow-up reminders and waiting-on detection
- Add better digest scheduling through Vercel Cron
- Add team workspace flows for shared inbox/calendar use cases

## Design Philosophy

ZeroClick AI is built around three ideas:

1. **Less clicking** - common workflows should be one shortcut, one search, or one natural-language command away.
2. **More context** - email, calendar, follow-ups, and AI should live in the same workspace.
3. **User-shaped workflows** - the interface should adapt to the user's habits instead of forcing one rigid productivity style.

## Built For

This project was created as a hackathon project using Corsair's integration platform to build a custom Gmail and Google Calendar productivity experience.

The goal is simple: make email and calendar management feel faster, smarter, and closer to how people actually work.
