import { useEffect, useRef } from "react";
import { TRAIL_STOPS } from "../../data/trailStops";
import { DesertParallax, PixelCar } from "./PixelScene";

interface TrailMapProps {
	currentIdx: number;
}

export default function TrailMap({ currentIdx }: TrailMapProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = canvas.offsetWidth || 320;
		const W = canvas.width;
		const H = 40; // Just the stop indicators
		canvas.height = H;

		// Transparent background — desert parallax is behind us
		ctx.clearRect(0, 0, W, H);

		// Road line
		ctx.strokeStyle = "#333";
		ctx.lineWidth = 4;
		const roadY = 20;
		ctx.beginPath();
		ctx.moveTo(10, roadY);
		ctx.lineTo(W - 10, roadY);
		ctx.stroke();

		// Stops
		const stops = TRAIL_STOPS;
		const sx = (i: number) => Math.round(15 + (i * (W - 30)) / (stops.length - 1));

		for (let i = 0; i < stops.length; i++) {
			const x = sx(i);
			ctx.beginPath();
			ctx.arc(x, roadY, i === currentIdx ? 7 : 4, 0, Math.PI * 2);
			ctx.fillStyle = i < currentIdx ? "#00ff88" : i === currentIdx ? "#ff6600" : "#333";
			ctx.fill();

			// Labels for key stops
			if (i === currentIdx || i === 0 || i === stops.length - 1) {
				ctx.fillStyle = "#999";
				ctx.font = "9px monospace";
				ctx.textAlign = "center";
				const stop = stops[i]!;
				ctx.fillText(
					stop.name.length > 8 ? `${stop.name.slice(0, 6)}..` : stop.name,
					x,
					roadY + 16,
				);
			}
		}
	}, [currentIdx]);

	return (
		<div className="relative shrink-0 overflow-hidden">
			{/* Parallax desert background */}
			<DesertParallax offset={currentIdx * 30} />

			{/* Pixel car on the road */}
			<div
				className="absolute animate-pulse-glow"
				style={{
					left: `${Math.min(5 + (currentIdx / Math.max(TRAIL_STOPS.length - 1, 1)) * 85, 90)}%`,
					bottom: "24px",
					width: "40px",
					transition: "left 0.8s ease-in-out",
				}}
			>
				<PixelCar className="w-full" />
			</div>

			{/* Stop indicator overlay */}
			<canvas
				ref={canvasRef}
				className="absolute bottom-0 left-0 block w-full"
				style={{ height: "40px" }}
			/>
		</div>
	);
}
