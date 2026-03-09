interface WinScreenProps {
	onRestart: () => void;
}

export default function WinScreen({ onRestart }: WinScreenProps) {
	return (
		<div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-bg p-8">
			<h1 className="text-center text-[28px] font-bold text-yellow">
				{"🏆"} ANCHORAGE!
			</h1>
			<p className="text-center text-[13px] leading-relaxed text-dim">
				You made it to the end of the world. The bats are pleased.
			</p>
			<button
				onClick={onRestart}
				className="w-[200px] rounded-lg bg-orange p-3.5 text-base font-bold text-black active:opacity-75"
			>
				Play Again
			</button>
		</div>
	);
}
