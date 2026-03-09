/**
 * Pixel art scene illustrations for game events and locations.
 * Metal Slug X inspired — chunky pixel sprites rendered as SVG for crispness at any scale.
 */

const SCENE_COLORS = {
	sky: "#0d0d1a",
	skyGrad: "#1a0a2a",
	sand: "#3a2a10",
	road: "#222",
	roadLine: "#444",
	cactus: "#1a4a1a",
	cactusDark: "#0d330d",
	mesa: "#2a1a0a",
	mesaLight: "#3a2510",
	sun: "#ff6600",
	sunGlow: "rgba(255,102,0,0.15)",
	stars: "#ffffff",
};

/** Desert background with parallax layers — used behind TrailMap */
export function DesertParallax({ offset = 0 }: { offset?: number }) {
	const farOffset = offset * 0.2;
	const midOffset = offset * 0.5;

	return (
		<svg viewBox="0 0 320 140" className="block w-full" preserveAspectRatio="xMidYMid slice">
			<defs>
				<linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={SCENE_COLORS.sky} />
					<stop offset="100%" stopColor={SCENE_COLORS.skyGrad} />
				</linearGradient>
				<radialGradient id="sun-glow" cx="0.8" cy="0.3">
					<stop offset="0%" stopColor={SCENE_COLORS.sunGlow} />
					<stop offset="100%" stopColor="transparent" />
				</radialGradient>
			</defs>

			{/* Sky */}
			<rect width="320" height="140" fill="url(#sky-grad)" />

			{/* Sun glow */}
			<circle cx="260" cy="30" r="60" fill="url(#sun-glow)" />

			{/* Stars */}
			{[
				[30, 12],
				[80, 25],
				[150, 8],
				[200, 18],
				[280, 15],
				[120, 30],
				[240, 10],
				[60, 20],
				[310, 28],
			].map(([x, y]) => (
				<rect
					key={`${x}-${y}`}
					x={x}
					y={y}
					width="2"
					height="2"
					fill={SCENE_COLORS.stars}
					opacity="0.4"
				/>
			))}

			{/* Far mesa layer (slowest parallax) */}
			<g transform={`translate(${farOffset}, 0)`}>
				<polygon
					points="0,95 40,55 80,70 120,50 160,75 200,60 240,70 280,55 320,80 320,95"
					fill={SCENE_COLORS.mesa}
				/>
				<polygon
					points="0,95 40,55 80,70 120,50 160,75 200,60 240,70 280,55 320,80 320,95"
					fill={SCENE_COLORS.mesaLight}
					opacity="0.3"
				/>
			</g>

			{/* Mid cactus layer */}
			<g transform={`translate(${midOffset}, 0)`}>
				{/* Cactus 1 */}
				<rect x="45" y="72" width="6" height="23" fill={SCENE_COLORS.cactus} />
				<rect x="39" y="78" width="6" height="4" fill={SCENE_COLORS.cactus} />
				<rect x="39" y="74" width="6" height="4" fill={SCENE_COLORS.cactus} />
				<rect x="51" y="80" width="6" height="4" fill={SCENE_COLORS.cactus} />
				<rect x="51" y="76" width="6" height="4" fill={SCENE_COLORS.cactus} />

				{/* Cactus 2 */}
				<rect x="185" y="75" width="5" height="20" fill={SCENE_COLORS.cactusDark} />
				<rect x="180" y="81" width="5" height="3" fill={SCENE_COLORS.cactusDark} />
				<rect x="180" y="78" width="5" height="3" fill={SCENE_COLORS.cactusDark} />

				{/* Cactus 3 */}
				<rect x="280" y="78" width="4" height="17" fill={SCENE_COLORS.cactus} />
				<rect x="276" y="84" width="4" height="3" fill={SCENE_COLORS.cactus} />
			</g>

			{/* Sand/ground */}
			<rect x="0" y="95" width="320" height="45" fill={SCENE_COLORS.sand} />

			{/* Road */}
			<rect x="0" y="105" width="320" height="12" fill={SCENE_COLORS.road} />
			<line
				x1="0"
				y1="111"
				x2="320"
				y2="111"
				stroke={SCENE_COLORS.roadLine}
				strokeWidth="2"
				strokeDasharray="20 15"
				className="animate-[road-dash_2s_linear_infinite]"
			/>
		</svg>
	);
}

