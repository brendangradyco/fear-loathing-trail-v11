import { useCallback } from "react";
import { useGameStore } from "../../stores/gameStore";
import type { GameEvent } from "../../types";
import { toast } from "../shared/Toast";

interface EventModalProps {
	event: GameEvent;
}

export default function EventModal({ event }: EventModalProps) {
	const doResolveEvent = useGameStore((s) => s.doResolveEvent);

	const handleChoice = useCallback(
		(choiceId: string) => {
			const resultText = doResolveEvent(choiceId);
			toast(resultText);
		},
		[doResolveEvent],
	);

	return (
		<div className="mb-2.5 rounded-xl border border-orange bg-surface2 p-3.5">
			<div className="mb-2 text-[15px] font-bold text-orange">{event.title}</div>
			<div className="mb-3 text-[13px] leading-relaxed text-text">{event.text}</div>
			<div className="flex flex-col gap-2">
				{event.choices.map((ch) => (
					<button
						type="button"
						key={ch.id}
						onClick={() => handleChoice(ch.id)}
						className="rounded-lg border border-border bg-surface px-3 py-3 text-left font-mono text-[13px] text-text transition-colors active:bg-surface2"
					>
						<div className="font-bold text-orange">{ch.label}</div>
						<div className="mt-0.5 text-[11px] text-dim">{ch.flavor}</div>
					</button>
				))}
			</div>
		</div>
	);
}
