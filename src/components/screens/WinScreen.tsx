interface WinScreenProps {
	onRestart: () => void;
}

function WinIllustration() {
	return (
		<svg
			viewBox="0 0 200 120"
			className="mx-auto mb-4 block w-[220px]"
			preserveAspectRatio="xMidYMid meet"
		>
			{/* Night sky with aurora */}
			<rect width="200" height="120" fill="#001a2a" />

			{/* Aurora borealis */}
			<ellipse cx="100" cy="20" rx="90" ry="15" fill="#00ff88" opacity="0.08" />
			<ellipse cx="80" cy="25" rx="60" ry="12" fill="#00aaff" opacity="0.06" />
			<ellipse cx="120" cy="18" rx="50" ry="10" fill="#cc44ff" opacity="0.05" />

			{/* Stars */}
			{[
				[20, 10],
				[50, 18],
				[80, 8],
				[120, 15],
				[160, 12],
				[180, 22],
				[40, 28],
				[140, 5],
			].map(([x, y]) => (
				<rect key={`${x}-${y}`} x={x} y={y} width="2" height="2" fill="#fff" opacity="0.5" />
			))}

			{/* Mountains/snow */}
			<polygon points="0,80 30,45 60,65 90,40 120,60 150,35 180,55 200,50 200,80" fill="#1a3a4a" />
			<polygon
				points="0,80 30,45 60,65 90,40 120,60 150,35 180,55 200,50 200,80"
				fill="#fff"
				opacity="0.1"
			/>

			{/* Snow caps */}
			<polygon points="85,40 90,40 95,48" fill="#ddeeff" opacity="0.4" />
			<polygon points="145,35 150,35 155,43" fill="#ddeeff" opacity="0.4" />

			{/* Ground — snow */}
			<rect x="0" y="80" width="200" height="40" fill="#2a3a4a" />

			{/* Road */}
			<rect x="0" y="90" width="200" height="8" fill="#334" />

			{/* City lights in distance */}
			{[40, 55, 70, 85, 100, 115, 130, 145, 160].map((x) => (
				<rect
					key={x}
					x={x}
					y={78 - Math.random() * 5}
					width="3"
					height="4"
					fill="#ffcc00"
					opacity="0.3"
				/>
			))}

			{/* Car arriving */}
			<rect x="70" y="83" width="26" height="9" rx="2" fill="#cc3300" />
			<rect x="76" y="80" width="12" height="5" rx="1" fill="#aa2200" />
			<rect x="69" y="84" width="2" height="3" fill="#ffcc00" />

			{/* Welcome sign */}
			<rect x="150" y="72" width="2" height="18" fill="#666" />
			<rect x="140" y="68" width="24" height="10" fill="#224422" />
			<rect x="143" y="70" width="18" height="2" fill="#ffcc00" opacity="0.6" />
			<rect x="143" y="74" width="14" height="1" fill="#ffcc00" opacity="0.4" />

			{/* Trophy */}
			<g transform="translate(100, 108)">
				<rect x="-6" y="0" width="12" height="3" fill="#ffcc00" />
				<rect x="-4" y="-6" width="8" height="7" rx="1" fill="#ffcc00" />
				<rect x="-8" y="-4" width="4" height="3" rx="1" fill="#ffcc00" />
				<rect x="4" y="-4" width="4" height="3" rx="1" fill="#ffcc00" />
				<rect x="-2" y="-3" width="4" height="3" fill="#cc9900" />
			</g>
		</svg>
	);
}

export default function WinScreen({ onRestart }: WinScreenProps) {
	return (
		<div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-bg p-8 safe-top">
			<WinIllustration />
			<h1 className="text-center text-[28px] font-bold text-yellow">ANCHORAGE!</h1>
			<p className="max-w-[300px] text-center text-[13px] leading-relaxed text-dim">
				You made it to the end of the world. The bats are pleased.
			</p>
			<button
				type="button"
				onClick={onRestart}
				className="mt-2 w-[200px] rounded-lg bg-orange p-3.5 text-base font-bold text-black active:opacity-75"
			>
				Play Again
			</button>
		</div>
	);
}
