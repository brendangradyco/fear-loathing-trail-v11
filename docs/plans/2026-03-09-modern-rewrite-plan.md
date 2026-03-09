# Fear & Loathing Trail — Modern Rewrite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the single-file monolith (`index.html`, 1,836 lines) into a modern Vite + React + TypeScript application with proper architecture, all bugs fixed, and comprehensive documentation.

**Architecture:** Component-based React app with 3 Zustand stores (player, game, network), a pure game engine layer (no DOM), data-driven events, and a typed PeerJS networking wrapper. All game logic separated from rendering.

**Tech Stack:** Vite, React 19, TypeScript, Zustand, Tailwind CSS v4, PeerJS 1.5.2, Vitest, Biome

**Source reference:** Original code at `index.html` — all game data, logic, and UI must be preserved.

---

## Task 1: Scaffold Vite + React + TypeScript Project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/vite-env.d.ts`
- Create: `biome.json`
- Delete: (nothing yet — original `index.html` stays for reference)

**Step 1: Initialize project**

```bash
cd /tmp/fear-loathing-trail-v11
npm create vite@latest . -- --template react-ts
# Select: Yes to overwrite (it will scaffold into existing dir)
```

If the interactive prompt blocks, manually create the files:

```bash
npm init -y
npm install react@19 react-dom@19
npm install -D typescript @types/react @types/react-dom vite @vitejs/plugin-react
```

**Step 2: Install dependencies**

```bash
npm install zustand peerjs@1.5.2
npm install -D tailwindcss @tailwindcss/vite @biomejs/biome vitest @testing-library/react @testing-library/jest-dom jsdom
npx biome init
```

**Step 3: Configure Vite**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});
```

**Step 4: Create test setup**

```typescript
// src/test-setup.ts
import '@testing-library/jest-dom';
```

**Step 5: Create entry point**

```typescript
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

```typescript
// src/App.tsx
export default function App() {
  return <div>Fear & Loathing Trail — Loading...</div>;
}
```

**Step 6: Run to verify**

```bash
npm run dev
```

Expected: Vite dev server starts, shows placeholder text.

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript project"
```

---

## Task 2: Port Game Data & Type Definitions

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/constants.ts`
- Create: `src/data/trailStops.ts`
- Create: `src/data/events.ts`
- Create: `src/data/shops.ts`
- Create: `src/data/skills.ts`
- Create: `src/data/quirks.ts`

**Step 1: Define all TypeScript types**

```typescript
// src/types/index.ts
export enum Phase {
  TRAVEL = 'travel',
  EVENT = 'event',
  SHOP = 'shop',
  HUNT = 'hunt',
  DEAD = 'dead',
  WIN = 'win',
}

export enum Region {
  SOUTHWEST = 'southwest',
  NORTHWEST = 'northwest',
  MOUNTAIN = 'mountain',
  PLAINS = 'plains',
  DEFAULT = 'default',
}

export type Sex = 'male' | 'female' | 'other';
export type Age = 'young' | 'adult' | 'middle' | 'old';

export interface SkillSet {
  driving: number;
  navigation: number;
  smooth: number;
  mechanical: number;
  charisma: number;
  survival: number;
}

export type SkillName = keyof SkillSet;

export interface Quirk {
  id: string;
  icon: string;
  label: string;
}

export interface TrailStop {
  id: string;
  name: string;
  emoji: string;
  lat: number;
  lon: number;
  dist: number;
  desc: string;
}

export interface EventEffect {
  fuel?: number;
  sanity?: number;
  cash?: number;
  supplies?: number;
  disguises?: number;
  laserAmmo?: number;
  meat?: number;
  miles?: number;
}

export interface SkillCheck {
  skill: SkillName;
  threshold: number;
  passEffects?: EventEffect;
  failEffects?: EventEffect;
  passText: string;
  failText: string;
}

export interface EventChoice {
  id: string;
  label: string;
  effects: EventEffect;
  skillCheck?: SkillCheck;
  conditionalCheck?: {
    resource: keyof EventEffect;
    minRequired: number;
    consumeAmount: number;
    passText: string;
    failEffects: EventEffect;
    failText: string;
  };
  flavor: string;
}

export interface GameEvent {
  id: string;
  title: string;
  text: string;
  choices: EventChoice[];
}

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  effects: EventEffect;
  /** For items that set a value to a fixed amount (e.g., fuel to 100) */
  setEffects?: Partial<Record<keyof EventEffect, number>>;
  /** Random chance of negative side effect */
  sideEffect?: { chance: number; effects: EventEffect };
}

export interface LogEntry {
  txt: string;
  bad: boolean;
  good: boolean;
}

export interface PlayerData {
  name: string;
  sex: Sex;
  age: Age;
  quirks: string[];
  skills: SkillSet;
  region: Region;
}

export interface GameState {
  phase: Phase;
  stopIdx: number;
  fuel: number;
  sanity: number;
  cash: number;
  supplies: number;
  disguises: number;
  laserAmmo: number;
  meat: number;
  skills: SkillSet;
  log: LogEntry[];
  players: Record<string, { name: string; alive: boolean }>;
}

export interface PeerInfo {
  id: string;
  name: string;
  player: PlayerData;
  isHost: boolean;
}

export type MessageType =
  | { type: 'HELLO'; pid: string; player: PlayerData }
  | { type: 'WELCOME'; players: Record<string, PlayerData>; game?: GameState }
  | { type: 'PLAYER_JOINED'; pid: string; player: PlayerData }
  | { type: 'PLAYER_LEFT'; pid: string }
  | { type: 'MEET'; peerId: string }
  | { type: 'GAME_STATE'; game: GameState }
  | { type: 'CHAT'; text: string; sender: string; senderName: string }
  | { type: 'CHAT_SYS'; text: string };
```

**Step 2: Port constants**

```typescript
// src/data/constants.ts
export const CFG = {
  VERSION: 'v3',
  PEER_PREFIX: 'flt3room',
  MIN_ROOM_CODE: 6,
  MAX_PLAYERS: 6,
  REROLLS: 3,
  STORE_KEY: 'flt3_player',
  GAME_KEY: 'flt3_game',
  PID_KEY: 'flt3_pid',
  HUNT_DURATION: 30,
  HUNT_TARGET_COUNT: 6,
  HUNT_TARGET_EMOJIS: ['🦇', '🦎', '🐍', '🦅'],
  EVENT_CHANCE: 0.4,
  TRAVEL_FUEL_BASE: 20,
  TRAVEL_FUEL_VARIANCE: 15,
  REST_SANITY_GAIN: 15,
  REST_FUEL_COST: 5,
  STARTING_CASH: 350,
  STARTING_FUEL: 100,
  STARTING_SANITY: 100,
  STARTING_SUPPLIES: 5,
  STARTING_DISGUISES: 2,
  STARTING_LASER_AMMO: 10,
} as const;

export const SKILL_LABELS: Record<string, string> = {
  driving: 'Driving',
  navigation: 'Navigation',
  smooth: 'Smooth Talk',
  mechanical: 'Mechanical',
  charisma: 'Charisma',
  survival: 'Survival',
};
```

**Step 3: Port trail stops** (from `index.html:432-445`)

