import { create } from "zustand";
import type { PlayerData } from "../types";

interface ChatMessage {
	sender: string;
	senderName: string;
	text: string;
	system?: boolean;
}

interface PeerInfo {
	name: string;
	player: PlayerData;
}

interface NetworkStore {
	roomId: string | null;
	isHost: boolean;
	status: "disconnected" | "connecting" | "connected" | "error";
	peers: Record<string, PeerInfo>;
	localStream: MediaStream | null;
	micMuted: boolean;
	camOn: boolean;
	chatMessages: ChatMessage[];
	chatBadge: number;
	chatOpen: boolean;

	setRoomId: (roomId: string | null) => void;
	setHost: (isHost: boolean) => void;
	setStatus: (status: NetworkStore["status"]) => void;
	addPeer: (id: string, info: PeerInfo) => void;
	removePeer: (id: string) => void;
	setLocalStream: (stream: MediaStream | null) => void;
	toggleMic: () => void;
	toggleCam: () => void;
	addChatMessage: (msg: ChatMessage) => void;
	toggleChat: () => void;
	clearBadge: () => void;
	reset: () => void;
}

export const useNetworkStore = create<NetworkStore>((set, get) => ({
	roomId: null,
	isHost: false,
	status: "disconnected",
	peers: {},
	localStream: null,
	micMuted: false,
	camOn: true,
	chatMessages: [],
	chatBadge: 0,
	chatOpen: false,

	setRoomId: (roomId) => {
		set({ roomId });
	},

	setHost: (isHost) => {
		set({ isHost });
	},

	setStatus: (status) => {
		set({ status });
	},

	addPeer: (id, info) => {
		set((s) => ({ peers: { ...s.peers, [id]: info } }));
	},

	removePeer: (id) => {
		set((s) => {
			const { [id]: _, ...rest } = s.peers;
			void _;
			return { peers: rest };
		});
	},

	setLocalStream: (stream) => {
		set({ localStream: stream });
	},

	toggleMic: () => {
		const { localStream, micMuted } = get();
		if (localStream) {
			for (const track of localStream.getAudioTracks()) {
				track.enabled = micMuted; // flip: was muted -> now unmuted
			}
		}
		set({ micMuted: !micMuted });
	},

	toggleCam: () => {
		const { localStream, camOn } = get();
		if (localStream) {
			for (const track of localStream.getVideoTracks()) {
				track.enabled = !camOn; // flip: was on -> now off
			}
		}
		set({ camOn: !camOn });
	},

	addChatMessage: (msg) => {
		set((s) => ({
			chatMessages: [...s.chatMessages, msg],
			chatBadge: s.chatOpen ? s.chatBadge : s.chatBadge + 1,
		}));
	},

	toggleChat: () => {
		const { chatOpen } = get();
		set({ chatOpen: !chatOpen, chatBadge: chatOpen ? get().chatBadge : 0 });
	},

	clearBadge: () => {
		set({ chatBadge: 0 });
	},

	reset: () => {
		set({
			roomId: null,
			isHost: false,
			status: "disconnected",
			peers: {},
			localStream: null,
			micMuted: false,
			camOn: true,
			chatMessages: [],
			chatBadge: 0,
			chatOpen: false,
		});
	},
}));
