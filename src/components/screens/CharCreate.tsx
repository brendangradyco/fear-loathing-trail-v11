import { useCallback, useState } from "react";
import { QUIRKS } from "../../data/quirks";
import type { Age, Sex } from "../../types";
import Avatar from "../shared/Avatar";

interface CharCreateProps {
	onComplete: (name: string, sex: Sex, age: Age, quirks: string[]) => void;
}

export default function CharCreate({ onComplete }: CharCreateProps) {
	const [name, setName] = useState("");
	const [sex, setSex] = useState<Sex>("male");
	const [age, setAge] = useState<Age>("young");
	const [selectedQuirks, setSelectedQuirks] = useState<string[]>([]);

	const toggleQuirk = useCallback((id: string) => {
		setSelectedQuirks((prev) => (prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]));
	}, []);

	const handleSubmit = useCallback(() => {
		onComplete(name || "The Duke", sex, age, selectedQuirks);
	}, [name, sex, age, selectedQuirks, onComplete]);

	return (
		<div className="fixed inset-0 flex flex-col bg-bg">
			{/* Header bar */}
			<div className="flex shrink-0 items-center gap-2.5 border-b border-border bg-surface px-3.5 py-2.5">
				<span className="flex-1 text-[15px] font-bold text-orange">
					{"🎸"} Fear &amp; Loathing Trail
				</span>
			</div>

			{/* Scrollable content */}
			<div className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4">
				{/* Title */}
				<div className="py-4 text-center">
					<h1 className="text-[22px] font-bold text-orange">WHO ARE YOU, MAN?</h1>
					<p className="mt-1 text-[12px] text-dim">
						Craft your identity before the ether wears off.
					</p>
				</div>

				{/* Name */}
				<div>
					<div className="mb-1.5 text-[11px] uppercase tracking-wider text-dim">Name</div>
					<input
						type="text"
						placeholder="Raoul Duke..."
						maxLength={20}
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full rounded-lg border border-border bg-surface2 p-3 font-mono text-base text-text outline-none focus:border-orange"
					/>
				</div>

				{/* Sex */}
				<div>
					<div className="mb-1.5 text-[11px] uppercase tracking-wider text-dim">Sex</div>
					<div className="grid grid-cols-3 gap-2">
						{(
							[
								{ val: "male" as const, label: "♂️ Male" },
								{ val: "female" as const, label: "♀️ Female" },
								{ val: "other" as const, label: "⚧️ Other" },
							] as const
						).map((opt) => (
							<button
								type="button"
								key={opt.val}
								onClick={() => setSex(opt.val)}
								className={`rounded-lg border-2 bg-surface2 py-3 font-mono text-[13px] transition-all ${
									sex === opt.val ? "border-orange text-orange" : "border-border text-dim"
								}`}
							>
								{opt.label}
							</button>
						))}
					</div>
				</div>

				{/* Age */}
				<div>
					<div className="mb-1.5 text-[11px] uppercase tracking-wider text-dim">Age</div>
					<div className="grid grid-cols-2 gap-2">
						{(
							[
								{ val: "young" as const, label: "👶 Young (18-25)" },
								{ val: "adult" as const, label: "🧔 Adult (26-40)" },
								{ val: "middle" as const, label: "🧓 Middle (41-55)" },
								{ val: "old" as const, label: "👴 Old (56+)" },
							] as const
						).map((opt) => (
							<button
								type="button"
								key={opt.val}
								onClick={() => setAge(opt.val)}
								className={`rounded-lg border-2 bg-surface2 py-2.5 font-mono text-[12px] text-center transition-all ${
									age === opt.val ? "border-yellow text-yellow" : "border-border text-dim"
								}`}
							>
								{opt.label}
							</button>
						))}
					</div>
				</div>

				{/* Avatar preview */}
				<div>
					<div className="mb-1.5 text-[11px] uppercase tracking-wider text-dim">Avatar Preview</div>
					<div className="flex justify-center py-2">
						<Avatar
							player={{ name, sex, age, quirks: selectedQuirks }}
							className="h-[135px] w-[90px]"
						/>
					</div>
				</div>

				{/* Quirks */}
				<div>
					<div className="mb-1.5 text-[11px] uppercase tracking-wider text-dim">
						Quirks (pick any)
					</div>
					<div className="grid grid-cols-3 gap-1.5">
						{QUIRKS.map((q) => (
							<button
								type="button"
								key={q.id}
								onClick={() => toggleQuirk(q.id)}
								className={`flex flex-col items-center gap-0.5 rounded-lg border-2 bg-surface2 px-1 py-2 font-mono transition-all ${
									selectedQuirks.includes(q.id)
										? "border-purple text-purple"
										: "border-border text-dim"
								}`}
							>
								<span className="text-[18px]">{q.icon}</span>
								<span className="text-[10px] leading-tight">{q.label}</span>
							</button>
						))}
					</div>
				</div>

				<div className="h-2" />

				{/* Submit button */}
				<button
					type="button"
					onClick={handleSubmit}
					className="w-full rounded-lg bg-orange p-3.5 text-base font-bold tracking-wide text-black active:opacity-75"
				>
					HIT THE ROAD {"🏎️"}
				</button>

				<div className="h-20" />
			</div>
		</div>
	);
}
