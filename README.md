# Fear & Loathing Trail

A Fear and Loathing in Las Vegas themed Oregon Trail game. Multiplayer, peer-to-peer, no server required.

> "We can't stop here -- this is bat country."

## Play

**Live:** *(Deploy URL will go here after Vercel setup)*

**Local:**
```bash
npm install
npm run dev
```

## Features

- Drive from Las Vegas to Anchorage across 12 stops
- Random encounters: bats, police, storms, Samoan attorneys, and more
- Resource management: fuel, sanity, cash, supplies
- Drug shop & supply store
- Hunting minigame (laser gun + desert creatures)
- Peer-to-peer multiplayer (WebRTC via PeerJS -- no server needed)
- Optional video/audio chat
- Character creation with quirks & SVG avatars
- Region-based skill system
- Progressive Web App (installable, works offline)

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| State | Zustand |
| Styling | Tailwind CSS v4 |
| Networking | PeerJS (WebRTC) |
| Testing | Vitest |
| Linting | Biome |
| Deploy | Vercel (free tier) |

## Architecture

```
src/
├── data/          # Game data (events, stops, shops, skills, quirks)
├── engine/        # Pure game logic (no DOM, no side effects)
├── stores/        # Zustand state management (player, game, network)
├── network/       # PeerJS wrapper & WebRTC media
├── components/
│   ├── screens/   # Full-page screens (char create, lobby, game map, etc.)
│   ├── game/      # Game UI (stats bar, trail map, event modal, log)
│   ├── social/    # Multiplayer UI (chat, video, player list)
│   └── shared/    # Reusable components (avatar, toast)
├── types/         # TypeScript type definitions
└── utils/         # Helpers (geo, storage, clamp)
```

**Key principles:**
- Game logic in `engine/` -- pure functions, fully testable, no DOM
- Events are declarative data -- no callback functions, easy to extend
- State managed by 3 Zustand stores -- no god objects
- Components only render -- they read from stores and call store actions

## How to Add a New Event

Add an entry to `src/data/events.ts`:

```typescript
{
  id: 'ufo',
  title: 'UNIDENTIFIED FLYING OBJECT',
  text: 'Something is hovering above the highway.',
  choices: [
    {
      id: 'investigate',
      label: 'Investigate',
      effects: { sanity: -20, cash: 500 },
      flavor: 'They paid you to forget.',
    },
    {
      id: 'floor_it',
      label: 'Floor it',
      effects: { fuel: -10 },
      flavor: 'You floor it. The light fades.',
    },
  ],
}
```

The event resolver handles everything else automatically.

## Multiplayer

1. Open the game -- a room code is auto-generated
2. Share the URL (room code is in the hash) with friends
3. First player to open becomes the host
4. Others join automatically
5. Players can join mid-game

No server required -- connections are peer-to-peer via WebRTC.

## Deploy to Vercel (Free)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) -> "Add New Project" -> select repo
3. Click Deploy (Vercel auto-detects Vite)
4. Every `git push` to `main` auto-deploys

Or deploy anywhere that serves static files:
```bash
npm run build
# Upload dist/ to any static host
```

## Development

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # Production build
npm run preview    # Preview production build
npm test           # Run tests
npx biome check .  # Lint & format
```

## License

MIT
