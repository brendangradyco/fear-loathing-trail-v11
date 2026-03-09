import { useCallback } from "react";
import { SKILL_LABELS } from "../../data/constants";
import { usePlayerStore } from "../../stores/playerStore";
import type { SkillSet } from "../../types";

interface SkillReviewProps {
	onComplete: () => void;
}

const SKILL_KEYS: (keyof SkillSet)[] = [
	"driving",
	"navigation",
	"smooth",
	"mechanical",
	"charisma",
	"survival",
];

export default function SkillReview({ onComplete }: SkillReviewProps) {
	const data = usePlayerStore((s) => s.data);
	const rerollsLeft = usePlayerStore((s) => s.rerollsLeft);
	const rerollSkills = usePlayerStore((s) => s.rerollSkills);

	const handleReroll = useCallback(() => {
		rerollSkills();
	}, [rerollSkills]);

	if (!data) return null;

	return (
		<div className="fixed inset-0 flex flex-col bg-bg">
			{/* Header */}
			<div className="flex shrink-0 items-center gap-2.5 border-b border-border bg-surface px-3.5 py-2.5">
				<span className="flex-1 text-[15px] font-bold text-orange">{"🔫"} YOUR SKILLS</span>
				<span className="text-[12px] text-dim">{rerollsLeft} rerolls left</span>
			</div>

			{/* Skill list */}
			<div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3.5">
				<div className="flex flex-col gap-2">
					{SKILL_KEYS.map((key) => (
						<div key={key} className="flex items-center gap-2.5 rounded-lg bg-surface2 px-3 py-2.5">
							<div className="flex-1 text-[13px] font-bold text-orange">
								{SKILL_LABELS[key] ?? key}
							</div>
							<div className="flex-[2] h-2 overflow-hidden rounded bg-border">
								<div
									className="h-full rounded bg-gradient-to-r from-orange to-yellow transition-[width] duration-400"
									style={{ width: `${data.skills[key]}%` }}
								/>
							</div>
							<div className="min-w-8 text-right text-base font-bold text-yellow">
								{data.skills[key]}
							</div>
						</div>
					))}
				</div>

				<div className="py-1 text-center text-[12px] text-dim">
					{rerollsLeft > 0 ? `${rerollsLeft} rerolls remaining` : "No rerolls remaining"}
				</div>

				<button
					type="button"
					onClick={handleReroll}
					disabled={rerollsLeft <= 0}
					className="w-full rounded-lg border border-border bg-surface2 p-3.5 text-base font-bold text-dim disabled:opacity-40"
				>
					{"🎲"} Reroll Skills
				</button>

				<button
					type="button"
					onClick={onComplete}
					className="w-full rounded-lg bg-orange p-3.5 text-base font-bold tracking-wide text-black active:opacity-75"
				>
					ACCEPT &amp; RIDE {"💨"}
				</button>

				<div className="h-20" />
			</div>
		</div>
	);
}
