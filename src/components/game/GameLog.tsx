import type { LogEntry } from "../../types";

interface GameLogProps {
	entries: LogEntry[];
}

export default function GameLog({ entries }: GameLogProps) {
	const recent = entries.slice(-8).reverse();

	if (recent.length === 0) return null;

	return (
		<div className="mt-2">
			{recent.map((entry, i) => (
				<div
					key={`${entry.txt}-${i}`}
					className={`border-b border-border py-0.5 text-[12px] ${
						entry.bad ? "text-red" : entry.good ? "text-green" : "text-dim"
					}`}
				>
					{entry.txt}
				</div>
			))}
		</div>
	);
}