/** Pixel art car sprite — drives along the trail map */
export function PixelCar({ className = "" }: { className?: string }) {
	return (
		<svg viewBox="0 0 32 16" className={className} preserveAspectRatio="xMidYMid meet">
			{/* Body */}
			<rect x="4" y="4" width="24" height="8" rx="1" fill="#cc3300" />
			{/* Roof */}
			<rect x="10" y="1" width="12" height="5" rx="1" fill="#aa2200" />
			{/* Windshield */}
			<rect x="11" y="2" width="5" height="3" fill="#224466" />
			{/* Rear window */}
			<rect x="18" y="2" width="3" height="3" fill="#224466" />
			{/* Headlight */}
			<rect x="3" y="6" width="2" height="3" fill="#ffcc00" />
			{/* Taillight */}
			<rect x="27" y="6" width="2" height="3" fill="#ff3333" />
			{/* Front wheel */}
			<rect x="6" y="11" width="6" height="4" rx="2" fill="#222" />
			<rect x="7" y="12" width="4" height="2" rx="1" fill="#444" />
			{/* Rear wheel */}
			<rect x="20" y="11" width="6" height="4" rx="2" fill="#222" />
			<rect x="21" y="12" width="4" height="2" rx="1" fill="#444" />
			{/* Exhaust */}
			<rect x="28" y="9" width="3" height="2" fill="#666" opacity="0.6" />
		</svg>
	);
}

/** Event illustration — renders a pixel art scene based on event ID */
export function EventIllustration({ eventId }: { eventId: string }) {
	const scene = EVENT_SCENES[eventId];
	if (!scene) return null;

	return (
		<div className="mb-2 overflow-hidden rounded-lg border border-border">
			<svg
				viewBox="0 0 280 100"
				className="block w-full bg-[#0a0a0a]"
				preserveAspectRatio="xMidYMid slice"
			>
				{scene}
			</svg>
		</div>
	);
}

