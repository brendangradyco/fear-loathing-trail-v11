import { useCallback, useEffect, useRef, useState } from "react";
import { peerManager } from "../../network/peerManager";
import { useNetworkStore } from "../../stores/networkStore";
import { usePlayerStore } from "../../stores/playerStore";

export default function ChatPanel() {
	const chatOpen = useNetworkStore((s) => s.chatOpen);
	const chatMessages = useNetworkStore((s) => s.chatMessages);
	const chatBadge = useNetworkStore((s) => s.chatBadge);
	const toggleChat = useNetworkStore((s) => s.toggleChat);
	const toggleMic = useNetworkStore((s) => s.toggleMic);
	const toggleCam = useNetworkStore((s) => s.toggleCam);
	const micMuted = useNetworkStore((s) => s.micMuted);
	const camOn = useNetworkStore((s) => s.camOn);
	const playerId = usePlayerStore((s) => s.id);

	const [input, setInput] = useState("");
	const msgsRef = useRef<HTMLDivElement>(null);

	// Auto-scroll on new messages
	useEffect(() => {
		if (msgsRef.current) {
			msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
		}
	}, [chatMessages.length]);

	const handleSend = useCallback(() => {
		const text = input.trim();
		if (!text) return;
		// sendChat broadcasts to peers AND adds locally
		peerManager.sendChat(text);
		setInput("");
	}, [input]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleSend();
			}
		},
		[handleSend],
	);

	return (
		<div
			className={`fixed bottom-0 left-0 right-0 z-[200] flex flex-col transition-[max-height] duration-300 ${
				chatOpen ? "max-h-[45vh]" : "max-h-10"
			}`}
		>
			{/* Toggle bar */}
			<button
				type="button"
				onClick={toggleChat}
				className="flex w-full shrink-0 cursor-pointer items-center gap-2 border-t border-border bg-surface px-3.5 py-2 text-left"
			>
				<span className="flex-1 text-[12px] text-dim">
					{"💬"} Chat {chatOpen ? "(tap to close)" : "(tap to open)"}
				</span>
				{chatBadge > 0 && !chatOpen && (
					<span className="rounded-xl bg-red px-2 py-0.5 text-[11px] font-bold text-white">
						{chatBadge}
					</span>
				)}
			</button>

			{/* Messages */}
			{chatOpen && (
				<>
					<div
						ref={msgsRef}
						className="flex flex-1 flex-col gap-1 overflow-y-auto bg-black/85 px-2.5 py-2"
					>
						{chatMessages.map((msg, i) => (
							<div
								key={`${msg.sender}-${i}`}
								className={`text-[12px] leading-relaxed ${msg.system ? "italic" : ""}`}
							>
								{msg.system ? (
									<span className="text-dim">{msg.text}</span>
								) : (
									<>
										<span
											className={`font-bold ${
												msg.sender === playerId ? "text-green" : "text-orange"
											}`}
										>
											{msg.senderName}:{" "}
										</span>
										<span className="text-text">{msg.text}</span>
									</>
								)}
							</div>
						))}
					</div>

					{/* Input row */}
					<div className="flex shrink-0 gap-1.5 border-t border-border bg-surface px-2.5 py-1.5 pb-[max(6px,env(safe-area-inset-bottom))]">
						<button
							type="button"
							onClick={toggleCam}
							className={`shrink-0 rounded-full border px-3 py-2.5 text-[15px] ${
								camOn ? "border-green text-green" : "border-border text-text"
							} bg-surface2`}
						>
							{"📹"}
						</button>
						<button
							type="button"
							onClick={toggleMic}
							className={`shrink-0 rounded-full border px-3 py-2.5 text-[15px] ${
								micMuted ? "border-red text-red" : "border-border text-text"
							} bg-surface2`}
						>
							{micMuted ? "🔇" : "🔊"}
						</button>
						<input
							type="text"
							placeholder="Send a message..."
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							className="flex-1 rounded-full border border-border bg-surface2 px-3 py-2.5 font-mono text-base text-text outline-none focus:border-orange"
						/>
						<button
							type="button"
							onClick={handleSend}
							className="shrink-0 rounded-full bg-orange px-3 py-2.5 text-[15px] font-bold text-black"
						>
							{"➤"}
						</button>
					</div>
				</>
			)}
		</div>
	);
}
