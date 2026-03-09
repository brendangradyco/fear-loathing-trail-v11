interface DeathScreenProps {
	reason: "fuel" | "sanity" | null;
	onRestart: () => void;
}

const DEATH_MESSAGES: Record<string, string> = {
	fuel: "Ran out of fuel. The Great Red Shark dies in the desert.",
	sanity: "Your mind shattered somewhere outside of Barstow. The bats won.",
};

function DeathIllustration({ reason }: { reason: string | null }) {
	return (
		<svg
			viewBox="0 0 200 120"
			className="mx-auto mb-4 block w-[220px]"
			preserveAspectRatio="xMidYMid meet"
		>
			{/* Sky */}
			<rect width="200" height="120" fill="#0a0000" />

			{reason === "fuel" ? (
				<>
					{/* Desert */}
					<rect x="0" y="75" width="200" height="45" fill="#2a1a0a" />
					{/* Road */}
					<rect x="0" y="85" width="200" height="10" fill="#222" />
					{/* Wrecked car */}
					<g transform="rotate(8, 100, 78)">
						<rect x="80" y="70" width="30" height="11" rx="2" fill="#662200" />
						<rect x="86" y="66" width="14" height="6" rx="1" fill="#551a00" />
					</g>
					{/* Fire */}
					<polygon points="90,65 95,50 100,65" fill="#ff3300" opacity="0.7" />
					<polygon points="95,60 98,45 101,60" fill="#ffcc00" opacity="0.5" />
					{/* Smoke */}
					<circle cx="95" cy="40" r="6" fill="#333" opacity="0.4" />
					<circle cx="100" cy="30" r="5" fill="#222" opacity="0.3" />
					{/* Vultures */}
					<g transform="translate(50,20)">
						<polygon points="-5,0 -2,-3 0,0 2,-3 5,0" fill="#333" />
					</g>
					<g transform="translate(150,25)">
						<polygon points="-5,0 -2,-3 0,0 2,-3 5,0" fill="#333" />
					</g>
				</>
			) : (
				<>
					{/* Psychedelic insanity */}
					<circle
						cx="100"
						cy="50"
						r="40"
						fill="none"
						stroke="#ff3300"
						strokeWidth="1"
						opacity="0.3"
					/>
					<circle
						cx="100"
						cy="50"
						r="30"
						fill="none"
						stroke="#cc44ff"
						strokeWidth="1"
						opacity="0.3"
					/>
					<circle
						cx="100"
						cy="50"
						r="20"
						fill="none"
						stroke="#ff6600"
						strokeWidth="1"
						opacity="0.3"
					/>
					{/* Spiral bats */}
					{[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
						const rad = (angle * Math.PI) / 180;
						const r = 35;
						const x = 100 + Math.cos(rad) * r;
						const y = 50 + Math.sin(rad) * r;
						return (
							<g key={angle} transform={`translate(${x},${y}) rotate(${angle})`}>
								<polygon points="-4,0 -2,-2 0,0 2,-2 4,0" fill="#ff3333" opacity="0.6" />
							</g>
						);
					})}
					{/* Shattered face */}
					<rect x="92" y="42" width="4" height="4" fill="#ff3333" opacity="0.5" />
					<rect x="104" y="42" width="4" height="4" fill="#ff3333" opacity="0.5" />
					<rect x="96" y="55" width="8" height="2" fill="#ff3333" opacity="0.4" />
					{/* Ground */}
					<rect x="0" y="90" width="200" height="30" fill="#1a0a1a" />
				</>
			)}

			{/* Skull */}
			<g transform="translate(100, 105)">
				<rect x="-6" y="-8" width="12" height="10" rx="2" fill="#ddd" />
				<rect x="-3" y="-5" width="3" height="3" fill="#0a0000" />
				<rect x="1" y="-5" width="3" height="3" fill="#0a0000" />
				<rect x="-2" y="0" width="1" height="2" fill="#0a0000" />
				<rect x="0" y="0" width="1" height="2" fill="#0a0000" />
				<rect x="2" y="0" width="1" height="2" fill="#0a0000" />
			</g>
		</svg>
	);
}

export default function DeathScreen({ reason, onRestart }: DeathScreenProps) {
	return (
		<div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-bg p-8 safe-top">
			<DeathIllustration reason={reason} />
			<h1 className="text-center text-[32px] font-bold text-red">YOU DIED</h1>
			<p className="max-w-[300px] text-center text-[13px] leading-relaxed text-dim">
				{reason ? DEATH_MESSAGES[reason] : "The trail claimed another soul."}
			</p>
			<button
				type="button"
				onClick={onRestart}
				className="mt-2 w-[200px] rounded-lg bg-red p-3.5 text-base font-bold text-white active:opacity-75"
			>
				Try Again
			</button>
		</div>
	);
}