```typescript
// src/data/trailStops.ts
import { TrailStop } from '../types';

export const TRAIL_STOPS: TrailStop[] = [
  { id: 'start', name: 'Las Vegas, NV', emoji: '🎰', lat: 36.17, lon: -115.14, dist: 0, desc: 'Where the dream died and the ether began.' },
  { id: 'slc', name: 'Salt Lake City, UT', emoji: '⛪', lat: 40.76, lon: -111.89, dist: 420, desc: 'God-fearing country. Hide the drugs.' },
  { id: 'boise', name: 'Boise, ID', emoji: '🥔', lat: 43.61, lon: -116.20, dist: 780, desc: 'Potato people. Deeply suspicious of sunglasses.' },
  { id: 'portland', name: 'Portland, OR', emoji: '☕', lat: 45.52, lon: -122.68, dist: 1050, desc: 'Everyone here is writing a zine about bats.' },
  { id: 'seattle', name: 'Seattle, WA', emoji: '🌧️', lat: 47.61, lon: -122.33, dist: 1200, desc: 'The rain knows what you did in Nevada.' },
  { id: 'vancouver', name: 'Vancouver, BC', emoji: '🍁', lat: 49.28, lon: -123.12, dist: 1350, desc: 'Canada greets you with suspicion and politeness.' },
  { id: 'prince', name: 'Prince George, BC', emoji: '🌲', lat: 53.91, lon: -122.75, dist: 1800, desc: 'The last place with decent coffee and running water.' },
  { id: 'watson', name: 'Watson Lake, YT', emoji: '🪐', lat: 60.06, lon: -128.71, dist: 2400, desc: 'Sign post forest. No sign points to sanity.' },
  { id: 'whitehorse', name: 'Whitehorse, YT', emoji: '🐺', lat: 60.72, lon: -135.05, dist: 2700, desc: 'The wolves here understand adrenochrome.' },
  { id: 'tok', name: 'Tok, AK', emoji: '🏔️', lat: 63.34, lon: -142.99, dist: 3100, desc: 'America again. But wrong. Very wrong.' },
  { id: 'fairbanks', name: 'Fairbanks, AK', emoji: '🌌', lat: 64.84, lon: -147.72, dist: 3400, desc: 'Aurora borealis on three tabs of mescaline.' },
  { id: 'anchorage', name: 'Anchorage, AK', emoji: '🏁', lat: 61.22, lon: -149.90, dist: 3700, desc: 'THE END. You made it, you magnificent freak.' },
];
```

**Step 4: Port events as declarative data** (from `index.html:447-496`)

Convert all `fn:` callbacks into `effects` objects and `skillCheck`/`conditionalCheck` declarations. Reference original `index.html:447-496` for exact values.

```typescript
// src/data/events.ts
import { GameEvent } from '../types';

export const EVENTS: GameEvent[] = [
  {
    id: 'bats',
    title: 'BAT COUNTRY',
    text: 'The bats are thick tonight. You can hear them breathing.',
    choices: [
      { id: 'floor_it', label: 'Floor it', effects: { fuel: -15 }, flavor: 'Floored it through bat country.' },
      { id: 'embrace', label: 'Embrace the bats', effects: { sanity: -10 }, flavor: 'The bats are friendly. Weirdly friendly.' },
    ],
  },
  {
    id: 'lizard',
    title: 'LIZARD PEOPLE',
    text: "The hotel clerk's face keeps shifting. Scales, man. Scales everywhere.",
    choices: [
      { id: 'check_in', label: 'Check in anyway', effects: { sanity: -15 }, flavor: 'You checked in. The scales were real.' },
      { id: 'camp', label: 'Camp outside', effects: { fuel: 5, sanity: 5 }, flavor: 'Slept under stars. No scales.' },
    ],
  },
  {
    id: 'attorney',
    title: 'SAMOAN ATTORNEY',
    text: 'A large Samoan man is flagging you down from the roadside.',
    choices: [
      { id: 'pick_up', label: 'Pick him up', effects: { cash: 200 }, flavor: 'The attorney joins. He knows people.' },
      { id: 'gun_it', label: 'Gun it', effects: { sanity: -5 }, flavor: 'His curses echo for miles.' },
    ],
  },
  {
    id: 'adrenochrome',
    title: 'ADRENOCHROME',
    text: "Someone left a vial on the passenger seat. You don't remember buying it.",
    choices: [
      { id: 'take_it', label: 'Take it', effects: { sanity: -25 }, flavor: 'Everything is neon and teeth.' },
      { id: 'throw_out', label: 'Throw it out', effects: { sanity: 5 }, flavor: 'Virtue is fleeting on this road.' },
    ],
  },
  {
    id: 'police',
    title: 'HIGHWAY PATROL',
    text: 'Flashing lights. The officer peers through your window for a long time.',
    choices: [
      {
        id: 'disguise',
        label: 'Use disguise',
        effects: {},
        conditionalCheck: {
          resource: 'disguises',
          minRequired: 1,
          consumeAmount: 1,
          passText: 'Disguise worked. Phew.',
          failEffects: { cash: -100 },
          failText: 'No disguise. $100 fine.',
        },
        flavor: 'Disguise used. You escape.',
      },
      {
        id: 'talk',
        label: 'Talk your way out',
        effects: {},
        skillCheck: {
          skill: 'smooth',
          threshold: 30,
          passText: 'Silver tongue saves the day.',
          failEffects: { cash: -150 },
          failText: 'The cop is not impressed. $150.',
        },
        flavor: 'Depends on smooth skill.',
      },
    ],
  },
  {
    id: 'breakdown',
    title: 'GREAT RED SHARK',
    text: 'The car makes a sound that no car should make.',
    choices: [
      {
        id: 'fix',
        label: 'Fix it',
        effects: { fuel: -20 },
        skillCheck: {
          skill: 'mechanical',
          threshold: 30,
          passText: 'Fixed. Barely.',
          failEffects: { fuel: -30 },
          failText: 'Made it worse. Fuel -30.',
        },
        flavor: 'Mechanical skill check. Fuel -20.',
      },
      {
        id: 'drive_through',
        label: 'Drive through it',
        effects: {},
        skillCheck: {
          skill: 'driving',
          threshold: 50,
          passText: 'Against all odds, it holds.',
          failEffects: { fuel: -50, sanity: -10 },
          failText: 'Rough. Very rough. Fuel -50.',
        },
        flavor: 'Might make it. Might not.',
      },
    ],
  },
  {
    id: 'casino',
    title: 'ROADSIDE CASINO',
    text: 'A casino. On a highway. In the middle of nowhere. Naturally.',
    choices: [
      {
        id: 'gamble',
        label: 'Gamble ($50)',
        effects: { cash: -50 },
        conditionalCheck: {
          resource: 'cash',
          minRequired: 50,
          consumeAmount: 0,
          passText: 'You won $120!',
          failEffects: {},
          failText: 'Not enough cash.',
        },
        skillCheck: {
          skill: 'charisma',
          threshold: 50,
          passEffects: { cash: 120 },
          passText: 'You won $120!',
          failText: 'Lost $50. The house always wins.',
        },
        flavor: '50/50 chance.',
      },
      { id: 'keep_driving', label: 'Keep driving', effects: { sanity: 3 }, flavor: 'You drove past. A minor miracle.' },
    ],
  },
  {
    id: 'border',
    title: 'CANADIAN BORDER',
    text: "The border agent asks where you're going. You have no idea.",
    choices: [
      {
        id: 'improvise',
        label: 'Improvise wildly',
        effects: {},
        skillCheck: {
          skill: 'charisma',
          threshold: 40,
          passText: 'They let you through somehow.',
          failEffects: { cash: -80 },
          failText: 'Inspection fee. $80.',
        },
        flavor: 'Charisma check.',
      },
      { id: 'truth', label: 'Tell the truth', effects: { sanity: 5 }, flavor: 'Honesty works at the border. Who knew.' },
    ],
  },
  {
    id: 'wolves',
    title: 'WOLVES',
    text: 'A pack of wolves is blocking the road. They seem… expectant.',
    choices: [
      {
        id: 'honk',
        label: 'Honk and floor it',
        effects: {},
        skillCheck: {
          skill: 'driving',
          threshold: 30,
          passText: 'Wolves disperse. Good instincts.',
          failEffects: { supplies: -1, sanity: -8 },
          failText: 'One jumped on the car. Supplies -1.',
        },
        flavor: 'They scatter. Probably.',
      },
      { id: 'offer', label: 'Offer supplies', effects: { supplies: -1 }, flavor: 'Wolves nod. They were just hungry.' },
    ],
  },
  {
    id: 'storm',
    title: 'ACID STORM',
    text: 'The rain is the wrong color. This is not good.',
    choices: [
      { id: 'wait', label: 'Pull over and wait', effects: { sanity: -5 }, flavor: 'You waited it out. The rain was purple.' },
      { id: 'drive', label: 'Drive through', effects: { fuel: -25, sanity: -12 }, flavor: 'You drove through the wrong-colored rain.' },
    ],
  },
  {
    id: 'feast',
    title: 'ROADSIDE FEAST',
    text: 'Locals invite you to a barbecue. The meat smells incredible.',
    choices: [
      { id: 'join', label: 'Join them', effects: { supplies: 2, sanity: 10 }, flavor: 'Best meal of the trip. No questions asked.' },
      { id: 'pass', label: 'Keep moving', effects: { sanity: -5 }, flavor: 'The smell haunts you for 200 miles.' },
    ],
  },
  {
    id: 'hitchhiker',
    title: 'HITCHER',
    text: 'A hitchhiker with a briefcase full of something.',
    choices: [
      { id: 'ride', label: 'Give a ride', effects: { cash: 100 }, flavor: 'They pay well and ask no questions. Neither do you.' },
      { id: 'pass', label: 'Drive past', effects: {}, flavor: 'The safe choice. Boring, but alive.' },
    ],
  },
];
```

