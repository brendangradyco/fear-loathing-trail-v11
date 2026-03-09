interface DeathScreenProps {
	reason: "fuel" | "sanity" | null;
	onRestart: () => void;
}

const DEATH_MESSAGES: Record<string, string> = {
	fuel: "Ran out of fuel. The Great Red Shark dies in the desert.",
	sanity:
		"Your mind shattered somewhere outside of Barstow. The bats won.",
};

export default function DeathScreen({ reason, onRestart }: DeathScreenProps) {
	return (
		<div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-bg p-8">
			<h1 className="text-center text-[32px] font-bold text-red">
				{"💀"} YOU DIED
			</h1>
			<p className="text-center text-[13px] leading-relaxed text-dim">
				{reason ? DEATH_MESSAGES[reason] : "The trail claimed another soul."}
			</p>
			<button
				onClick={onRestart}
				className="w-[200px] rounded-lg bg-red p-3.5 text-base font-bold text-white active:opacity-75"
			>
				Try Again
			</button>
		</div>
	);
}
