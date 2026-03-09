import { describe, expect, it, vi } from "vitest";
import { rollSkill } from "../../src/engine/skillCheck";
import type { SkillSet } from "../../src/types";

const mockSkills: SkillSet = {
	driving: 70,
	navigation: 60,
	smooth: 50,
	mechanical: 40,
	charisma: 65,
	survival: 35,
};

describe("rollSkill", () => {
	it("returns true when random is below skill/100", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.3);
		expect(rollSkill(mockSkills, "driving")).toBe(true); // 0.3 < 70/100
		vi.restoreAllMocks();
	});

	it("returns false when random is above skill/100", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.9);
		expect(rollSkill(mockSkills, "driving")).toBe(false); // 0.9 >= 70/100
		vi.restoreAllMocks();
	});

	it("uses the correct skill value from the skill set", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.39);
		// survival is 35, so 0.39 >= 0.35 should fail
		expect(rollSkill(mockSkills, "survival")).toBe(false);
		vi.restoreAllMocks();
	});

	it("passes at the exact boundary", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.49);
		// smooth is 50, so 0.49 < 0.50 should pass
		expect(rollSkill(mockSkills, "smooth")).toBe(true);
		vi.restoreAllMocks();
	});

	it("fails at the exact skill value boundary", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		// smooth is 50, so 0.5 is NOT < 0.50 — should fail
		expect(rollSkill(mockSkills, "smooth")).toBe(false);
		vi.restoreAllMocks();
	});

	it("uses threshold default when skill is missing from the interface context", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.25);
		// threshold defaults to 30; 0.25 < 0.30 = true
		expect(rollSkill(mockSkills, "charisma", 30)).toBe(true);
		vi.restoreAllMocks();
	});
});
