import { useCallback } from "react";
import { useNetworkStore } from "../../stores/networkStore";
import { usePlayerStore } from "../../stores/playerStore";
import Avatar from "../shared/Avatar";
import { toast } from "../shared/Toast";
import PlayerList from "../social/PlayerList";

interface LobbyProps {
	onStartGame: () => void;
}

export default function Lobby({ onStartGame }: LobbyProps) {
	const roomId = useNetworkStore((s) => s.roomId);
	const status = useNetworkStore((s) => s.status);
	const playerData = usePlayerStore((s) => s.data);

	const handleCopyLink = useCallback(() => {
		const url = `${window.location.origin}${window.location.pathname}#${roomId ?? ""}`;
		navigator.clipboard.writeText(url).then(
			() => toast("Link copied!"),
			() => toast("Could not copy link", true),
		);
	}, [roomId]);

	const statusDotClass =
		status === "connected" ? "bg-green" : status === "connecting" ? "bg-yellow" : "bg-dim";
	const statusLabel =
		status === "connected"
			? "Connected"
			: status === "connecting"
				? "Connecting..."
				: status === "error"
					? "Error"
					: "Disconnected";

	return (
		<div className="fixed inset-0 flex flex-col bg-bg">
			{/* Header */}
			<div className="safe-top flex shrink-0 items-center gap-2.5 border-b border-border bg-surface px-3.5 py-2.5">
				<span className="flex-1 text-[15px] font-bold text-orange">{"🌍"} BAT COUNTRY LOBBY</span>
				<div className="flex items-center gap-1.5 text-[12px] text-dim">
					<div className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass}`} />
					<span>{statusLabel}</span>
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3.5">
				{/* Room code box */}
				<div className="rounded-xl border border-orange bg-surface2 p-3.5 text-center">
					<div className="text-[11px] uppercase tracking-wider text-dim">
						Room Code — Share this link!
					</div>
					<div className="mt-1 text-[28px] font-bold tracking-[6px] text-orange">
						{roomId ?? "??????"}
					</div>
					<div className="mt-1.5 text-[11px] text-dim">
						Anyone who opens your shared URL joins automatically
					</div>
					<button
						type="button"
						onClick={handleCopyLink}
						className="mt-2.5 inline-block rounded-md border border-orange bg-transparent px-4 py-2.5 text-sm text-orange"
					>
						{"📋"} Copy Invite Link
					</button>
				</div>

				{/* Player list - show self at minimum */}
				{playerData && (
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface2 px-3 py-2.5">
							<Avatar player={playerData} className="h-[66px] w-[44px] shrink-0" />
							<div className="min-w-0 flex-1">
								<div className="overflow-hidden text-ellipsis whitespace-nowrap font-bold text-orange">
									{playerData.name}
								</div>
								<div className="mt-0.5 text-[11px] text-dim">You (Host)</div>
							</div>
						</div>
						<PlayerList />
					</div>
				)}

				{/* Start button */}
				<button
					type="button"
					onClick={onStartGame}
					className="w-full rounded-lg bg-orange p-3.5 text-base font-bold tracking-wide text-black active:opacity-75"
				>
					HEAD TO THE STASH {"💊"}
				</button>

				<div className="py-1 text-center text-[11px] text-dim">
					Stock up on supplies, then hit the trail — others can join mid-game
				</div>

				<div className="h-20" />
			</div>
		</div>
	);
}
