import { CFG } from "../data/constants";
import { EVENTS } from "../data/events";
import { TRAIL_STOPS } from "../data/trailStops";
import { Phase } from "../types";
import type { GameEvent, GameState, SkillSet } from "../types";
import { clamp } from "../utils/clamp";

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

export function travel(state: GameState): { state: GameState; triggeredEvent: GameEvent | null } {
	if (state.stopIdx >= TRAIL_STOPS.length - 1) {
		return { state, triggeredEvent: null };
	}

	const fuelCost = CFG.TRAVEL_FUEL_BASE + Math.floor(Math.random() * CFG.TRAVEL_FUEL_VARIANCE);
	const next: GameState = {
		...state,
		stopIdx: state.stopIdx + 1,
		fuel: clamp(state.fuel - fuelCost, 0, 100),
		supplies: Math.max(0, state.supplies - 1),
	};

	// Random event chance
	if (Math.random() < CFG.EVENT_CHANCE) {
		const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
		if (ev) {
			next.phase = Phase.EVENT;
			return { state: next, triggeredEvent: ev };
		}
	}

	next.phase = Phase.TRAVEL;
	return { state: next, triggeredEvent: null };
}

export function rest(state: GameState): GameState {
	return {
		...state,
		sanity: clamp(state.sanity + CFG.REST_SANITY_GAIN, 0, 100),
		fuel: Math.max(0, state.fuel - CFG.REST_FUEL_COST),
	};
}

export function checkDeath(state: GameState): "fuel" | "sanity" | null {
	if (state.fuel <= 0) return "fuel";
	if (state.sanity <= 0) return "sanity";
	return null;
}

export function checkWin(state: GameState): boolean {
	return state.stopIdx >= TRAIL_STOPS.length - 1;
}
