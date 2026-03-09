import { useState, useCallback } from "react";
import { Region } from "../../types";
import { getRegion } from "../../utils/geo";

interface LocationSelectProps {
	onComplete: (region: Region) => void;
}

export default function LocationSelect({ onComplete }: LocationSelectProps) {
	const [locResult, setLocResult] = useState("");

	const handleRequestLocation = useCallback(() => {
		if (!navigator.geolocation) {
			setLocResult("Geolocation not supported. Pick a region below.");
			return;
		}
		setLocResult("Requesting location...");
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const region = getRegion(pos.coords.latitude, pos.coords.longitude);
				setLocResult(
					`Detected region: ${region}. Lat ${pos.coords.latitude.toFixed(2)}, Lon ${pos.coords.longitude.toFixed(2)}`,
				);
				onComplete(region);
			},
			(err) => {
				setLocResult(`Location denied: ${err.message}. Pick a region below.`);
			},
		);
	}, [onComplete]);

	const handleRegionSelect = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			const val = e.target.value;
			if (!val) return;
			// "default2" is "Surprise Me" — maps to Region.DEFAULT
			const region =
				val === "default2"
					? Region.DEFAULT
					: (val as Region);
			onComplete(region);
		},
		[onComplete],
	);

	return (
		<div className="fixed inset-0 flex flex-col bg-bg">
			{/* Header */}
			<div className="flex shrink-0 items-center gap-2.5 border-b border-border bg-surface px-3.5 py-2.5">
				<span className="flex-1 text-[15px] font-bold text-orange">
					{"📍"} YOUR REGION
				</span>
			</div>

			<div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
				{/* Step 1: Geolocation */}
				<div className="rounded-xl border border-orange bg-surface2 p-4 text-center">
					<div className="mb-2.5 text-[11px] uppercase tracking-wider text-dim">
						Step 1 — Auto-detect (optional)
					</div>
					<button
						onClick={handleRequestLocation}
						className="w-full rounded-lg bg-orange p-3.5 text-base font-bold text-black active:opacity-75"
					>
						{"📍"} Allow Location Access
					</button>
					{locResult && (
						<div className="mt-2.5 min-h-4 text-[12px] leading-relaxed text-dim">
							{locResult}
						</div>
					)}
				</div>

				{/* Step 2: Region dropdown */}
				<div className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface2 p-4">
					<div className="text-[11px] font-bold uppercase tracking-wider text-orange">
						Step 2 — Pick your region
					</div>
					<div className="text-[12px] text-dim">
						Selecting a region will advance you automatically.
					</div>
					<select
						onChange={handleRegionSelect}
						defaultValue=""
						className="w-full appearance-none rounded-lg border-2 border-orange bg-surface p-3.5 pr-9 font-mono text-base text-text outline-none"
					>
						<option value="">— Select your region —</option>
						<option value="southwest">
							{"🌵"} Southwest US (Vegas / LA / Phoenix)
						</option>
						<option value="northwest">
							{"🌲"} Northwest US (Seattle / Portland / BC)
						</option>
						<option value="mountain">
							{"🏔️"} Mountain West (Denver / SLC / Boise)
						</option>
						<option value="plains">
							{"🌾"} Plains &amp; East (Chicago / Dallas / NY)
						</option>
						<option value="default">{"🌍"} Rest of World</option>
						<option value="default2">{"🎲"} Surprise Me</option>
					</select>
				</div>
			</div>
		</div>
	);
}
