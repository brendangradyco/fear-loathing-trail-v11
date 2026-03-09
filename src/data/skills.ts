import type { Region, SkillSet } from "../types";

export const SKILLS_BY_REGION: Record<string, SkillSet> = {
	southwest: { driving: 70, navigation: 60, smooth: 50, mechanical: 40, charisma: 65, survival: 35 },
	northwest: { driving: 55, navigation: 70, smooth: 45, mechanical: 60, charisma: 40, survival: 65 },
	mountain: { driving: 60, navigation: 65, smooth: 40, mechanical: 55, charisma: 45, survival: 70 },
	plains: { driving: 65, navigation: 55, smooth: 60, mechanical: 50, charisma: 55, survival: 50 },
	default: { driving: 55, navigation: 55, smooth: 50, mechanical: 50, charisma: 50, survival: 50 },
};

export function generateSkills(region: Region | string): SkillSet {
	const base = SKILLS_BY_REGION[region] ?? SKILLS_BY_REGION.default;
	const out: Record<string, number> = {};
	for (const [k, v] of Object.entries(base)) {
		out[k] = Math.max(10, Math.min(95, v + Math.floor(Math.random() * 30 - 15)));
	}
	return out as unknown as SkillSet;
}
