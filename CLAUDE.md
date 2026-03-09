# CLAUDE.md -- Fear & Loathing Trail

## Project Overview
Oregon Trail clone themed on Fear and Loathing in Las Vegas. P2P multiplayer, React + TypeScript, Vite, Zustand, PeerJS.

## Tech Stack
- React 19 + TypeScript, Vite build
- Zustand for state (3 stores: player, game, network)
- Tailwind CSS v4 (CSS-first @theme config in globals.css)
- PeerJS 1.5.2 for WebRTC P2P multiplayer
- Vitest for testing, Biome for linting

## Architecture Rules
1. Game logic in `src/engine/` -- pure functions only, no DOM, no side effects
2. Game data in `src/data/` -- declarative, no callback functions
3. State in `src/stores/` -- all mutations through Zustand store actions
4. Components render only -- read stores, call actions, no direct state mutation
5. Network messages typed -- validated via `messageProtocol.ts`

## Key Patterns
- Adding events: Add to `src/data/events.ts` as pure data with `effects` objects
- State clamping: All in `eventResolver.ts:applyEffects()` -- don't clamp elsewhere
- Skill checks: Use `rollSkill()` from `skillCheck.ts` -- no inline Math.random
- Shop items: `effects` for additive, `setEffects` for absolute, `sideEffect` for random

## Commands
```bash
npm run dev          # Dev server
npm run build        # Production build
npm test             # Run tests
npx biome check .    # Lint
```

## Deploy
Vercel auto-deploys from main. Production build is static files in `dist/`.
