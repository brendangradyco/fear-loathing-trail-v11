import { CFG } from "../data/constants";
import type { GameState, PlayerData } from "../types";

export function savePlayer(player: PlayerData): void {
	localStorage.setItem(CFG.STORE_KEY, JSON.stringify(player));
}

export function loadPlayer(): PlayerData | null {
	try {
		const raw = localStorage.getItem(CFG.STORE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as PlayerData;
	} catch {
		return null;
	}
}

export function saveGame(game: GameState): void {
	localStorage.setItem(CFG.GAME_KEY, JSON.stringify(game));
}

export function loadGame(): GameState | null {
	try {
		const raw = localStorage.getItem(CFG.GAME_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as GameState;
	} catch {
		return null;
	}
}

export function clearGame(): void {
	localStorage.removeItem(CFG.GAME_KEY);
}

export function getPlayerId(): string {
	let id = localStorage.getItem(CFG.PID_KEY);
	if (!id) {
		id = Math.random().toString(36).slice(2) + Date.now().toString(36);
		localStorage.setItem(CFG.PID_KEY, id);
	}
	return id;
}
