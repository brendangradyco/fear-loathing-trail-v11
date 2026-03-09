import { create } from "zustand";
import type { Age, PlayerData, Region, Sex, SkillSet } from "../types";
import { getPlayerId, savePlayer, loadPlayer } from "../utils/storage";
import { generateSkills } from "../data/skills";
import { CFG } from "../data/constants";

interface PlayerStore {
	id: string;
	data: PlayerData | null;
	rerollsLeft: number;

	setPlayerData: (data: PlayerData) => void;
	createCharacter: (
		name: string,
		sex: Sex,
		age: Age,
		quirks: string[],
		region: Region,
	) => void;
	rerollSkills: () => SkillSet | null;
	loadSavedPlayer: () => PlayerData | null;
	reset: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	id: getPlayerId(),
	data: null,
	rerollsLeft: CFG.REROLLS,

	setPlayerData: (data) => {
		set({ data });
		savePlayer(data);
	},

	createCharacter: (name, sex, age, quirks, region) => {
		const skills = generateSkills(region);
		const data: PlayerData = {
			name: name || "The Duke",
			sex,
			age,
			quirks,
			skills,
			region,
		};
		set({ data });
		savePlayer(data);
	},

	rerollSkills: () => {
		const { data, rerollsLeft } = get();
		if (!data || rerollsLeft <= 0) return null;
		const skills = generateSkills(data.region);
		const updated = { ...data, skills };
		set({ data: updated, rerollsLeft: rerollsLeft - 1 });
		savePlayer(updated);
		return skills;
	},

	loadSavedPlayer: () => {
		const data = loadPlayer();
		if (data) set({ data });
		return data;
	},

	reset: () => {
		set({ data: null, rerollsLeft: CFG.REROLLS });
	},
}));
