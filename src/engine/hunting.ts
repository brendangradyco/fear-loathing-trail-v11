import { CFG } from "../data/constants";

export interface HuntTarget {
	x: number;
	y: number;
	r: number;
	alive: boolean;
	vx: number;
	vy: number;
	emoji: string;
}

export function spawnTargets(width: number, height: number): HuntTarget[] {
	const targets: HuntTarget[] = [];
	const emojis = CFG.HUNT_TARGET_EMOJIS;

	for (let i = 0; i < CFG.HUNT_TARGET_COUNT; i++) {
		targets.push({
			x: 40 + Math.random() * (width - 80),
			y: 40 + Math.random() * (height - 80),
			r: 18 + Math.random() * 12,
			alive: true,
			vx: (Math.random() - 0.5) * 2,
			vy: (Math.random() - 0.5) * 2,
			emoji: emojis[Math.floor(Math.random() * emojis.length)] ?? "🦇",
		});
	}

	return targets;
}

export function updateTargets(targets: HuntTarget[], width: number, height: number): HuntTarget[] {
	return targets.map((t) => {
		if (!t.alive) return t;

		let { x, y, vx, vy } = t;
		x += vx;
		y += vy;

		if (x < t.r || x > width - t.r) vx *= -1;
		if (y < t.r || y > height - t.r) vy *= -1;

		return { ...t, x, y, vx, vy };
	});
}

export function checkHit(
	targets: HuntTarget[],
	clickX: number,
	clickY: number,
): { targets: HuntTarget[]; hit: boolean } {
	let hit = false;
	const updated = targets.map((t) => {
		if (!t.alive || hit) return t;
		const dist = Math.hypot(t.x - clickX, t.y - clickY);
		if (dist <= t.r + 10) {
			hit = true;
			return { ...t, alive: false };
		}
		return t;
	});
	return { targets: updated, hit };
}
