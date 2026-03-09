import { clamp } from "../utils/clamp";
import { rollSkill } from "./skillCheck";
import type { EventEffect, GameEvent, GameState } from "../types";

export function applyEffects(state: GameState, effects: EventEffect): GameState {
	const next = { ...state };
	if (effects.fuel !== undefined) next.fuel = clamp(next.fuel + effects.fuel, 0, 100);
	if (effects.sanity !== undefined) next.sanity = clamp(next.sanity + effects.sanity, 0, 100);
	if (effects.cash !== undefined) next.cash = Math.max(0, next.cash + effects.cash);
	if (effects.supplies !== undefined) next.supplies = Math.max(0, next.supplies + effects.supplies);
	if (effects.disguises !== undefined)
		next.disguises = Math.max(0, next.disguises + effects.disguises);
	if (effects.laserAmmo !== undefined)
		next.laserAmmo = Math.max(0, next.laserAmmo + effects.laserAmmo);
	if (effects.meat !== undefined) next.meat = Math.max(0, next.meat + effects.meat);
	return next;
}

export function resolveEventChoice(
	state: GameState,
	event: GameEvent,
	choiceId: string,
): { newState: GameState; text: string } {
	const choice = event.choices.find((c) => c.id === choiceId);
	if (!choice) {
		return { newState: state, text: "Nothing happened." };
	}

	// Apply base effects
	let newState = applyEffects(state, choice.effects);

	// Handle conditional check (e.g., disguise check)
	if (choice.conditionalCheck) {
		const check = choice.conditionalCheck;
		const resourceValue = newState[check.resource];
		if (resourceValue >= check.minRequired) {
			// Consume the resource
			newState = applyEffects(newState, { [check.resource]: -check.consumeAmount });
			return { newState, text: check.passText };
		}
		// Failed — apply fail effects
		newState = applyEffects(newState, check.failEffects);
		return { newState, text: check.failText };
	}

	// Handle skill check
	if (choice.skillCheck) {
		const sc = choice.skillCheck;
		const passed = rollSkill(newState.skills, sc.skill, sc.threshold);
		if (passed) {
			if (sc.passEffects) {
				newState = applyEffects(newState, sc.passEffects);
			}
			return { newState, text: sc.passText };
		}
		if (sc.failEffects) {
			newState = applyEffects(newState, sc.failEffects);
		}
		return { newState, text: sc.failText };
	}

	// No check — just return flavor text
	return { newState, text: choice.flavor };
}
