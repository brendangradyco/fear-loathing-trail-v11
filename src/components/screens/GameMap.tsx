import { useCallback } from "react";
import { TRAIL_STOPS } from "../../data/trailStops";
import { useGameStore } from "../../stores/gameStore";
import EventModal from "../game/EventModal";
import GameLog from "../game/GameLog";
import StatsBar from "../game/StatsBar";
import TrailMap from "../game/TrailMap";
import { toast } from "../shared/Toast";

interface GameMapProps {
	onShop: () => void;
	onHunt: () => void;
}

export default function GameMap({ onShop, onHunt }: GameMapProps) {
	const state = useGameStore((s) => s.state);
	const currentEvent = useGameStore((s) => s.currentEvent);
	const doTravel = useGameStore((s) => s.doTravel);
	const doRest = useGameStore((s) => s.doRest);
	const addLog = useGameStore((s) => s.addLog);
	const finishGame = useGameStore((s) => s.finishGame);

	const handleTravel = useCallback(() => {
		if (!state) return;
		if (state.stopIdx >= TRAIL_STOPS.length - 1) return;
		const nextStop = TRAIL_STOPS[state.stopIdx + 1];
		doTravel();
		if (nextStop) {
			addLog(`Arrived at ${nextStop.name}`, false, true);
		}
	}, [state, doTravel, addLog]);

	const handleRest = useCallback(() => {
		doRest();
		addLog("Rested. Sanity +15. Fuel -5.", false, true);
		toast("Rested. Sanity +15, Fuel -5.");
	}, [doRest, addLog]);

	const handleFinish = useCallback(() => {
		finishGame();
	}, [finishGame]);

	const handleHunt = useCallback(() => {
		if (!state) return;
		if (state.laserAmmo <= 0) {
			toast("No laser ammo!", true);
			return;
		}
		onHunt();
	}, [state, onHunt]);

	if (!state) return null;

	const stop = TRAIL_STOPS[state.stopIdx];
	const nextStop = TRAIL_STOPS[state.stopIdx + 1];
	const canTravel = state.stopIdx < TRAIL_STOPS.length - 1;

	return (
		<div className="fixed inset-0 flex flex-col bg-bg">
			{/* Stats bar */}
			<StatsBar />

			{/* Trail map */}
			<TrailMap currentIdx={state.stopIdx} />

			{/* Action area */}
			<div className="flex-1 overflow-y-auto p-2.5">
				{/* Current event or travel UI */}
				{currentEvent ? (
					<EventModal event={currentEvent} />
				) : (
					<>
						{/* Stop info */}
						{stop && (
							<div className="mb-2 rounded-lg bg-surface2 px-3 py-2.5 text-[12px] text-dim">
								<div className="text-sm font-bold text-orange">
									{stop.emoji} {stop.name}
								</div>
								<div className="mt-1 text-[11px]">{stop.desc}</div>
							</div>
						)}

						{/* Action buttons */}
						<div className="mb-2.5 grid grid-cols-2 gap-2">
							{canTravel ? (
								<button
									type="button"
									onClick={handleTravel}
									className="rounded-lg bg-orange p-3 text-sm font-bold text-black active:opacity-75"
								>
									Drive to {nextStop?.name ?? "Next Stop"}
								</button>
							) : (
								<button
									type="button"
									onClick={handleFinish}
									className="rounded-lg bg-green p-3 text-sm font-bold text-black active:opacity-75"
								>
									{"🏁"} REACH ANCHORAGE
								</button>
							)}
							<button
								type="button"
								onClick={handleRest}
								className="rounded-md border border-orange bg-transparent p-2.5 text-sm text-orange active:opacity-75"
							>
								{"😴"} Rest (+sanity)
							</button>
							<button
								type="button"
								onClick={onShop}
								className="rounded-md border border-orange bg-transparent p-2.5 text-sm text-orange active:opacity-75"
							>
								{"🛒"} Shop
							</button>
							<button
								type="button"
								onClick={handleHunt}
								className="rounded-md border border-orange bg-transparent p-2.5 text-sm text-orange active:opacity-75"
							>
								{"🔫"} Hunt
							</button>
						</div>
					</>
				)}

				{/* Game log */}
				<GameLog entries={state.log} />
			</div>
		</div>
	);
}
