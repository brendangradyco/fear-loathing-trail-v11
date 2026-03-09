import { useCallback } from "react";
import { DRUG_SHOP, SUPPLY_SHOP } from "../../data/shops";
import { useGameStore } from "../../stores/gameStore";
import type { ShopItem } from "../../types";
import { toast } from "../shared/Toast";

interface ShopProps {
	onLeave: () => void;
	isFirstVisit?: boolean;
}

export default function Shop({ onLeave, isFirstVisit = false }: ShopProps) {
	const cash = useGameStore((s) => s.state?.cash ?? 0);
	const doBuyItem = useGameStore((s) => s.doBuyItem);

	const allItems = [...DRUG_SHOP, ...SUPPLY_SHOP];

	const handleBuy = useCallback(
		(item: ShopItem) => {
			const ok = doBuyItem(item);
			if (ok) {
				toast(`${item.name} acquired!`);
			} else {
				toast("Not enough cash", true);
			}
		},
		[doBuyItem],
	);

	return (
		<div className="fixed inset-0 flex flex-col bg-bg">
			{/* Header */}
			<div className="flex shrink-0 items-center gap-2.5 border-b border-border bg-surface px-3.5 py-2.5">
				<span className="flex-1 text-[15px] font-bold text-orange">{"💊"} THE STASH</span>
				<div className="text-sm font-bold text-yellow">${cash}</div>
			</div>

			{/* Items */}
			<div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3.5">
				{allItems.map((item) => (
					<div
						key={item.id}
						className="flex items-center gap-2.5 rounded-lg border border-border bg-surface2 px-3 py-2.5"
					>
						<div className="min-w-0 flex-1">
							<div className="font-bold text-orange">{item.name}</div>
							<div className="mt-0.5 text-[11px] text-dim">{item.desc}</div>
						</div>
						<div className="min-w-[52px] text-right font-bold text-yellow">${item.price}</div>
						<button
							type="button"
							onClick={() => handleBuy(item)}
							disabled={cash < item.price}
							className="shrink-0 rounded-md bg-orange px-3.5 py-2 text-[13px] font-bold text-black disabled:opacity-40"
						>
							Buy
						</button>
					</div>
				))}

				<div className="h-2" />

				<button
					type="button"
					onClick={onLeave}
					className={`w-full rounded-lg p-3.5 text-base font-bold active:opacity-75 ${
						isFirstVisit ? "bg-green text-black" : "border border-orange bg-transparent text-orange"
					}`}
				>
					{isFirstVisit ? "HIT THE TRAIL 🚗" : "← Back to Trail"}
				</button>

				<div className="h-20" />
			</div>
		</div>
	);
}
