import { useCallback, useEffect } from "react";
import { create } from "zustand";

interface ToastItem {
	id: number;
	message: string;
	bad?: boolean;
}

interface ToastStore {
	toasts: ToastItem[];
	nextId: number;
	addToast: (message: string, bad?: boolean) => void;
	removeToast: (id: number) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
	toasts: [],
	nextId: 0,
	addToast: (message, bad = false) => {
		const id = get().nextId;
		set((s) => ({
			toasts: [...s.toasts, { id, message, bad }],
			nextId: id + 1,
		}));
	},
	removeToast: (id) => {
		set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
	},
}));

export function toast(message: string, bad = false) {
	useToastStore.getState().addToast(message, bad);
}

function ToastItem({ item }: { item: ToastItem }) {
	const removeToast = useToastStore((s) => s.removeToast);

	useEffect(() => {
		const timer = setTimeout(() => {
			removeToast(item.id);
		}, 3500);
		return () => clearTimeout(timer);
	}, [item.id, removeToast]);

	return (
		<div
			className={`animate-toast-in rounded-full border bg-surface2 px-5 py-2.5 text-[13px] text-text ${
				item.bad ? "border-red" : "border-orange"
			} max-w-[90vw] overflow-hidden text-ellipsis whitespace-nowrap`}
		>
			{item.message}
		</div>
	);
}

export default function ToastContainer() {
	const toasts = useToastStore((s) => s.toasts);

	const renderToast = useCallback((t: ToastItem) => <ToastItem key={t.id} item={t} />, []);

	if (toasts.length === 0) return null;

	return (
		<div className="pointer-events-none fixed bottom-[60px] left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-1.5">
			{toasts.map(renderToast)}
		</div>
	);
}