/** Pixel art scenes for each event */
const EVENT_SCENES: Record<string, React.ReactNode> = {
	bats: (
		<>
			{/* Dark sky */}
			<rect width="280" height="100" fill="#0d0d1a" />
			{/* Moon */}
			<circle cx="230" cy="25" r="15" fill="#ddd" opacity="0.8" />
			<circle cx="225" cy="22" r="12" fill="#0d0d1a" />
			{/* Bat swarm */}
			{[
				[60, 20],
				[90, 35],
				[120, 15],
				[140, 40],
				[170, 25],
				[80, 50],
				[150, 50],
				[110, 30],
				[200, 35],
				[50, 40],
			].map(([x, y], i) => (
				<g key={i} transform={`translate(${x},${y})`}>
					<polygon points="-6,0 -3,-3 0,0 3,-3 6,0 3,1 0,-1 -3,1" fill="#222" />
					<rect x="-1" y="-1" width="2" height="2" fill="#ff3333" />
				</g>
			))}
			{/* Road */}
			<rect x="0" y="75" width="280" height="25" fill="#1a1a0a" />
			<rect x="0" y="82" width="280" height="8" fill="#333" />
			{/* Car */}
			<rect x="110" y="73" width="28" height="10" rx="2" fill="#cc3300" />
			<rect x="116" y="69" width="12" height="6" rx="1" fill="#aa2200" />
			<rect x="113" y="82" width="6" height="4" rx="2" fill="#222" />
			<rect x="126" y="82" width="6" height="4" rx="2" fill="#222" />
		</>
	),

	breakdown: (
		<>
			<rect width="280" height="100" fill="#1a0a00" />
			{/* Sun */}
			<circle cx="200" cy="20" r="12" fill="#ff6600" opacity="0.6" />
			{/* Desert */}
			<rect x="0" y="60" width="280" height="40" fill="#3a2a10" />
			{/* Road */}
			<rect x="0" y="72" width="280" height="10" fill="#333" />
			{/* Broken car */}
			<rect x="100" y="63" width="30" height="11" rx="2" fill="#cc3300" />
			<rect x="106" y="59" width="14" height="6" rx="1" fill="#aa2200" />
			{/* Smoke puffs */}
			<circle cx="100" cy="56" r="5" fill="#555" opacity="0.5" />
			<circle cx="95" cy="50" r="4" fill="#444" opacity="0.4" />
			<circle cx="98" cy="44" r="3" fill="#333" opacity="0.3" />
			{/* Hood open */}
			<rect x="98" y="58" width="8" height="1" fill="#aa2200" transform="rotate(-30,98,58)" />
			{/* Wheels */}
			<rect x="104" y="73" width="6" height="4" rx="2" fill="#222" />
			<rect x="120" y="73" width="6" height="4" rx="2" fill="#222" />
		</>
	),

	police: (
		<>
			<rect width="280" height="100" fill="#0a0a1a" />
			{/* Police lights — alternating red/blue */}
			<rect x="0" y="0" width="140" height="100" fill="rgba(0,0,255,0.05)" />
			<rect x="140" y="0" width="140" height="100" fill="rgba(255,0,0,0.05)" />
			{/* Road */}
			<rect x="0" y="65" width="280" height="35" fill="#222" />
			{/* Police car */}
			<rect x="160" y="58" width="32" height="12" rx="2" fill="#111" />
			<rect x="166" y="54" width="16" height="6" rx="1" fill="#1a1a1a" />
			{/* Light bar */}
			<rect x="168" y="52" width="5" height="3" fill="#3333ff" />
			<rect x="175" y="52" width="5" height="3" fill="#ff3333" />
			{/* Badge */}
			<rect x="182" y="60" width="6" height="6" fill="#ffcc00" opacity="0.8" />
			{/* Player car ahead */}
			<rect x="60" y="60" width="26" height="10" rx="2" fill="#cc3300" />
			<rect x="66" y="56" width="12" height="6" rx="1" fill="#aa2200" />
		</>
	),

	hitchhiker: (
		<>
			<rect width="280" height="100" fill="#1a0a00" />
			{/* Desert */}
			<rect x="0" y="60" width="280" height="40" fill="#3a2a10" />
			<rect x="0" y="72" width="280" height="10" fill="#333" />
			{/* Hitchhiker figure */}
			<rect x="140" y="44" width="6" height="6" rx="3" fill="#dda080" />
			<rect x="139" y="50" width="8" height="14" fill="#446644" />
			<rect x="140" y="64" width="3" height="8" fill="#334433" />
			<rect x="144" y="64" width="3" height="8" fill="#334433" />
			{/* Thumb out */}
			<rect x="147" y="52" width="6" height="2" fill="#dda080" />
			{/* Backpack */}
			<rect x="136" y="50" width="4" height="10" rx="1" fill="#664422" />
			{/* Sign */}
			<rect x="150" y="48" width="20" height="10" fill="#ddd" />
			<rect x="152" y="50" width="16" height="1" fill="#333" />
			<rect x="152" y="53" width="12" height="1" fill="#333" />
		</>
	),

	casino: (
		<>
			<rect width="280" height="100" fill="#0d001a" />
			{/* Casino building */}
			<rect x="80" y="20" width="120" height="60" fill="#1a1a2a" />
			<rect x="85" y="22" width="110" height="3" fill="#ff6600" />
			{/* Neon sign */}
			<rect
				x="100"
				y="28"
				width="80"
				height="14"
				rx="2"
				fill="#220022"
				stroke="#ff00ff"
				strokeWidth="1"
			/>
			{/* Windows */}
			{[95, 115, 135, 155, 175].map((x) => (
				<rect key={x} x={x} y="48" width="8" height="10" fill="#ffcc00" opacity="0.6" />
			))}
			{/* Door */}
			<rect x="130" y="58" width="20" height="22" fill="#332233" />
			<rect x="139" y="60" width="2" height="18" fill="#ffcc00" opacity="0.4" />
			{/* Stars */}
			<rect x="30" y="10" width="2" height="2" fill="#fff" opacity="0.3" />
			<rect x="250" y="15" width="2" height="2" fill="#fff" opacity="0.3" />
			{/* Ground */}
			<rect x="0" y="80" width="280" height="20" fill="#1a1a1a" />
		</>
	),

	wolves: (
		<>
			<rect width="280" height="100" fill="#0a0a1a" />
			{/* Moon */}
			<circle cx="220" cy="20" r="12" fill="#ddd" opacity="0.7" />
			{/* Desert */}
			<rect x="0" y="65" width="280" height="35" fill="#2a1a0a" />
			{/* Wolf pack — pixel wolves */}
			{[80, 120, 160, 200].map((x, i) => (
				<g key={i} transform={`translate(${x},${55 + (i % 2) * 5})`}>
					{/* Body */}
					<rect x="0" y="2" width="14" height="7" fill="#555" />
					{/* Head */}
					<rect x="-4" y="0" width="6" height="6" fill="#666" />
					{/* Eye */}
					<rect x="-3" y="1" width="2" height="2" fill="#ffcc00" />
					{/* Legs */}
					<rect x="1" y="9" width="2" height="4" fill="#444" />
					<rect x="10" y="9" width="2" height="4" fill="#444" />
					{/* Tail */}
					<rect x="13" y="0" width="3" height="3" fill="#555" />
				</g>
			))}
		</>
	),

	border: (
		<>
			<rect width="280" height="100" fill="#0d0d0d" />
			{/* Checkpoint structure */}
			<rect x="120" y="15" width="40" height="55" fill="#333" />
			<rect x="115" y="12" width="50" height="5" fill="#444" />
			{/* Gate arm */}
			<rect x="80" y="35" width="45" height="3" fill="#ff3333" />
			<rect x="155" y="35" width="45" height="3" fill="#ff3333" />
			{/* Warning stripes */}
			{[85, 95, 105, 115, 160, 170, 180, 190].map((x) => (
				<rect
					key={x}
					x={x}
					y="33"
					width="5"
					height="7"
					fill="#ffcc00"
					opacity={x % 20 === 5 ? 0.8 : 0.4}
				/>
			))}
			{/* Guard booth window */}
			<rect x="128" y="22" width="24" height="14" fill="#224466" opacity="0.6" />
			{/* Road */}
			<rect x="0" y="70" width="280" height="30" fill="#222" />
			<line x1="0" y1="85" x2="280" y2="85" stroke="#444" strokeWidth="2" strokeDasharray="15 10" />
			{/* Guard silhouette */}
			<rect x="108" y="42" width="6" height="6" rx="3" fill="#222" />
			<rect x="107" y="48" width="8" height="14" fill="#1a1a1a" />
		</>
	),

	flat_tire: (
		<>
			<rect width="280" height="100" fill="#1a0a00" />
			<rect x="0" y="65" width="280" height="35" fill="#3a2a10" />
			<rect x="0" y="75" width="280" height="8" fill="#333" />
			{/* Car tilted */}
			<g transform="rotate(3, 120, 67)">
				<rect x="100" y="58" width="30" height="11" rx="2" fill="#cc3300" />
				<rect x="106" y="54" width="14" height="6" rx="1" fill="#aa2200" />
			</g>
			{/* Good wheel */}
			<rect x="120" y="71" width="6" height="5" rx="2" fill="#222" />
			{/* Flat wheel */}
			<rect x="104" y="72" width="7" height="3" rx="1" fill="#222" />
			{/* Flat tire on ground */}
			<circle cx="90" cy="78" r="5" fill="#222" />
			<circle cx="90" cy="78" r="3" fill="#333" />
		</>
	),

	dust_storm: (
		<>
			<rect width="280" height="100" fill="#2a1a00" />
			{/* Dust layers */}
			<rect x="0" y="0" width="280" height="100" fill="#3a2a10" opacity="0.3" />
			{/* Swirling dust particles */}
			{[
				[20, 30, 3],
				[60, 50, 4],
				[100, 20, 2],
				[140, 60, 5],
				[180, 35, 3],
				[220, 45, 4],
				[260, 25, 2],
				[40, 70, 3],
				[120, 40, 2],
				[200, 55, 3],
			].map(([x, y, r], i) => (
				<circle key={i} cx={x} cy={y} r={r} fill="#aa8844" opacity="0.4" />
			))}
			{/* Barely visible road */}
			<rect x="0" y="72" width="280" height="10" fill="#333" opacity="0.3" />
			{/* Car fighting through */}
			<rect x="100" y="64" width="26" height="10" rx="2" fill="#cc3300" opacity="0.7" />
		</>
	),

	mirage: (
		<>
			<rect width="280" height="100" fill="#1a0a00" />
			{/* Hot sun */}
			<circle cx="140" cy="15" r="20" fill="#ff6600" opacity="0.4" />
			<circle cx="140" cy="15" r="12" fill="#ffcc00" opacity="0.3" />
			{/* Heat shimmer lines */}
			{[40, 50, 60, 70].map((y) => (
				<line
					key={y}
					x1="0"
					y1={y}
					x2="280"
					y2={y}
					stroke="#ff6600"
					strokeWidth="1"
					opacity="0.08"
				/>
			))}
			{/* Desert */}
			<rect x="0" y="65" width="280" height="35" fill="#3a2a10" />
			{/* Mirage — wavy pool */}
			<ellipse cx="200" cy="62" rx="30" ry="5" fill="#2244aa" opacity="0.3" />
			<ellipse cx="200" cy="60" rx="25" ry="3" fill="#3355cc" opacity="0.2" />
			{/* Palm tree mirage */}
			<rect x="195" y="40" width="3" height="20" fill="#336633" opacity="0.3" />
			<polygon points="185,42 197,35 209,42" fill="#338833" opacity="0.25" />
		</>
	),

	gas_station: (
		<>
			<rect width="280" height="100" fill="#0d0d1a" />
			{/* Station building */}
			<rect x="100" y="30" width="80" height="40" fill="#222" />
			<rect x="95" y="27" width="90" height="5" fill="#333" />
			{/* Pumps */}
			<rect x="80" y="45" width="10" height="20" fill="#444" />
			<rect x="82" y="48" width="6" height="6" fill="#00ff88" opacity="0.5" />
			<rect x="190" y="45" width="10" height="20" fill="#444" />
			<rect x="192" y="48" width="6" height="6" fill="#00ff88" opacity="0.5" />
			{/* Sign */}
			<rect x="120" y="32" width="40" height="12" fill="#111" />
			<rect x="125" y="34" width="30" height="2" fill="#ff6600" />
			<rect x="125" y="38" width="20" height="2" fill="#ff6600" />
			{/* Ground */}
			<rect x="0" y="70" width="280" height="30" fill="#1a1a1a" />
			{/* Neon light */}
			<rect x="95" y="25" width="2" height="45" fill="#ff6600" opacity="0.1" />
			<rect x="183" y="25" width="2" height="45" fill="#ff6600" opacity="0.1" />
		</>
	),
};
