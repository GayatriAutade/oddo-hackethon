# Traveloop

AI-powered travel planning app — build multi-city trips, track budgets, pack smarter, journal adventures, and get real-time AI travel recommendations via Gemini.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/traveloop run dev` — run the frontend (port $PORT, proxied at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`, `AI_INTEGRATIONS_GEMINI_BASE_URL`, `AI_INTEGRATIONS_GEMINI_API_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 8080)
- DB: PostgreSQL + Drizzle ORM
- Frontend: React 19 + Vite, TailwindCSS v4, Framer Motion, Wouter
- AI: Google Gemini via Replit AI Integrations (SSE streaming)
- Auth: JWT in localStorage as "traveloop_token"
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Charts: Recharts
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/` — Drizzle schema files (users, trips, stops, activities, packing, notes, conversations, messages)
- `lib/api-client-react/src/generated/api.ts` — Generated React Query hooks
- `lib/api-zod/src/generated/` — Generated Zod schemas
- `lib/integrations-gemini-ai/src/client.ts` — Gemini AI client
- `artifacts/api-server/src/routes/` — All Express route handlers
- `artifacts/traveloop/src/pages/` — 14 frontend pages
- `artifacts/traveloop/src/components/layout/AppLayout.tsx` — Main app shell with floating icon rail nav

## Architecture decisions

- Contract-first: OpenAPI spec drives all typed hooks and validators via Orval codegen.
- JWT auth in localStorage — token key is "traveloop_token". All protected routes verify via Authorization: Bearer header.
- Gemini SSE streaming uses raw fetch with ReadableStream (not generated hooks) at /api/gemini/conversations/{id}/messages.
- Cities search uses in-memory dataset for zero-latency lookup.
- Drizzle ORM for type-safe PostgreSQL queries; schema changes via `pnpm --filter @workspace/db run push` in dev only.

## Product

Traveloop is a full-stack travel planning platform with:
- Multi-city trip planning with stops, activities, and itinerary builder
- Visual budget tracking with Recharts bar and pie charts
- Category-based packing checklists
- Trip journaling and notes
- Public trip gallery with copy-to-my-trips
- Streaming Gemini AI travel assistant chat

## Design

"Midnight Jet" aesthetic — deep black (#0a0a0a), electric cyan primary, gold secondary, Space Mono monospace, Playfair Display serif headings, sharp edges (0 radius), glassmorphism panels, floating icon rail sidebar, scanline animations, framer-motion throughout.

## User preferences

- Hackathon project — UI should be visually extraordinary and memorable
- No emojis in the UI

## Gotchas

- DO NOT rewrite App.tsx, src/hooks/use-auth.tsx, or src/lib/api-client.ts — these are stable foundations.
- AI_INTEGRATIONS_GEMINI_BASE_URL and AI_INTEGRATIONS_GEMINI_API_KEY are auto-provisioned via Replit; never manually set or expose them.
- The dark class is on the root div in AppLayout — all authenticated pages inherit the dark theme automatically.
- Query hook pattern: useGetThing(id, { query: { enabled: !!id, queryKey: getGetThingQueryKey(id) } })

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
