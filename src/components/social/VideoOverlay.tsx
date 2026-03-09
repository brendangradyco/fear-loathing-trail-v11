import { useEffect, useRef } from "react";
import { useNetworkStore } from "../../stores/networkStore";

export default function VideoOverlay() {
	const localStream = useNetworkStore((s) => s.localStream);
	const camOn = useNetworkStore((s) => s.camOn);
	const localVideoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (localVideoRef.current && localStream) {
			localVideoRef.current.srcObject = localStream;
		}
	}, [localStream]);

	if (!localStream || !camOn) return null;

	return (
		<div className="pointer-events-none fixed right-0 top-0 z-[100] flex flex-col gap-1 p-1">
			<div className="pointer-events-auto relative h-[70px] w-[90px] shrink-0 overflow-hidden rounded-md border-2 border-orange bg-black">
				<video
					ref={localVideoRef}
					autoPlay
					muted
					playsInline
					className="block h-full w-full object-cover"
				/>
				<div className="absolute bottom-0.5 left-0 right-0 bg-black/50 py-px text-center text-[9px] text-white">
					You
				</div>
			</div>
		</div>
	);
}