**Step 5: Port shop items** (from `index.html:506-519`)

```typescript
// src/data/shops.ts
import { ShopItem } from '../types';

export const DRUG_SHOP: ShopItem[] = [
  { id: 'ether', name: 'Ether', desc: '+20 sanity, wild drive', price: 60, effects: { sanity: 20 } },
  { id: 'mescaline', name: 'Mescaline', desc: '+15 sanity, see things', price: 40, effects: { sanity: 15 } },
  { id: 'adren', name: 'Adrenochrome', desc: '+30 sanity, dangerous', price: 120, effects: { sanity: 30 }, sideEffect: { chance: 0.3, effects: { sanity: -20 } } },
  { id: 'amyls', name: 'Amyl Nitrate', desc: '+10 sanity instant', price: 25, effects: { sanity: 10 } },
  { id: 'grass', name: 'Grass', desc: 'Chill out +8 sanity', price: 20, effects: { sanity: 8 } },
];

export const SUPPLY_SHOP: ShopItem[] = [
  { id: 'fuel', name: 'Fuel (full tank)', desc: 'Fill tank to 100', price: 80, effects: {}, setEffects: { fuel: 100 } },
  { id: 'supplies', name: 'Supplies (+3)', desc: 'Food & water for road', price: 45, effects: { supplies: 3 } },
  { id: 'disguise', name: 'Disguise Kit', desc: 'Evade one police stop', price: 70, effects: { disguises: 1 } },
  { id: 'laser', name: 'Laser Cells', desc: '+10 laser ammo for hunt', price: 30, effects: { laserAmmo: 10 } },
  { id: 'repair', name: 'Car Repair', desc: 'Full fuel + sanity +15', price: 100, effects: { sanity: 15 }, setEffects: { fuel: 100 } },
];
```

**Step 6: Port skills & quirks** (from `index.html:498-504, 415-429`)

```typescript
// src/data/skills.ts
import { Region, SkillSet } from '../types';

export const SKILLS_BY_REGION: Record<Region | 'default', SkillSet> = {
  [Region.SOUTHWEST]: { driving: 70, navigation: 60, smooth: 50, mechanical: 40, charisma: 65, survival: 35 },
  [Region.NORTHWEST]: { driving: 55, navigation: 70, smooth: 45, mechanical: 60, charisma: 40, survival: 65 },
  [Region.MOUNTAIN]: { driving: 60, navigation: 65, smooth: 40, mechanical: 55, charisma: 45, survival: 70 },
  [Region.PLAINS]: { driving: 65, navigation: 55, smooth: 60, mechanical: 50, charisma: 55, survival: 50 },
  [Region.DEFAULT]: { driving: 55, navigation: 55, smooth: 50, mechanical: 50, charisma: 50, survival: 50 },
  default: { driving: 55, navigation: 55, smooth: 50, mechanical: 50, charisma: 50, survival: 50 },
};

export function generateSkills(region: Region): SkillSet {
  const base = SKILLS_BY_REGION[region] ?? SKILLS_BY_REGION.default;
  const out = {} as SkillSet;
  for (const [k, v] of Object.entries(base)) {
    out[k as keyof SkillSet] = Math.max(10, Math.min(95, v + Math.floor(Math.random() * 30 - 15)));
  }
  return out;
}
```

```typescript
// src/data/quirks.ts
import { Quirk } from '../types';

export const QUIRKS: Quirk[] = [
  { id: 'peg_leg', icon: '🦿', label: 'Peg Leg' },
  { id: 'missing_eye', icon: '👁️', label: 'Missing Eye' },
  { id: 'eye_patch_left', icon: '🏴‍☠️', label: 'Patch (L)' },
  { id: 'eye_patch_right', icon: '🏴‍☠️', label: 'Patch (R)' },
  { id: 'stank_butt', icon: '💨', label: 'Stank Butt' },
  { id: 'hook_hand', icon: '🪝', label: 'Hook Hand' },
  { id: 'mohawk', icon: '⚡', label: 'Mohawk' },
  { id: 'scar', icon: '⚔️', label: 'Scar' },
  { id: 'sunglasses', icon: '🕶️', label: 'Sunglasses' },
  { id: 'tattoos', icon: '🐉', label: 'Tattoos' },
  { id: 'mullet', icon: '🤘', label: 'Mullet' },
  { id: 'wizard_beard', icon: '🧙', label: 'Wiz Beard' },
  { id: 'third_eye', icon: '🔮', label: 'Third Eye' },
];
```

**Step 7: Run type check**

```bash
npx tsc --noEmit
```

Expected: No type errors.

**Step 8: Commit**

```bash
git add src/types/ src/data/
git commit -m "feat: port game data and type definitions"
```

---

## Task 3: Build Game Engine (Pure Functions)

**Files:**
- Create: `src/engine/gameLoop.ts`
- Create: `src/engine/eventResolver.ts`
- Create: `src/engine/skillCheck.ts`
- Create: `src/engine/hunting.ts`
- Create: `src/utils/clamp.ts`
- Create: `src/utils/geo.ts`
- Create: `src/utils/storage.ts`
- Test: `tests/engine/gameLoop.test.ts`
- Test: `tests/engine/eventResolver.test.ts`
- Test: `tests/engine/skillCheck.test.ts`

**Step 1: Create utility functions**

```typescript
// src/utils/clamp.ts
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
```

