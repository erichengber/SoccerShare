# SoccerShare (Soccer Highlights)

Role-based React + TypeScript frontend MVP inspired by Hudl for middle/high school soccer pathways (rec -> travel -> club -> school).

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-style component primitives
- React Router
- Zustand (with persisted recruiter and auth state)
- Supabase Storage + clips table for media uploads and metadata
- Supabase Auth (email/password)
- Mock in-memory domain data for MVP content

## Run

```bash
npm install
npm run dev
```

## Supabase Setup

1. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` to `web/.env`.
2. In Supabase SQL Editor, run `web/supabase/setup-storage.sql`.
3. Upload the existing `web/public` assets into Supabase Storage:

```bash
npm run supabase:seed:public
```

Optional:
- Set `SUPABASE_SERVICE_ROLE_KEY` before running the seed script if you do not want to rely on anon-key write policies.
- `VITE_SUPABASE_ANON_KEY` is still supported as a fallback.
- Set `VITE_SUPABASE_MEDIA_BUCKET` if you want a bucket name other than `media`.
## Environment

Create `web/.env.local` with:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_or_publishable_key
```

`VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` is also supported as a fallback key name.

## Routes

- Public: `/` (auth entry), `/select-role` (post-auth role mapping)
- Player: `/player`, `/player/profile`, `/player/clips`, `/player/clips/:clipId`, `/player/schedule`, `/player/settings/privacy`
- Parent: `/parent`, `/parent/players`, `/parent/players/:playerId`
- Coach: `/coach`, `/coach/roster`, `/coach/players/:playerId`, `/coach/schedule`
- Recruiter: `/recruiter`, `/recruiter/tournaments/:tournamentId`, `/recruiter/games/:gameId`, `/recruiter/players/:playerId`, `/recruiter/favorites`, `/recruiter/saved-clips`

## Architecture

- `src/types`: Strong domain models/interfaces
- `src/data`: Hard-coded realistic demo dataset
- `src/store`: Zustand stores (`auth`, `data`, `recruiter`, `ui`)
- `src/components`: Reusable cards, modal, filters, video player, layout
- `src/pages`: Role-based page modules
- `src/routes`: Route map + protection
- `src/lib`: selectors, formatting, role routing

## Supabase Integration

- Existing sample videos/posters resolve to Supabase public URLs after `npm run supabase:seed:public`.
- New uploads go to Supabase Storage and metadata is upserted into `public.clips`.
- Clip detail edits also upsert into `public.clips`.
- If Supabase env vars are missing, the app falls back to in-memory clip behavior for local demo use.
- Auth/session is fully handled through `src/store/authStore.ts` and `src/lib/supabaseClient.ts`.
- Role + demo-user mapping is persisted in Supabase user metadata (`selected_role`, `selected_user_id`).
- Data store mutations remain in-memory for MVP data and are still marked with Supabase handoff comments in `src/store/dataStore.ts`.

## Privacy Rules

Privacy is absolute at the player level:

- `public`: visible to recruiters
- `private`: hidden from recruiters and non-linked users
- parents/coaches still see linked players
