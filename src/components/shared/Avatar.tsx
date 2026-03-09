import type { PlayerData } from "../../types";

interface AvatarProps {
	player: Partial<PlayerData>;
	className?: string;
}

export default function Avatar({ player, className = "" }: AvatarProps) {
	const sex = player.sex ?? "male";
	const age = player.age ?? "adult";
	const quirks = player.quirks ?? [];

	const isOld = age === "old";
	const isYoung = age === "young";
	const isFem = sex === "female";

	// Deterministic color from name (or fallback)
	const nameHash = (player.name ?? "Duke")
		.split("")
		.reduce((acc, c) => acc + c.charCodeAt(0), 0);
	const skins = ["#fde8d0", "#f0c5a0", "#d4956a", "#a0622a", "#6b3a1f"];
	const hairColors = [
		"#222",
		"#8b4513",
		"#ff6600",
		"#ffd700",
		"#cc0000",
		"#9933ff",
		"#00aa88",
	];
	const skin = skins[nameHash % skins.length]!;
	const hair = hairColors[(nameHash + 3) % hairColors.length]!;

	const hasPegLeg = quirks.includes("peg_leg");
	const hasMissingEye = quirks.includes("missing_eye");
	const patchLeft = quirks.includes("eye_patch_left");
	const patchRight = quirks.includes("eye_patch_right");
	const hasHookHand = quirks.includes("hook_hand");
	const hasMohawk = quirks.includes("mohawk");
	const hasWizardBeard = quirks.includes("wizard_beard");
	const hasSunglasses = quirks.includes("sunglasses");
	const hasThirdEye = quirks.includes("third_eye");
	const hasStankButt = quirks.includes("stank_butt");
	const hasTattoos = quirks.includes("tattoos");
	const hasScar = quirks.includes("scar");
	const hasMullet = quirks.includes("mullet");

	const bodyColor = isFem ? "#ff6600" : sex === "male" ? "#00ff88" : "#ff00cc";
	const bodyW = isFem ? 34 : 30;
	const bodyX = 50 - bodyW / 2;
	const headSize = isYoung ? 28 : isOld ? 24 : 26;
	const headY = isOld ? 46 : 44;
	const eyeY = headY - 2;
	const mouthY = headY + 13;

	return (
		<svg
			viewBox="0 0 100 150"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			{/* Stank butt (behind body) */}
			{hasStankButt &&
				[0, 1, 2].map((i) => (
					<path
						key={`stank-${i}`}
						d={`M ${60 + i * 5} 105 Q ${65 + i * 5} 95 ${60 + i * 5} 85`}
						stroke="#88ff44"
						strokeWidth="1.5"
						fill="none"
						opacity="0.6"
					/>
				))}

			{/* Legs */}
			<rect x="33" y="105" width="12" height="30" rx="4" fill={bodyColor} />
			{hasPegLeg ? (
				<>
					<rect x="55" y="105" width="6" height="30" rx="2" fill="#aaa" />
					<rect x="52" y="133" width="12" height="4" rx="2" fill="#888" />
				</>
			) : (
				<rect
					x="55"
					y="105"
					width="12"
					height="30"
					rx="4"
					fill={bodyColor}
				/>
			)}

			{/* Body */}
			<rect
				x={bodyX}
				y="72"
				width={bodyW}
				height="35"
				rx="6"
				fill={bodyColor}
			/>
			<line x1="50" y1="72" x2="50" y2="107" stroke="#ffffff33" strokeWidth="1" />

			{/* Tattoos */}
			{hasTattoos && (
				<text x="18" y="90" fontSize="9" fill="#ff4444" opacity="0.8">
					{"⚡"}
				</text>
			)}

			{/* Arms */}
			<rect x="16" y="74" width="11" height="24" rx="5" fill={skin} />
			<rect x="73" y="74" width="11" height="24" rx="5" fill={skin} />
			{hasHookHand && (
				<path
					d="M 84 98 Q 92 98 92 91 Q 92 84 85 84"
					stroke="#aaa"
					strokeWidth="2.5"
					fill="none"
					strokeLinecap="round"
				/>
			)}

			{/* Head */}
			<circle cx="50" cy={headY} r={headSize} fill={skin} />

			{/* Blush */}
			<circle
				cx="34"
				cy={headY + 4}
				r="5"
				fill="#ff9999"
				opacity="0.4"
			/>
			<circle
				cx="66"
				cy={headY + 4}
				r="5"
				fill="#ff9999"
				opacity="0.4"
			/>

			{/* Hair */}
			{hasMohawk ? (
				<rect
					x="46"
					y={headY - headSize - 12}
					width="8"
					height="16"
					rx="3"
					fill={hair}
				/>
			) : hasMullet ? (
				<>
					<rect
						x="26"
						y={headY - 6}
						width="8"
						height="28"
						rx="3"
						fill={hair}
					/>
					<rect
						x="35"
						y={headY - headSize - 2}
						width="30"
						height="12"
						rx="5"
						fill={hair}
					/>
				</>
			) : isFem ? (
				<>
					<ellipse
						cx="50"
						cy={headY - headSize + 8}
						rx={headSize + 4}
						ry="16"
						fill={hair}
					/>
					<rect
						x={50 - headSize - 3}
						y={headY - 10}
						width="8"
						height="25"
						rx="4"
						fill={hair}
					/>
					<rect
						x={50 + headSize - 5}
						y={headY - 10}
						width="8"
						height="25"
						rx="4"
						fill={hair}
					/>
				</>
			) : (
				<rect
					x={50 - headSize}
					y={headY - headSize - 2}
					width={headSize * 2}
					height="14"
					rx="7"
					fill={hair}
				/>
			)}

			{/* Wizard beard */}
			{hasWizardBeard && (
				<path
					d={`M 38 ${headY + 14} Q 50 ${headY + 36} 62 ${headY + 14}`}
					stroke={isOld ? "#ccc" : hair}
					strokeWidth="5"
					fill="none"
					strokeLinecap="round"
					opacity="0.9"
				/>
			)}

			{/* Scar */}
			{hasScar && (
				<path
					d={`M 55 ${headY - 8} L 62 ${headY + 4}`}
					stroke="#cc2222"
					strokeWidth="2"
					strokeLinecap="round"
				/>
			)}

			{/* Left eye */}
			{patchLeft ? (
				<>
					<rect
						x="33"
						y={eyeY - 6}
						width="16"
						height="12"
						rx="3"
						fill="#111"
					/>
					<line
						x1="33"
						y1={eyeY - 2}
						x2="24"
						y2={eyeY - 8}
						stroke="#444"
						strokeWidth="1.5"
					/>
				</>
			) : hasMissingEye ? (
				<>
					<line
						x1="36"
						y1={eyeY - 4}
						x2="44"
						y2={eyeY + 4}
						stroke="#ff4444"
						strokeWidth="2"
					/>
					<line
						x1="44"
						y1={eyeY - 4}
						x2="36"
						y2={eyeY + 4}
						stroke="#ff4444"
						strokeWidth="2"
					/>
				</>
			) : (
				<>
					<circle cx="40" cy={eyeY} r="7" fill="white" />
					<circle cx="41" cy={eyeY} r="4" fill="#1a1a1a" />
					<circle cx="43" cy={eyeY - 2} r="1.5" fill="white" />
				</>
			)}

			{/* Right eye */}
			{patchRight ? (
				<>
					<rect
						x="51"
						y={eyeY - 6}
						width="16"
						height="12"
						rx="3"
						fill="#111"
					/>
					<line
						x1="67"
						y1={eyeY - 2}
						x2="76"
						y2={eyeY - 8}
						stroke="#444"
						strokeWidth="1.5"
					/>
				</>
			) : (
				<>
					<circle cx="60" cy={eyeY} r="7" fill="white" />
					<circle cx="61" cy={eyeY} r="4" fill="#1a1a1a" />
					<circle cx="63" cy={eyeY - 2} r="1.5" fill="white" />
				</>
			)}

			{/* Sunglasses */}
			{hasSunglasses && (
				<>
					<rect
						x="32"
						y={eyeY - 7}
						width="18"
						height="11"
						rx="4"
						fill="#ff660088"
						stroke="#ff6600"
						strokeWidth="1"
					/>
					<rect
						x="52"
						y={eyeY - 7}
						width="18"
						height="11"
						rx="4"
						fill="#ff660088"
						stroke="#ff6600"
						strokeWidth="1"
					/>
					<line
						x1="50"
						y1={eyeY - 2}
						x2="52"
						y2={eyeY - 2}
						stroke="#ff6600"
						strokeWidth="1"
					/>
				</>
			)}

			{/* Third eye */}
			{hasThirdEye && (
				<>
					<ellipse
						cx="50"
						cy={eyeY - 12}
						rx="5"
						ry="4"
						fill="#ff00cc"
						opacity="0.9"
					/>
					<circle cx="50" cy={eyeY - 12} r="2" fill="#1a1a1a" />
				</>
			)}

			{/* Nose */}
			<ellipse
				cx="50"
				cy={headY + 5}
				rx="3"
				ry="2"
				fill="rgba(0,0,0,.15)"
			/>

			{/* Mouth */}
			<path
				d={`M 44 ${mouthY} Q 50 ${mouthY + 5} 56 ${mouthY}`}
				stroke="#c0706a"
				strokeWidth="2"
				fill="none"
				strokeLinecap="round"
			/>

			{/* Age lines */}
			{isOld && (
				<>
					<path
						d={`M 32 ${headY - 4} Q 28 ${headY + 2} 32 ${headY + 6}`}
						stroke="rgba(0,0,0,.2)"
						strokeWidth="1"
						fill="none"
					/>
					<path
						d={`M 68 ${headY - 4} Q 72 ${headY + 2} 68 ${headY + 6}`}
						stroke="rgba(0,0,0,.2)"
						strokeWidth="1"
						fill="none"
					/>
				</>
			)}
		</svg>
	);
}
