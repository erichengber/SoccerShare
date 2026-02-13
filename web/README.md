# SoccerShare (Soccer Highlights)

Role-based React + TypeScript frontend MVP inspired by Hudl for middle/high school soccer pathways (rec -> travel -> club -> school).

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-style component primitives
- React Router
- Zustand (with persisted recruiter and auth state)
- Mock in-memory data only (no backend)

## Run

```bash
npm install
npm run dev
```

## Routes

- Public: `/`, `/login`, `/register`, `/select-role`
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

## Supabase Integration Points

- `src/lib/authClient.ts`
  - `loginWithPassword`
  - `registerWithPassword`
  - Contains handoff notes for replacing mock auth with Supabase Auth + profiles table linkage.
- `src/store/dataStore.ts`
  - `uploadClip`
  - `updateClip`
  - `setPlayerPrivacy`

These methods are already isolated and commented as handoff points for replacing in-memory mutations with Supabase calls.

## Privacy Rules

Privacy is absolute at the player level:

- `public`: visible to recruiters
- `private`: hidden from recruiters and non-linked users
- parents/coaches still see linked players