```typescript
// src/utils/geo.ts
import { Region } from '../types';

export function getRegion(lat: number, lon: number): Region {
  if (lat > 24 && lat < 72 && lon > -170 && lon < -52) {
    if (lat < 37 && lon > -115) return Region.SOUTHWEST;
    if (lat > 44 && lon < -115) return Region.NORTHWEST;
    if (lat > 37 && lat < 44 && lon > -115 && lon < -100) return Region.MOUNTAIN;
    return Region.PLAINS;
  }
  return Region.DEFAULT;
}
```

```typescript
// src/utils/storage.ts
import type { PlayerData, GameState } from '../types';
import { CFG } from '../data/constants';

export const Storage = {
  savePlayer(data: PlayerData): void {
    localStorage.setItem(CFG.STORE_KEY, JSON.stringify(data));
  },
  loadPlayer(): PlayerData | null {
    try {
      const raw = localStorage.getItem(CFG.STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  saveGame(state: GameState): void {
    localStorage.setItem(CFG.GAME_KEY, JSON.stringify(state));
  },
  loadGame(): GameState | null {
    try {
      const raw = localStorage.getItem(CFG.GAME_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clearGame(): void {
    localStorage.removeItem(CFG.GAME_KEY);
  },
  getPlayerId(): string {
    let id = localStorage.getItem(CFG.PID_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(CFG.PID_KEY, id);
    }
    return id;
  },
};
```

**Step 2: Write skill check engine**

```typescript
// src/engine/skillCheck.ts
import type { SkillSet, SkillName } from '../types';

export function rollSkill(skills: SkillSet, skill: SkillName, threshold: number = 30): boolean {
  const value = skills[skill] ?? threshold;
  return Math.random() < value / 100;
}
```

**Step 3: Write event resolver**

```typescript
// src/engine/eventResolver.ts
import type { GameState, GameEvent, EventChoice, EventEffect } from '../types';
import { clamp } from '../utils/clamp';
import { rollSkill } from './skillCheck';

export function applyEffects(state: GameState, effects: EventEffect): GameState {
  return {
    ...state,
    fuel: clamp((state.fuel + (effects.fuel ?? 0)), 0, 100),
    sanity: clamp((state.sanity + (effects.sanity ?? 0)), 0, 100),
    cash: Math.max(0, state.cash + (effects.cash ?? 0)),
    supplies: Math.max(0, state.supplies + (effects.supplies ?? 0)),
    disguises: Math.max(0, state.disguises + (effects.disguises ?? 0)),
    laserAmmo: Math.max(0, state.laserAmmo + (effects.laserAmmo ?? 0)),
    meat: Math.max(0, state.meat + (effects.meat ?? 0)),
  };
}

export interface EventResult {
  newState: GameState;
  text: string;
}

export function resolveEventChoice(
  state: GameState,
  event: GameEvent,
  choiceId: string,
): EventResult {
  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return { newState: state, text: 'Nothing happened.' };
  }

  // Apply base effects first
  let newState = applyEffects(state, choice.effects);
  let text = choice.flavor;

  // Handle conditional checks (e.g., "do you have a disguise?")
  if (choice.conditionalCheck) {
    const cc = choice.conditionalCheck;
    const resourceValue = newState[cc.resource as keyof GameState] as number;
    if (resourceValue >= cc.minRequired) {
      // Consume the resource
      if (cc.consumeAmount > 0) {
        newState = applyEffects(newState, { [cc.resource]: -cc.consumeAmount });
      }
      text = cc.passText;
    } else {
      newState = applyEffects(newState, cc.failEffects);
      text = cc.failText;
    }
  }

  // Handle skill checks
  if (choice.skillCheck) {
    const sc = choice.skillCheck;
    if (rollSkill(newState.skills, sc.skill, sc.threshold)) {
      if (sc.passEffects) {
        newState = applyEffects(newState, sc.passEffects);
      }
      text = sc.passText;
    } else {
      if (sc.failEffects) {
        newState = applyEffects(newState, sc.failEffects);
      }
      text = sc.failText;
    }
  }

  return { newState, text };
}
```

**Step 4: Write game loop logic**

```typescript
// src/engine/gameLoop.ts
import type { GameState, SkillSet } from '../types';
import { Phase } from '../types';
import { CFG } from '../data/constants';
import { TRAIL_STOPS } from '../data/trailStops';
import { EVENTS } from '../data/events';
import { clamp } from '../utils/clamp';

export function createNewGame(skills: SkillSet, playerId: string, playerName: string): GameState {
  return {
    phase: Phase.TRAVEL,
    stopIdx: 0,
    fuel: CFG.STARTING_FUEL,
    sanity: CFG.STARTING_SANITY,
    cash: CFG.STARTING_CASH,
    supplies: CFG.STARTING_SUPPLIES,
    disguises: CFG.STARTING_DISGUISES,
    laserAmmo: CFG.STARTING_LASER_AMMO,
    meat: 0,
    skills,
    log: [],
    players: { [playerId]: { name: playerName, alive: true } },
  };
}

export interface TravelResult {
  state: GameState;
  triggeredEvent: (typeof EVENTS)[number] | null;
}

export function travel(state: GameState): TravelResult {
  if (state.stopIdx >= TRAIL_STOPS.length - 1) {
    return { state, triggeredEvent: null };
  }

  const fuelCost = CFG.TRAVEL_FUEL_BASE + Math.floor(Math.random() * CFG.TRAVEL_FUEL_VARIANCE);
  const newState: GameState = {
    ...state,
    stopIdx: state.stopIdx + 1,
    fuel: clamp(state.fuel - fuelCost, 0, 100),
    supplies: Math.max(0, state.supplies - 1),
  };

  // Random event check
  const triggeredEvent = Math.random() < CFG.EVENT_CHANCE
    ? EVENTS[Math.floor(Math.random() * EVENTS.length)]
    : null;

  return {
    state: { ...newState, phase: triggeredEvent ? Phase.EVENT : Phase.TRAVEL },
    triggeredEvent,
  };
}

export function rest(state: GameState): GameState {
  return {
    ...state,
    sanity: clamp(state.sanity + CFG.REST_SANITY_GAIN, 0, 100),
    fuel: clamp(state.fuel - CFG.REST_FUEL_COST, 0, 100),
  };
}

export type DeathReason = 'fuel' | 'sanity' | null;

export function checkDeath(state: GameState): DeathReason {
  if (state.fuel <= 0) return 'fuel';
  if (state.sanity <= 0) return 'sanity';
  return null;
}

export function checkWin(state: GameState): boolean {
  return state.stopIdx >= TRAIL_STOPS.length - 1;
}
```

**Step 5: Write hunting logic**

```typescript
// src/engine/hunting.ts
import { CFG } from '../data/constants';

export interface HuntTarget {
  x: number;
  y: number;
  r: number;
  alive: boolean;
  vx: number;
  vy: number;
  emoji: string;
}

export function spawnTargets(width: number, height: number): HuntTarget[] {
  return Array.from({ length: CFG.HUNT_TARGET_COUNT }, () => ({
    x: 40 + Math.random() * (width - 80),
    y: 40 + Math.random() * (height - 80),
    r: 18 + Math.random() * 12,
    alive: true,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    emoji: CFG.HUNT_TARGET_EMOJIS[Math.floor(Math.random() * CFG.HUNT_TARGET_EMOJIS.length)],
  }));
}

export function updateTargets(targets: HuntTarget[], width: number, height: number): HuntTarget[] {
  return targets.map((t) => {
    if (!t.alive) return t;
    let { x, y, vx, vy } = t;
    x += vx;
    y += vy;
    if (x < t.r || x > width - t.r) vx *= -1;
    if (y < t.r || y > height - t.r) vy *= -1;
    return { ...t, x, y, vx, vy };
  });
}

export function checkHit(targets: HuntTarget[], clickX: number, clickY: number): { targets: HuntTarget[]; hit: boolean } {
  let hit = false;
  const updated = targets.map((t) => {
    if (!t.alive || hit) return t;
    if (Math.hypot(t.x - clickX, t.y - clickY) <= t.r + 10) {
      hit = true;
      return { ...t, alive: false };
    }
    return t;
  });
  return { targets: updated, hit };
}

export function allTargetsDead(targets: HuntTarget[]): boolean {
  return targets.every((t) => !t.alive);
}
```

