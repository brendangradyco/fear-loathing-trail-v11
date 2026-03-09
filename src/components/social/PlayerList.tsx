import { useNetworkStore } from "../../stores/networkStore";
import Avatar from "../shared/Avatar";

export default function PlayerList() {
	const peers = useNetworkStore((s) => s.peers);

	const entries = Object.entries(peers);
	if (entries.length === 0) return null;

	return (
		<>
			{entries.map(([id, info]) => (
				<div
					key={id}
					className="flex items-center gap-2.5 rounded-xl border border-border bg-surface2 px-3 py-2.5"
				>
					<Avatar
						player={info.player}
						className="h-[66px] w-[44px] shrink-0"
					/>
					<div className="min-w-0 flex-1">
						<div className="overflow-hidden text-ellipsis whitespace-nowrap font-bold text-orange">
							{info.name}
						</div>
						<div className="mt-0.5 text-[11px] text-dim">
							{info.player.sex}, {info.player.age}
						</div>
					</div>
				</div>
			))}
		</>
	);
}
