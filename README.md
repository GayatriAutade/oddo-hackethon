# Traveloop

**AI-powered travel planning app** — build multi-city trips, track budgets, pack smarter, journal adventures, and get real-time AI travel recommendations via Gemini.

---

## What it does

Traveloop is a full-stack travel planning platform built for the modern adventurer. It lets you:

- **Plan trips** with multi-city itineraries, stop dates, and activities
- **Track budgets** with visual pie and bar charts per destination
- **Manage packing lists** with category-based checklists
- **Journal** notes and memories per trip
- **Explore** public trips shared by the community and copy them to your account
- **Chat with AI** — a streaming Gemini-powered travel assistant helps with recommendations, planning ideas, and city suggestions

---

## Tech Stack (MERN-aligned)

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite, TailwindCSS v4, Framer Motion |
| **Backend** | Node.js 24 + Express 5 |
| **Database** | PostgreSQL + Drizzle ORM |
| **AI** | Google Gemini via Replit AI Integrations (streaming SSE) |
| **Auth** | JWT (stored in localStorage) |
| **API contracts** | OpenAPI 3.1 → Orval codegen → typed React Query hooks + Zod validators |
| **Routing** | Wouter (client), Express (server) |
| **Charts** | Recharts |

> Note: This project uses PostgreSQL instead of MongoDB for stronger relational guarantees across trips, stops, activities, and users — an intentional architectural choice for data integrity.

---

## Running Locally

### Prerequisites

- Node.js 24+
- pnpm 10+
- PostgreSQL (via Replit DB or your own instance)

### Setup

```bash
# Install all workspace dependencies
pnpm install

# Push the database schema
pnpm --filter @workspace/db run push

# Regenerate API types (if you change openapi.yaml)
pnpm --filter @workspace/api-spec run codegen
```

### Start the app

```bash
# Start the API server (runs on port 5000, proxied at /api)
pnpm --filter @workspace/api-server run dev

# Start the frontend (runs on $PORT, proxied at /)
pnpm --filter @workspace/traveloop run dev
```

### Environment variables required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | JWT signing secret |
| `AI_INTEGRATIONS_GEMINI_BASE_URL` | Replit Gemini proxy URL (auto-provisioned) |
| `AI_INTEGRATIONS_GEMINI_API_KEY` | Replit Gemini API key (auto-provisioned) |

---

## Project Structure

```
artifacts/
  api-server/         # Express API server
    src/routes/       # All route handlers
    src/lib/auth.ts   # JWT middleware
  traveloop/          # React + Vite frontend
    src/pages/        # 14 pages (dashboard, trips, AI, explore, etc.)
    src/components/   # Shared UI components + layout
    src/hooks/        # Auth context and custom hooks
lib/
  api-spec/           # OpenAPI 3.1 spec (source of truth)
  api-client-react/   # Generated React Query hooks
  api-zod/            # Generated Zod validators
  db/                 # Drizzle ORM schema + migrations
  integrations-gemini-ai/  # Gemini AI client
```

---

## Key Architecture Decisions

- **Contract-first API**: The OpenAPI spec in `lib/api-spec/openapi.yaml` is the single source of truth. Orval generates typed React Query hooks and Zod validators from it.
- **JWT in localStorage**: Auth token stored as `traveloop_token`. All protected routes validate via `Authorization: Bearer <token>` header.
- **Gemini SSE streaming**: The AI chat uses raw `fetch` with `ReadableStream` for real-time streaming responses — not a generated hook.
- **Cities as static data**: City search uses an in-memory dataset for fast, zero-latency lookup without a DB round-trip.
- **Drizzle ORM**: Type-safe queries with PostgreSQL. Schema changes are applied via `pnpm --filter @workspace/db run push` in dev.

---

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in to your account |
| `/signup` | Create a new account |
| `/dashboard` | Stats overview + recent trips |
| `/trips` | All your trips |
| `/trips/new` | Create a new trip |
| `/trips/:id` | Trip detail view |
| `/trips/:id/edit` | Edit trip metadata |
| `/trips/:id/itinerary` | Build the stop & activity itinerary |
| `/trips/:id/budget` | Visual budget breakdown |
| `/trips/:id/packing` | Packing checklist |
| `/trips/:id/notes` | Trip journal |
| `/explore` | Discover & copy public trips |
| `/ai` | AI travel assistant (Gemini streaming chat) |
| `/profile` | Edit your profile |

---

## Hackathon Notes

Built for a hackathon with a focus on:
1. **Unique, immersive UI** — bold color palette, framer-motion animations, cinematic trip cards
2. **Real AI integration** — streaming Gemini chat + AI-powered city recommendations
3. **Complete feature set** — from trip creation to budget tracking to packing lists, everything works end-to-end
4. **Shareable trips** — public trip gallery with one-click copy

---

*Built with React + Node.js + PostgreSQL + Gemini AI*
