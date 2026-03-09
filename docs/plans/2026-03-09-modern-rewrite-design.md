# Fear & Loathing Trail — Modern Rewrite Design

**Date:** 2026-03-09
**Status:** Approved
**Author:** netstoat (for brendangradyco)

## Goal

Rewrite the single-file monolith (1,836-line `index.html`) into a modern, maintainable React application. Preserve all existing features, fix all bugs, and hand back a clean codebase the developer can continue building on.

## Constraints

- **Free deployment** — Vercel free tier (auto-deploy from GitHub)
- **Preserve all features** — P2P multiplayer, WebRTC video/audio, hunting minigame, drug shop, random events, PWA
- **Maintainable by inexperienced developer** — React chosen for ecosystem size and learning resources

## Tech Stack

| Category | Choice | Why |
|----------|--------|-----|
| Build | Vite | Fast, zero-config, free on Vercel |
| Framework | React 19 | Component model enforces separation; largest learning ecosystem |
| Language | TypeScript | Catches magic-string bugs, enforces data models |
| State | Zustand | Simple game state management, works outside React |
| Styling | Tailwind CSS v4 | Utility-first, preserves dark aesthetic |
| Networking | PeerJS 1.5.2 | Already works for P2P, just needs proper wrapping |
| Testing | Vitest | Fast, Vite-native |
| Linting | Biome | 10-25x faster than ESLint + Prettier |
| Deploy | Vercel (free tier) | Auto-deploys, preview URLs, custom domain |

## Project Structure

```
fear-loathing-trail/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── CLAUDE.md
├── README.md
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── stores/
│   │   ├── gameStore.ts
│   │   ├── playerStore.ts
│   │   └── networkStore.ts
│   ├── data/
│   │   ├── trailStops.ts
│   │   ├── events.ts
│   │   ├── shops.ts
│   │   ├── skills.ts
│   │   ├── quirks.ts
│   │   └── constants.ts
│   ├── engine/
│   │   ├── gameLoop.ts
│   │   ├── eventResolver.ts
│   │   ├── skillCheck.ts
│   │   └── hunting.ts
│   ├── network/
│   │   ├── peerManager.ts
│   │   ├── messageProtocol.ts
│   │   └── mediaManager.ts
│   ├── components/
│   │   ├── screens/
│   │   │   ├── CharCreate.tsx
│   │   │   ├── LocationSelect.tsx
│   │   │   ├── SkillReview.tsx
│   │   │   ├── Lobby.tsx
│   │   │   ├── Shop.tsx
│   │   │   ├── GameMap.tsx
│   │   │   ├── HuntGame.tsx
│   │   │   ├── DeathScreen.tsx
│   │   │   └── WinScreen.tsx
│   │   ├── game/
│   │   │   ├── StatsBar.tsx
│   │   │   ├── TrailMap.tsx
│   │   │   ├── EventModal.tsx
│   │   │   └── GameLog.tsx
│   │   ├── social/
│   │   │   ├── VideoOverlay.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   └── PlayerList.tsx
│   │   └── shared/
│   │       ├── Avatar.tsx
│   │       └── Button.tsx
│   └── utils/
│       ├── geo.ts
│       ├── storage.ts
│       └── clamp.ts
└── tests/
    ├── engine/
    │   ├── gameLoop.test.ts
    │   ├── eventResolver.test.ts
    │   └── skillCheck.test.ts
    └── stores/
        └── gameStore.test.ts
```

## Architecture

### State Management — 3 Zustand Stores

**playerStore** — persists across games:
- id, name, sex, age, quirks, skills, region

**gameStore** — current session:
- phase (TypeScript enum: TRAVEL | EVENT | SHOP | HUNT | DEAD | WIN)
- stopIdx, fuel (0-100), sanity (0-100), cash, supplies, disguises, laserAmmo, meat
- log entries, player roster
- Actions: travel(), rest(), buyItem(), resolveEvent(), addHuntReward()
- All mutations clamped centrally (fuel/sanity always 0-100)

**networkStore** — P2P state:
- roomId, isHost, connection status, peer list
- localStream, micMuted, camOn

### Game Engine — Pure Functions (no DOM, no side effects)

**gameLoop.ts** — travel cost calculation, stop progression, event probability, death/win checks
**eventResolver.ts** — apply event choice effects to state, resolve skill checks
**skillCheck.ts** — centralized `rollSkill(skillValue, threshold)` function
**hunting.ts** — hunt minigame logic (target spawning, collision, scoring) separate from canvas rendering

### Event System — Declarative Data

Events are pure typed data with `effects` objects instead of mutation functions:
```typescript
{
  id: 'bats',
  title: 'BAT COUNTRY',
  choices: [{
    id: 'floor_it',
    label: 'Floor it',
    effects: { fuel: -15 },
    flavor: 'You floor it through the bat swarm.',
  }]
}
```

The `eventResolver` applies effects uniformly — no scattered `g.fuel -= 15`.

### Networking — Typed PeerJS Wrapper

- PeerManager class wraps PeerJS lifecycle (create/join/broadcast)
- TypeScript discriminated union for message types (HELLO, GAME_STATE, CHAT, PLAYER_LEFT)
- Validates incoming messages before touching state
- MediaManager handles WebRTC camera/mic streams separately

### Bug Fixes (Structural)

| Bug | Fix |
|-----|-----|
| Orphaned `miles` field | TypeScript interface — unused fields don't compile |
| Unhandled promises | Error boundaries + proper .catch() chains |
| Race condition in Loc.advance | React component lifecycle handles transitions cleanly |
| playerData null crash | TypeScript non-null guarantees + store initialization |
| Hunt timer leak | useEffect cleanup unmounts timer |
| Silent PeerNet failures | networkStore tracks error state, UI surfaces it |
| Magic strings | TypeScript enums (Phase, Region, QuirkId) |
| Scattered state clamping | Centralized in store actions |
| XSS in chat | React JSX auto-escapes |
| Missing PWA icons | Generate actual assets |

## Deliverables

1. Full React + TypeScript rewrite of all 14 screens
2. 3 Zustand stores (player, game, network)
3. Pure game engine (testable, no DOM)
4. Data-driven event system
5. Typed P2P networking layer
6. All 20 bugs fixed structurally
7. Vitest test suite for core engine
8. Comprehensive README.md
9. CLAUDE.md for future agent development
10. PWA icons generated
11. Tailwind dark theme preserving original aesthetic
12. Vercel deployment config