**Step 6: Write tests**

```typescript
// tests/engine/skillCheck.test.ts
import { describe, it, expect, vi } from 'vitest';
import { rollSkill } from '../../src/engine/skillCheck';
import type { SkillSet } from '../../src/types';

const mockSkills: SkillSet = {
  driving: 70, navigation: 60, smooth: 50,
  mechanical: 40, charisma: 65, survival: 35,
};

describe('rollSkill', () => {
  it('passes when random < skill/100', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3);
    expect(rollSkill(mockSkills, 'driving')).toBe(true); // 0.3 < 0.70
    vi.restoreAllMocks();
  });

  it('fails when random > skill/100', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    expect(rollSkill(mockSkills, 'survival')).toBe(false); // 0.9 > 0.35
    vi.restoreAllMocks();
  });
});
```

```typescript
// tests/engine/eventResolver.test.ts
import { describe, it, expect } from 'vitest';
import { applyEffects } from '../../src/engine/eventResolver';
import { Phase } from '../../src/types';
import type { GameState } from '../../src/types';

const baseState: GameState = {
  phase: Phase.TRAVEL, stopIdx: 0, fuel: 100, sanity: 100,
  cash: 350, supplies: 5, disguises: 2, laserAmmo: 10, meat: 0,
  skills: { driving: 50, navigation: 50, smooth: 50, mechanical: 50, charisma: 50, survival: 50 },
  log: [], players: {},
};

describe('applyEffects', () => {
  it('applies negative fuel effect and clamps to 0', () => {
    const result = applyEffects({ ...baseState, fuel: 10 }, { fuel: -20 });
    expect(result.fuel).toBe(0);
  });

  it('applies positive sanity effect and clamps to 100', () => {
    const result = applyEffects(baseState, { sanity: 20 });
    expect(result.sanity).toBe(100);
  });

  it('applies multiple effects at once', () => {
    const result = applyEffects(baseState, { fuel: -15, sanity: -10, cash: 200 });
    expect(result.fuel).toBe(85);
    expect(result.sanity).toBe(90);
    expect(result.cash).toBe(550);
  });
});
```

```typescript
// tests/engine/gameLoop.test.ts
import { describe, it, expect } from 'vitest';
import { createNewGame, rest, checkDeath, checkWin } from '../../src/engine/gameLoop';
import { Phase } from '../../src/types';

describe('createNewGame', () => {
  it('creates game with correct defaults', () => {
    const skills = { driving: 50, navigation: 50, smooth: 50, mechanical: 50, charisma: 50, survival: 50 };
    const game = createNewGame(skills, 'test-id', 'Duke');
    expect(game.phase).toBe(Phase.TRAVEL);
    expect(game.fuel).toBe(100);
    expect(game.sanity).toBe(100);
    expect(game.cash).toBe(350);
    expect(game.players['test-id']).toEqual({ name: 'Duke', alive: true });
  });
});

describe('rest', () => {
  it('increases sanity and decreases fuel', () => {
    const skills = { driving: 50, navigation: 50, smooth: 50, mechanical: 50, charisma: 50, survival: 50 };
    const game = createNewGame(skills, 'test-id', 'Duke');
    const rested = rest({ ...game, sanity: 50 });
    expect(rested.sanity).toBe(65); // +15
    expect(rested.fuel).toBe(95);   // -5
  });
});

describe('checkDeath', () => {
  it('returns fuel when fuel is 0', () => {
    const skills = { driving: 50, navigation: 50, smooth: 50, mechanical: 50, charisma: 50, survival: 50 };
    expect(checkDeath({ ...createNewGame(skills, 'id', 'Duke'), fuel: 0 })).toBe('fuel');
  });

  it('returns null when alive', () => {
    const skills = { driving: 50, navigation: 50, smooth: 50, mechanical: 50, charisma: 50, survival: 50 };
    expect(checkDeath(createNewGame(skills, 'id', 'Duke'))).toBeNull();
  });
});
```

**Step 7: Run tests**

```bash
npx vitest run
```

Expected: All tests pass.

**Step 8: Commit**

```bash
git add src/engine/ src/utils/ tests/
git commit -m "feat: add pure game engine with tests"
```

---

## Task 4: Build Zustand Stores

**Files:**
- Create: `src/stores/playerStore.ts`
- Create: `src/stores/gameStore.ts`
- Create: `src/stores/networkStore.ts`

**Step 1: Build player store**

```typescript
// src/stores/playerStore.ts
import { create } from 'zustand';
import type { PlayerData, Sex, Age, Region, SkillSet } from '../types';
import { Storage } from '../utils/storage';
import { generateSkills } from '../data/skills';
import { CFG } from '../data/constants';

interface PlayerStore {
  id: string;
  data: PlayerData | null;
  rerollsLeft: number;

  setPlayerData: (data: PlayerData) => void;
  createCharacter: (name: string, sex: Sex, age: Age, quirks: string[], region: Region) => void;
  rerollSkills: () => SkillSet | null;
  loadSavedPlayer: () => PlayerData | null;
  reset: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  id: Storage.getPlayerId(),
  data: null,
  rerollsLeft: CFG.REROLLS,

  setPlayerData: (data) => {
    set({ data });
    Storage.savePlayer(data);
  },

  createCharacter: (name, sex, age, quirks, region) => {
    const skills = generateSkills(region);
    const data: PlayerData = { name: name || 'The Duke', sex, age, quirks, skills, region };
    set({ data });
    Storage.savePlayer(data);
  },

  rerollSkills: () => {
    const { data, rerollsLeft } = get();
    if (!data || rerollsLeft <= 0) return null;
    const skills = generateSkills(data.region);
    const updated = { ...data, skills };
    set({ data: updated, rerollsLeft: rerollsLeft - 1 });
    Storage.savePlayer(updated);
    return skills;
  },

  loadSavedPlayer: () => {
    const data = Storage.loadPlayer();
    if (data) set({ data });
    return data;
  },

  reset: () => {
    set({ data: null, rerollsLeft: CFG.REROLLS });
  },
}));
```

**Step 2: Build game store**

The game store wraps the pure engine functions and handles side effects (persistence, logging).

