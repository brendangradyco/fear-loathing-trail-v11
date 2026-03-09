import { useRef, useEffect } from "react";
import { TRAIL_STOPS } from "../../data/trailStops";

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

		// Size canvas to container
		canvas.width = canvas.offsetWidth || 320;
		const W = canvas.width;
		const H = canvas.height || 140;

		// Gradient background
		const grad = ctx.createLinearGradient(0, 0, W, 0);
		grad.addColorStop(0, "#1a0a00");
		grad.addColorStop(1, "#001a0a");
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, W, H);

		// Road
		const roadY = H * 0.65;
		ctx.strokeStyle = "#333";
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.moveTo(0, roadY);
		ctx.lineTo(W, roadY);
		ctx.stroke();

		ctx.strokeStyle = "#444";
		ctx.lineWidth = 2;
		ctx.setLineDash([20, 15]);
		ctx.beginPath();
		ctx.moveTo(0, roadY);
		ctx.lineTo(W, roadY);
		ctx.stroke();
		ctx.setLineDash([]);

		// Stops
		const stops = TRAIL_STOPS;
		const sx = (i: number) =>
			Math.round(20 + (i * (W - 40)) / (stops.length - 1));

		for (let i = 0; i < stops.length; i++) {
			const x = sx(i);
			const y = roadY;

			ctx.beginPath();
			ctx.arc(x, y, i === currentIdx ? 8 : 5, 0, Math.PI * 2);
			ctx.fillStyle =
				i < currentIdx ? "#00ff88" : i === currentIdx ? "#ff6600" : "#333";
			ctx.fill();

			// Labels for current, first, and last
			if (i === currentIdx || i === 0 || i === stops.length - 1) {
				ctx.fillStyle = "#ccc";
				ctx.font = "9px monospace";
				ctx.textAlign = "center";
				const stop = stops[i]!;
				ctx.fillText(stop.emoji || stop.name.slice(0, 3), x, y - 14);
			}
		}

		// Player car marker
		if (currentIdx < stops.length) {
			const px = sx(currentIdx);
			ctx.fillStyle = "#ff6600";
			ctx.font = "16px serif";
			ctx.textAlign = "center";
			ctx.fillText("🚗", px, roadY - 20);
		}
	}, [currentIdx]);

	return (
		<canvas
			ref={canvasRef}
			height={140}
			className="block w-full shrink-0"
		/>
	);
}
