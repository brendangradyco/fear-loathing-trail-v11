import type { SkillName, SkillSet } from "../types";

export function rollSkill(skills: SkillSet, skill: SkillName, threshold = 30): boolean {
	const value = skills[skill] ?? threshold;
	return Math.random() < value / 100;
}