```typescript
// src/stores/gameStore.ts
import { create } from 'zustand';
import type { GameState, GameEvent, ShopItem, LogEntry } from '../types';
import { Phase } from '../types';
import { createNewGame, travel, rest, checkDeath, checkWin, type DeathReason } from '../engine/gameLoop';
import { resolveEventChoice, applyEffects } from '../engine/eventResolver';
import { Storage } from '../utils/storage';
import { clamp } from '../utils/clamp';

interface GameStore {
  state: GameState | null;
  currentEvent: GameEvent | null;
  deathReason: DeathReason;

  startGame: (playerId: string, playerName: string, skills: import('../types').SkillSet) => void;
  resumeGame: (saved: GameState, playerId: string, playerName: string) => void;
  doTravel: () => GameEvent | null;
  doRest: () => void;
  doResolveEvent: (choiceId: string) => string;
  doBuyItem: (item: ShopItem) => boolean;
  addHuntReward: (meat: number) => void;
  addLog: (txt: string, bad?: boolean, good?: boolean) => void;
  finishGame: () => void;
  clearEvent: () => void;
  resetGame: () => void;
  syncFromNetwork: (remoteState: GameState) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  currentEvent: null,
  deathReason: null,

  startGame: (playerId, playerName, skills) => {
    const state = createNewGame(skills, playerId, playerName);
    set({ state, currentEvent: null, deathReason: null });
    Storage.saveGame(state);
  },

  resumeGame: (saved, playerId, playerName) => {
    const state = {
      ...saved,
      players: { ...saved.players, [playerId]: { name: playerName, alive: true } },
    };
    set({ state, currentEvent: null, deathReason: null });
    Storage.saveGame(state);
  },

  doTravel: () => {
    const { state } = get();
    if (!state) return null;
    const result = travel(state);
    const death = checkDeath(result.state);
    if (death) {
      const deadState = { ...result.state, phase: Phase.DEAD };
      set({ state: deadState, deathReason: death });
      Storage.saveGame(deadState);
      return null;
    }
    set({ state: result.state, currentEvent: result.triggeredEvent });
    Storage.saveGame(result.state);
    return result.triggeredEvent;
  },

  doRest: () => {
    const { state } = get();
    if (!state) return;
    const rested = rest(state);
    set({ state: rested });
    Storage.saveGame(rested);
  },

  doResolveEvent: (choiceId) => {
    const { state, currentEvent } = get();
    if (!state || !currentEvent) return 'Nothing happened.';
    const { newState, text } = resolveEventChoice(state, currentEvent, choiceId);
    const death = checkDeath(newState);
    if (death) {
      const deadState = { ...newState, phase: Phase.DEAD };
      set({ state: deadState, currentEvent: null, deathReason: death });
      Storage.saveGame(deadState);
      return text;
    }
    const travelState = { ...newState, phase: Phase.TRAVEL };
    set({ state: travelState, currentEvent: null });
    Storage.saveGame(travelState);
    return text;
  },

  doBuyItem: (item) => {
    const { state } = get();
    if (!state || state.cash < item.price) return false;
    let newState = { ...state, cash: state.cash - item.price };
    // Apply additive effects
    newState = applyEffects(newState, item.effects);
    // Apply set effects (e.g., fuel = 100)
    if (item.setEffects) {
      for (const [key, val] of Object.entries(item.setEffects)) {
        (newState as Record<string, unknown>)[key] = val;
      }
    }
    // Apply random side effects
    if (item.sideEffect && Math.random() < item.sideEffect.chance) {
      newState = applyEffects(newState, item.sideEffect.effects);
    }
    set({ state: newState });
    Storage.saveGame(newState);
    return true;
  },

  addHuntReward: (meat) => {
    const { state } = get();
    if (!state) return;
    const newState = {
      ...state,
      meat: state.meat + meat,
      supplies: state.supplies + Math.floor(meat / 2),
      phase: Phase.TRAVEL,
    };
    set({ state: newState });
    Storage.saveGame(newState);
  },

  addLog: (txt, bad = false, good = false) => {
    const { state } = get();
    if (!state) return;
    const log = [...state.log, { txt, bad, good }];
    if (log.length > 50) log.shift();
    const newState = { ...state, log };
    set({ state: newState });
    Storage.saveGame(newState);
  },

  finishGame: () => {
    const { state } = get();
    if (!state) return;
    const winState = { ...state, phase: Phase.WIN };
    set({ state: winState });
    Storage.saveGame(winState);
  },

  clearEvent: () => set({ currentEvent: null }),

  resetGame: () => {
    set({ state: null, currentEvent: null, deathReason: null });
    Storage.clearGame();
  },

  syncFromNetwork: (remoteState) => {
    set({ state: remoteState });
    Storage.saveGame(remoteState);
  },
}));
```

**Step 3: Build network store** (stub — full PeerJS integration in Task 6)

```typescript
// src/stores/networkStore.ts
import { create } from 'zustand';
import type { PlayerData } from '../types';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface NetworkStore {
  roomId: string | null;
  isHost: boolean;
  status: ConnectionStatus;
  peers: Record<string, { name: string; player: PlayerData }>;
  localStream: MediaStream | null;
  micMuted: boolean;
  camOn: boolean;
  chatMessages: Array<{ sender: string; senderName: string; text: string; system?: boolean }>;
  chatBadge: number;
  chatOpen: boolean;

  setRoomId: (id: string) => void;
  setHost: (isHost: boolean) => void;
  setStatus: (status: ConnectionStatus) => void;
  addPeer: (pid: string, name: string, player: PlayerData) => void;
  removePeer: (pid: string) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  toggleMic: () => void;
  toggleCam: () => void;
  addChatMessage: (sender: string, senderName: string, text: string, system?: boolean) => void;
  toggleChat: () => void;
  clearBadge: () => void;
  reset: () => void;
}

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  roomId: null,
  isHost: false,
  status: 'disconnected',
  peers: {},
  localStream: null,
  micMuted: true,
  camOn: false,
  chatMessages: [],
  chatBadge: 0,
  chatOpen: false,

  setRoomId: (id) => set({ roomId: id }),
  setHost: (isHost) => set({ isHost }),
  setStatus: (status) => set({ status }),
  addPeer: (pid, name, player) =>
    set((s) => ({ peers: { ...s.peers, [pid]: { name, player } } })),
  removePeer: (pid) =>
    set((s) => {
      const { [pid]: _, ...rest } = s.peers;
      return { peers: rest };
    }),
  setLocalStream: (stream) => set({ localStream: stream }),
  toggleMic: () => set((s) => ({ micMuted: !s.micMuted })),
  toggleCam: () => set((s) => ({ camOn: !s.camOn })),
  addChatMessage: (sender, senderName, text, system = false) =>
    set((s) => ({
      chatMessages: [...s.chatMessages, { sender, senderName, text, system }],
      chatBadge: s.chatOpen ? s.chatBadge : s.chatBadge + 1,
    })),
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen, chatBadge: s.chatOpen ? s.chatBadge : 0 })),
  clearBadge: () => set({ chatBadge: 0 }),
  reset: () =>
    set({
      roomId: null, isHost: false, status: 'disconnected',
      peers: {}, localStream: null, micMuted: true, camOn: false,
      chatMessages: [], chatBadge: 0, chatOpen: false,
    }),
}));
```

**Step 4: Run type check and tests**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: All pass.

**Step 5: Commit**

```bash
git add src/stores/
git commit -m "feat: add Zustand stores for player, game, and network state"
```

---

## Task 5: Build UI Components & Screens

**Files:**
- Create: `src/styles/globals.css` — Tailwind v4 + custom theme (port from original CSS)
- Create: `src/components/shared/Avatar.tsx` — SVG avatar generator
- Create: `src/components/shared/Button.tsx` — Styled buttons
- Create: `src/components/shared/Toast.tsx` — Toast notifications
- Create: `src/components/screens/CharCreate.tsx`
- Create: `src/components/screens/LocationSelect.tsx`
- Create: `src/components/screens/SkillReview.tsx`
- Create: `src/components/screens/Lobby.tsx`
- Create: `src/components/screens/Shop.tsx`
- Create: `src/components/screens/GameMap.tsx`
- Create: `src/components/screens/HuntGame.tsx`
- Create: `src/components/screens/DeathScreen.tsx`
- Create: `src/components/screens/WinScreen.tsx`
- Create: `src/components/game/StatsBar.tsx`
- Create: `src/components/game/TrailMap.tsx`
- Create: `src/components/game/EventModal.tsx`
- Create: `src/components/game/GameLog.tsx`
- Create: `src/components/social/VideoOverlay.tsx`
- Create: `src/components/social/ChatPanel.tsx`
- Create: `src/components/social/PlayerList.tsx`
- Modify: `src/App.tsx` — Screen router

