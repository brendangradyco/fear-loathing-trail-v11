import { useCallback, useEffect, useRef, useState } from "react";
import { CFG } from "../../data/constants";
import type { HuntTarget } from "../../engine/hunting";
import { checkHit, spawnTargets, updateTargets } from "../../engine/hunting";
import { useGameStore } from "../../stores/gameStore";
import { toast } from "../shared/Toast";

interface HuntGameProps {
	onEnd: () => void;
}

export default function HuntGame({ onEnd }: HuntGameProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const state = useGameStore((s) => s.state);
	const addHuntReward = useGameStore((s) => s.addHuntReward);
	const addLog = useGameStore((s) => s.addLog);

	const [ammo, setAmmo] = useState<number>(state?.laserAmmo ?? 0);
	const [meat, setMeat] = useState<number>(0);
	const [timeLeft, setTimeLeft] = useState<number>(CFG.HUNT_DURATION);

	const targetsRef = useRef<HuntTarget[]>([]);
	const meatRef = useRef(0);
	const ammoRef = useRef(state?.laserAmmo ?? 0);
	const activeRef = useRef(true);
	const rafRef = useRef<number>(0);

	// Initialize targets
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const W = canvas.offsetWidth || 320;
		const H = canvas.height || 320;
		targetsRef.current = spawnTargets(W, H);
	}, []);

	// Timer countdown
	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	// End game when time runs out
	useEffect(() => {
		if (timeLeft <= 0 && activeRef.current) {
			activeRef.current = false;
			const meatCount = meatRef.current;
			addHuntReward(meatCount);
			addLog(
				`Hunt: got ${meatCount} creatures. Supplies +${Math.floor(meatCount / 2)}`,
				false,
				meatCount > 0,
			);
			toast(`Hunt over! +${meatCount} meat, +${Math.floor(meatCount / 2)} supplies`);
			onEnd();
		}
	}, [timeLeft, addHuntReward, addLog, onEnd]);

	// Render loop
	useEffect(() => {
		function loop() {
			if (!activeRef.current) return;
			const canvas = canvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			canvas.width = canvas.offsetWidth || 320;
			const W = canvas.width;
			const H = canvas.height || 320;

			// Background
			ctx.fillStyle = "#060606";
			ctx.fillRect(0, 0, W, H);

			// Grid
			ctx.strokeStyle = "#1a1a1a";
			ctx.lineWidth = 1;
			for (let x = 0; x < W; x += 40) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, H);
				ctx.stroke();
			}
			for (let y = 0; y < H; y += 40) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(W, y);
				ctx.stroke();
			}

			// Update targets
			targetsRef.current = updateTargets(targetsRef.current, W, H);

			// Draw targets
			for (const t of targetsRef.current) {
				if (!t.alive) continue;
				ctx.font = `${Math.round(t.r * 1.4)}px serif`;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(t.emoji, t.x, t.y);

				// Glow ring
				ctx.strokeStyle = "rgba(255,102,0,0.3)";
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
				ctx.stroke();
			}

			rafRef.current = requestAnimationFrame(loop);
		}

		rafRef.current = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(rafRef.current);
	}, []);

	const handleShoot = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
			if (!activeRef.current) return;
			if (ammoRef.current <= 0) return;

			const canvas = canvasRef.current;
			if (!canvas) return;

			const rect = canvas.getBoundingClientRect();
			const scaleX = canvas.width / rect.width;
			const scaleY = canvas.height / rect.height;

			let clientX: number;
			let clientY: number;
			if ("touches" in e) {
				const touch = e.touches[0];
				if (!touch) return;
				clientX = touch.clientX;
				clientY = touch.clientY;
			} else {
				clientX = e.clientX;
				clientY = e.clientY;
			}

			const cx = clientX - rect.left;
			const cy = clientY - rect.top;
			const x = cx * scaleX;
			const y = cy * scaleY;

			ammoRef.current--;
			setAmmo(ammoRef.current);

			const result = checkHit(targetsRef.current, x, y);
			targetsRef.current = result.targets;
			if (result.hit) {
				meatRef.current++;
				setMeat(meatRef.current);
			}

			// Respawn if all dead
			if (targetsRef.current.every((t) => !t.alive)) {
				const W = canvas.offsetWidth || 320;
				const H = canvas.height || 320;
				targetsRef.current = spawnTargets(W, H);
			}

			// End if no ammo
			if (ammoRef.current <= 0 && activeRef.current) {
				activeRef.current = false;
				const meatCount = meatRef.current;
				addHuntReward(meatCount);
				addLog(
					`Hunt: got ${meatCount} creatures. Supplies +${Math.floor(meatCount / 2)}`,
					false,
					meatCount > 0,
				);
				toast(`Hunt over! +${meatCount} meat, +${Math.floor(meatCount / 2)} supplies`);
				onEnd();
			}
		},
		[addHuntReward, addLog, onEnd],
	);

	const handleQuit = useCallback(() => {
		if (!activeRef.current) return;
		activeRef.current = false;
		const meatCount = meatRef.current;
		addHuntReward(meatCount);
		addLog(
			`Hunt: got ${meatCount} creatures. Supplies +${Math.floor(meatCount / 2)}`,
			false,
			meatCount > 0,
		);
		toast(`Hunt over! +${meatCount} meat, +${Math.floor(meatCount / 2)} supplies`);
		onEnd();
	}, [addHuntReward, addLog, onEnd]);

	return (
		<div className="fixed inset-0 flex flex-col bg-bg">
			{/* HUD */}
			<div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-3.5 py-2">
				<span className="text-[13px] font-bold text-orange">
					{"🔫"} {ammo}
				</span>
				<span className="text-[13px] font-bold text-orange">
					{"🥩"} {meat}
				</span>
				<span className="text-[13px] font-bold text-orange">
					{"⏱️"} {timeLeft}s
				</span>
				<button
					type="button"
					onClick={handleQuit}
					className="rounded-md border border-orange bg-transparent px-3 py-1.5 text-[12px] text-orange"
				>
					QUIT
				</button>
			</div>

			{/* Canvas */}
			<canvas
				ref={canvasRef}
				height={320}
				className="block w-full shrink-0 cursor-crosshair bg-[#0a0a0a]"
				onClick={handleShoot}
				onTouchStart={handleShoot}
			/>
		</div>
	);
}
