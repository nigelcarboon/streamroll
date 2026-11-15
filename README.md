# streamroll.

Your streaming rotation, planned in advance. One paid service a month, matched against your watchlist, with a nudge before the changeover.

Scope and pitch live in `streamroll-mvp-scope.md` and `streamroll-pitch-one-pager.md`.

## Stack

- Next.js 16 (App Router, server actions, `src/proxy.ts` for session refresh)
- Supabase (magic-link auth, Postgres with row level security)
- Tailwind CSS 4

## Running locally

```bash
npm install
```

Create `.env.local` with the Supabase project's URL and publishable (anon) key:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
```

```bash
npm run dev
```

Database schema is in `supabase/migrations/`, applied in order.

## Brand

SIGNAL direction: near-black ground, one rationed acid green, Archivo for display, Geist for interface, Geist Mono for dates and dollars. Tokens are in `src/app/globals.css`; the mark is `src/components/LoopMark.tsx`. The name is always lowercase with the full stop: streamroll.

## Where things are

| Path | What |
| --- | --- |
| `src/app/(tabs)/roster` | Monthly rotation calendar |
| `src/app/(tabs)/watchlist` | Watchlist with roster matching |
| `src/app/(tabs)/reminder` | Current service, next changeover, what is left to watch |
| `src/app/onboarding` | Service selection |
| `src/lib/roster.ts` | Date and matching logic (Australia/Sydney time) |