This is the largest task. Key implementation notes:

**Step 1: Set up Tailwind globals.css**

Port the CSS custom properties from `index.html:13-17` into Tailwind v4's `@theme` block. Keep the monospace Courier New font, dark color palette (`--bg:#0a0a0a`, `--orange:#ff6600`, etc.), and responsive breakpoints.

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0a;
  --color-surface: #111111;
  --color-surface2: #1a1a1a;
  --color-border: #222222;
  --color-orange: #ff6600;
  --color-green: #00ff88;
  --color-red: #ff3333;
  --color-blue: #00aaff;
  --color-yellow: #ffcc00;
  --color-purple: #cc44ff;
  --color-dim: #666666;
  --color-text: #e0e0e0;
  --font-mono: 'Courier New', monospace;
}

* { -webkit-tap-highlight-color: transparent; }
html, body, #root { height: 100%; overflow: hidden; background: var(--color-bg); color: var(--color-text); font-family: var(--font-mono); font-size: 14px; }
```

**Step 2: Build Avatar component**

Port the SVG generation logic from `index.html:629-748` into a React component that takes `PlayerData` as a prop and returns an SVG element. Use `useRef` and imperative SVG construction, or convert to JSX SVG elements.

**Step 3: Build screen components one by one**

Each screen component reads from the relevant Zustand store using hooks:
```typescript
const { data, createCharacter } = usePlayerStore();
const { state, doTravel } = useGameStore();
```

Port the HTML structure from `index.html:206-351` into JSX, converting:
- `class=` → `className=`
- Inline styles → Tailwind classes where possible
- `$('element-id')` lookups → React state/refs
- `addEventListener('click', ...)` → `onClick={...}`
- `el('div', {class:'...'})` → `<div className="...">`

**Step 4: Build App.tsx screen router**

```typescript
// src/App.tsx
import { useState, useEffect } from 'react';
import { usePlayerStore } from './stores/playerStore';
import { useGameStore } from './stores/gameStore';
import { Phase } from './types';
// ... import screens

type Screen = 'loading' | 'char' | 'location' | 'skills' | 'lobby' | 'shop' | 'map' | 'hunt' | 'dead' | 'win';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const playerData = usePlayerStore((s) => s.data);
  const gameState = useGameStore((s) => s.state);

  useEffect(() => {
    // Init: check for saved state
    const saved = usePlayerStore.getState().loadSavedPlayer();
    if (saved?.skills) {
      setScreen('lobby');
    } else {
      setScreen('char');
    }
  }, []);

  // Route based on game phase
  useEffect(() => {
    if (gameState?.phase === Phase.DEAD) setScreen('dead');
    if (gameState?.phase === Phase.WIN) setScreen('win');
  }, [gameState?.phase]);

  return (
    <>
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'char' && <CharCreate onComplete={() => setScreen('location')} />}
      {screen === 'location' && <LocationSelect onComplete={() => setScreen('skills')} />}
      {screen === 'skills' && <SkillReview onComplete={() => setScreen('lobby')} />}
      {screen === 'lobby' && <Lobby onStartGame={() => setScreen('shop')} />}
      {screen === 'shop' && <Shop onLeave={() => setScreen('map')} />}
      {screen === 'map' && <GameMap onHunt={() => setScreen('hunt')} onShop={() => setScreen('shop')} />}
      {screen === 'hunt' && <HuntGame onEnd={() => setScreen('map')} />}
      {screen === 'dead' && <DeathScreen onRestart={() => { useGameStore.getState().resetGame(); setScreen('char'); }} />}
      {screen === 'win' && <WinScreen onRestart={() => { useGameStore.getState().resetGame(); setScreen('char'); }} />}
      {/* Overlays — always visible after lobby */}
      {['lobby','shop','map','hunt'].includes(screen) && <ChatPanel />}
      {['lobby','shop','map','hunt'].includes(screen) && <VideoOverlay />}
    </>
  );
}
```

**Step 5: Build all game UI components** (StatsBar, TrailMap, EventModal, GameLog)

Port canvas rendering from `index.html:754-802` (map) and `index.html:1032-1127` (hunt) into React components using `useRef<HTMLCanvasElement>` and `useEffect` for rendering.

**Step 6: Verify all screens render**

```bash
npm run dev
```

Navigate through all screens manually: char create → location → skills → lobby → shop → game → hunt → death → win.

**Step 7: Commit**

```bash
git add src/components/ src/styles/ src/App.tsx
git commit -m "feat: add all UI screens and components"
```

---

## Task 6: Implement PeerJS Networking Layer

**Files:**
- Create: `src/network/peerManager.ts`
- Create: `src/network/messageProtocol.ts`
- Create: `src/network/mediaManager.ts`

**Step 1: Build message protocol**

Define typed message parsing/validation from `index.html:1133-1400`.

```typescript
// src/network/messageProtocol.ts
import type { MessageType } from '../types';

export function parseMessage(data: unknown): MessageType | null {
  if (!data || typeof data !== 'object' || !('type' in data)) return null;
  const msg = data as Record<string, unknown>;
  switch (msg.type) {
    case 'HELLO':
    case 'WELCOME':
    case 'PLAYER_JOINED':
    case 'PLAYER_LEFT':
    case 'MEET':
    case 'GAME_STATE':
    case 'CHAT':
    case 'CHAT_SYS':
      return data as MessageType;
    default:
      return null;
  }
}
```

**Step 2: Build PeerManager class**

Port the PeerJS logic from `index.html:1133-1400`. This is the most complex module — it handles:
- Room code generation from URL hash (`index.html:1139-1145`)
- Host election via PeerJS ID claiming (`index.html:1148-1168`)
- Peer-to-peer mesh connections (`index.html:1184-1198`)
- Message broadcasting (`index.html:1199-1400`)
- Mid-game join support

The PeerManager should interact with stores via direct store access (Zustand supports this outside React):
```typescript
import { useNetworkStore } from '../stores/networkStore';
import { useGameStore } from '../stores/gameStore';

