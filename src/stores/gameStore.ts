import { create } from "zustand";
import type { GameEvent, GameState, LogEntry, ShopItem, SkillSet } from "../types";
import { Phase } from "../types";
import { createNewGame, travel, rest, checkDeath, checkWin } from "../engine/gameLoop";
import { applyEffects, resolveEventChoice } from "../engine/eventResolver";
import { saveGame, loadGame, clearGame } from "../utils/storage";

interface GameStore {
	state: GameState | null;
	currentEvent: GameEvent | null;
	deathReason: "fuel" | "sanity" | null;

	startGame: (playerId: string, playerName: string, skills: SkillSet) => void;
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

function capLog(log: LogEntry[]): LogEntry[] {
	return log.length > 50 ? log.slice(-50) : log;
}

export const useGameStore = create<GameStore>((set, get) => ({
	state: null,
	currentEvent: null,
	deathReason: null,

	startGame: (playerId, playerName, skills) => {
		const state = createNewGame(skills, playerId, playerName);
		set({ state, currentEvent: null, deathReason: null });
		saveGame(state);
	},

	resumeGame: (saved, playerId, playerName) => {
		const state = {
			...saved,
			players: {
				...saved.players,
				[playerId]: { name: playerName, alive: true },
			},
		};
		set({ state, currentEvent: null, deathReason: null });
		saveGame(state);
	},

	doTravel: () => {
		const { state: current } = get();
		if (!current) return null;

		if (checkWin(current)) {
			const won = { ...current, phase: Phase.WIN };
			set({ state: won });
			saveGame(won);
			return null;
		}

		const { state: next, triggeredEvent } = travel(current);

		const death = checkDeath(next);
		if (death) {
			const dead = { ...next, phase: Phase.DEAD };
			set({ state: dead, deathReason: death });
			saveGame(dead);
			return null;
		}

		set({ state: next, currentEvent: triggeredEvent });
		saveGame(next);
		return triggeredEvent;
	},

	doRest: () => {
		const { state: current } = get();
		if (!current) return;

		const next = rest(current);
		set({ state: next });
		saveGame(next);
	},

	doResolveEvent: (choiceId) => {
		const { state: current, currentEvent } = get();
		if (!current || !currentEvent) return "Nothing happened.";

		const { newState, text } = resolveEventChoice(current, currentEvent, choiceId);
		const withPhase = { ...newState, phase: Phase.TRAVEL };

		const death = checkDeath(withPhase);
		if (death) {
			const dead = { ...withPhase, phase: Phase.DEAD };
			set({ state: dead, currentEvent: null, deathReason: death });
			saveGame(dead);
			return text;
		}

		set({ state: withPhase, currentEvent: null });
		saveGame(withPhase);
		return text;
	},

	doBuyItem: (item) => {
		const { state: current } = get();
		if (!current || current.cash < item.price) return false;

		// Deduct cost
		let next: GameState = { ...current, cash: current.cash - item.price };

		// Apply additive effects
		next = applyEffects(next, item.effects);

		// Apply absolute/set effects (e.g., fuel: 100)
		if (item.setEffects) {
			for (const [key, val] of Object.entries(item.setEffects)) {
				if (val !== undefined && key in next) {
					(next as Record<string, unknown>)[key] = val;
				}
			}
		}

		// Handle side effects (e.g., adrenochrome bad trip)
		if (item.sideEffect && Math.random() < item.sideEffect.chance) {
			next = applyEffects(next, item.sideEffect.effects);
		}

		set({ state: next });
		saveGame(next);
		return true;
	},

	addHuntReward: (meat) => {
		const { state: current } = get();
		if (!current) return;

		const next: GameState = {
			...current,
			meat: current.meat + meat,
			supplies: current.supplies + Math.floor(meat / 2),
			phase: Phase.TRAVEL,
		};
		set({ state: next });
		saveGame(next);
	},

	addLog: (txt, bad = false, good = false) => {
		const { state: current } = get();
		if (!current) return;

		const entry: LogEntry = { txt, bad, good };
		const next: GameState = {
			...current,
			log: capLog([...current.log, entry]),
		};
		set({ state: next });
	},

	finishGame: () => {
		const { state: current } = get();
		if (!current) return;

		const next = { ...current, phase: Phase.WIN };
		set({ state: next });
		saveGame(next);
	},

	clearEvent: () => {
		set({ currentEvent: null });
	},

	resetGame: () => {
		set({ state: null, currentEvent: null, deathReason: null });
		clearGame();
	},

	syncFromNetwork: (remoteState) => {
		set({ state: remoteState });
		saveGame(remoteState);
	},
}));

// Export loadGame for use by components that need to check for saved games
export { loadGame };