// Inside PeerManager:
useNetworkStore.getState().setStatus('connected');
useGameStore.getState().syncFromNetwork(remoteState);
```

**Step 3: Build MediaManager**

Port camera/mic logic from `index.html:1400-1470`. Handle `getUserMedia` with proper error handling (fixes the critical unhandled promise bug).

**Step 4: Integrate into Lobby and Chat components**

Wire PeerManager into the Lobby component's `useEffect` — initialize on mount, clean up on unmount.

**Step 5: Test multiplayer locally**

Open two browser tabs with the same room code hash. Verify:
- Host/guest connection works
- Player list updates
- Game state syncs
- Chat messages broadcast

**Step 6: Commit**

```bash
git add src/network/
git commit -m "feat: add typed PeerJS networking layer"
```

---

## Task 7: Generate PWA Assets & Service Worker

**Files:**
- Create: `public/icon-192.png` — Generate a simple game icon
- Create: `public/icon-512.png` — Large PWA icon
- Modify: `public/manifest.json` — Update paths for Vite
- Modify: `public/sw.js` — Update cache strategy for Vite build output

**Step 1: Generate PWA icons**

Use canvas or an SVG-to-PNG approach to generate the missing icons. A simple orange-on-black bat emoji or "F&L" text icon works.

**Step 2: Update manifest.json**

```json
{
  "name": "Fear & Loathing Trail",
  "short_name": "F&L Trail",
  "description": "A Fear and Loathing themed Oregon Trail multiplayer trip. We can't stop here — this is bat country.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#ff6600",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Step 3: Update service worker for Vite**

```javascript
// public/sw.js
const CACHE = 'flt-v4-cache-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  // Let PeerJS requests go through
  if (e.request.url.includes('peerjs.com') || e.request.url.includes('unpkg.com')) return;
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
```

**Step 4: Register service worker in main.tsx**

Add to `src/main.tsx`:
```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(console.warn);
}
```

**Step 5: Commit**

```bash
git add public/ src/main.tsx
git commit -m "feat: add PWA assets, icons, and service worker"
```

---

## Task 8: Write README.md and CLAUDE.md

**Files:**
- Create: `README.md`
- Create: `CLAUDE.md`

**Step 1: Write comprehensive README**

```markdown
# Fear & Loathing Trail

A Fear and Loathing in Las Vegas themed Oregon Trail game. Multiplayer, peer-to-peer, no server required.

> "We can't stop here — this is bat country."

## Play

**Live:** [fear-loathing-trail.vercel.app](https://fear-loathing-trail.vercel.app) (or wherever deployed)

**Local:**
\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- Drive from Las Vegas to Anchorage across 12 stops
- Random encounters: bats, police, storms, Samoan attorneys
- Resource management: fuel, sanity, cash, supplies
- Drug shop & supply store
- Hunting minigame (laser gun + desert creatures)
- Peer-to-peer multiplayer (WebRTC via PeerJS)
- Optional video/audio chat
- Character creation with quirks & SVG avatars
- Region-based skill system
- Progressive Web App (installable, offline-capable)

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

\`\`\`
src/
├── data/          # Game data (events, stops, shops, skills, quirks)
├── engine/        # Pure game logic (no DOM, no side effects)
├── stores/        # Zustand state management (player, game, network)
├── network/       # PeerJS wrapper & WebRTC media
├── components/
│   ├── screens/   # Full-page screens (char create, lobby, game, etc.)
│   ├── game/      # Game UI (stats bar, trail map, event modal)
│   ├── social/    # Multiplayer UI (chat, video, player list)
│   └── shared/    # Reusable components (avatar, buttons)
└── utils/         # Helpers (geo, storage, clamp)
\`\`\`

**Key design principles:**
- Game logic lives in `engine/` — pure functions, fully testable
- Events are declarative data (no callback functions) — easy to add new events
- State is managed by 3 Zustand stores (player, game, network) — no god objects
- Components only render — they don't contain business logic

## How to Add a New Event

Add an entry to `src/data/events.ts`:

\`\`\`typescript
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
\`\`\`

That's it. The event resolver handles the rest.

## Multiplayer

1. Open the game — a room code is generated automatically
2. Share the URL (includes room code in hash) with friends
3. They open the link and join your room
4. First player to open becomes the host
5. Players can join mid-game

No server required — connections are peer-to-peer via WebRTC.

## Deploy

### Vercel (recommended)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → select repo
3. Vercel auto-detects Vite — click Deploy
4. Every `git push` auto-deploys

### Any Static Host

\`\`\`bash
npm run build
# Upload contents of dist/ to any static host
\`\`\`

## Development

\`\`\`bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm test           # Run tests
npx biome check .  # Lint & format
\`\`\`

## License

MIT
```

**Step 2: Write CLAUDE.md**

```markdown
# CLAUDE.md — Fear & Loathing Trail

## Project Overview

Oregon Trail clone themed on Fear and Loathing in Las Vegas. P2P multiplayer game, React + TypeScript, Vite build, Zustand state, PeerJS networking.

## Tech Stack

- **React 19** + **TypeScript** — component-based UI
- **Vite** — build tool
- **Zustand** — state management (3 stores: player, game, network)
- **Tailwind CSS v4** — styling (CSS-first config in globals.css)
- **PeerJS 1.5.2** — WebRTC peer-to-peer multiplayer
- **Vitest** — testing
- **Biome** — linting/formatting

## Architecture Rules

1. **Game logic in `src/engine/`** — pure functions only, no DOM, no side effects
2. **Game data in `src/data/`** — declarative data, no callback functions in event definitions
3. **State in `src/stores/`** — all mutations go through Zustand store actions
4. **Components render only** — read from stores, call store actions, no direct state mutation
5. **Network messages are typed** — all PeerJS messages validated via `messageProtocol.ts`

## Key Patterns

### Adding Events
Add to `src/data/events.ts`. Events are pure data with `effects` objects. The `eventResolver` applies effects uniformly.

### State Clamping
All numeric state clamping happens in `src/engine/eventResolver.ts:applyEffects()`. Fuel and sanity are always 0-100. Don't clamp manually elsewhere.

### Skill Checks
Use `rollSkill()` from `src/engine/skillCheck.ts`. Don't write inline `Math.random() < skill/100` checks.

## Testing

```bash
npm test               # Run all tests
npx vitest run         # Run once (CI mode)
```

Tests live in `tests/` mirroring `src/` structure. Engine logic has the most coverage.

## Common Commands

```bash
npm run dev            # Start dev server (port 5173)
npm run build          # Production build → dist/
npx biome check .      # Lint + format check
npx biome check --fix .# Auto-fix lint issues
```

## Deploy

Vercel auto-deploys from GitHub. Production build is `npm run build` → static files in `dist/`.

## File Conventions

- Components: PascalCase (`GameMap.tsx`)
- Utilities/stores: camelCase (`gameStore.ts`)
- Data files: camelCase (`trailStops.ts`)
- Types: `src/types/index.ts` — all shared types in one file
- Tests: `tests/` directory mirrors `src/` structure
```

**Step 3: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: add comprehensive README and CLAUDE.md"
```

---

## Task 9: Final Integration, Build & Deploy Verification

**Files:**
- Modify: `package.json` — verify scripts
- Modify: `index.html` (Vite entry) — add meta tags from original

**Step 1: Verify all tests pass**

```bash
npx vitest run
```

Expected: All tests pass.

**Step 2: Verify build succeeds**

```bash
npm run build
```

Expected: Clean build in `dist/`.

**Step 3: Preview production build**

```bash
npm run preview
```

Test all screens, multiplayer, hunt minigame.

**Step 4: Verify linting**

```bash
npx biome check .
```

Fix any issues.

**Step 5: Rename original to reference**

```bash
mv index.html index.original.html
```

Add to `.gitignore` if desired, or keep for reference.

**Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete modern rewrite of Fear & Loathing Trail"
```

**Step 7: Push to GitHub**

```bash
git push origin master
```

---

## Task Summary

| # | Task | Estimated Files |
|---|------|----------------|
| 1 | Scaffold Vite + React + TS | 8 config files |
| 2 | Port game data & types | 7 data/type files |
| 3 | Build game engine | 4 engine + 3 util + 3 test files |
| 4 | Build Zustand stores | 3 store files |
| 5 | Build all UI components | ~20 component files + CSS |
| 6 | PeerJS networking layer | 3 network files |
| 7 | PWA assets & service worker | 4 files |
| 8 | README + CLAUDE.md | 2 docs |
| 9 | Integration & deploy verification | Final checks |

**Total: ~50 files, 9 tasks**

## Execution Approach

Tasks 1-4 are foundational and sequential. Task 5 (UI) is the largest and can be parallelized by screen. Task 6 (networking) depends on stores (Task 4). Tasks 7-9 are finalization.
