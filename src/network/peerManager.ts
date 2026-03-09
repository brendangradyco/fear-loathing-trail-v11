import type { DataConnection, MediaConnection } from "peerjs";
import { Peer } from "peerjs";
import { CFG } from "../data/constants";
import { useGameStore } from "../stores/gameStore";
import { useNetworkStore } from "../stores/networkStore";
import { usePlayerStore } from "../stores/playerStore";
import type { GameState, MessageType, PlayerData } from "../types";
import { parseMessage } from "./messageProtocol";

const CONNECT_TIMEOUT = 12_000;
const JOIN_TIMEOUT = 10_000;

/**
 * PeerManager wraps PeerJS to provide host/guest multiplayer networking.
 *
 * Host claims a deterministic peer ID based on the room code.
 * Guests get a random ID and connect to the host.
 * The host introduces peers to each other via MEET messages (mesh topology).
 */
class PeerManager {
	peer: Peer | null = null;
	conns: Record<string, DataConnection> = {};
	calls: Record<string, MediaConnection> = {};

	/** Whether the peer has been initialized and is ready for connections */
	get ready(): boolean {
		return this.peer?.open ?? false;
	}

	// -----------------------------------------------------------
	// Room code
	// -----------------------------------------------------------

	getRoomCode(): string {
		const hash = window.location.hash.replace("#", "");
		if (hash && hash.length >= CFG.MIN_ROOM_CODE) return hash.toUpperCase();
		const code = Math.random().toString(36).slice(2, 8).toUpperCase();
		window.location.hash = code;
		return code;
	}

	// -----------------------------------------------------------
	// Lifecycle
	// -----------------------------------------------------------

	async init(): Promise<void> {
		const code = this.getRoomCode();
		const net = useNetworkStore.getState();
		net.setRoomId(code);
		net.setStatus("connecting");

		const hostId = CFG.PEER_PREFIX + code;

		try {
			// Try to claim the host slot
			await this._createPeer(hostId);
			net.setHost(true);
			net.setStatus("connected");
		} catch {
			// Host slot taken — join as guest with a random ID
			await this._createPeer(null);
			net.setHost(false);
			await this._connectToHost(hostId);
		}

		this._listenIncoming();
	}

	destroy(): void {
		for (const conn of Object.values(this.conns)) {
			try {
				conn.close();
			} catch {
				/* ignore */
			}
		}
		for (const call of Object.values(this.calls)) {
			try {
				call.close();
			} catch {
				/* ignore */
			}
		}
		this.conns = {};
		this.calls = {};

		if (this.peer) {
			try {
				this.peer.destroy();
			} catch {
				/* ignore */
			}
			this.peer = null;
		}

		useNetworkStore.getState().reset();
	}

	// -----------------------------------------------------------
	// Peer creation
	// -----------------------------------------------------------

	private _createPeer(id: string | null): Promise<Peer> {
		return new Promise((resolve, reject) => {
			const p = id ? new Peer(id) : new Peer();
			let settled = false;

			const done = (ok: boolean, value: unknown) => {
				if (settled) return;
				settled = true;
				if (ok) resolve(value as Peer);
				else reject(value);
			};

			p.on("open", () => {
				this.peer = p;
				done(true, p);
			});
			p.on("error", (err) => {
				// 'unavailable-id' means host slot is taken
				done(false, err);
			});

			setTimeout(() => done(false, new Error("PeerJS timeout")), CONNECT_TIMEOUT);
		});
	}

	// -----------------------------------------------------------
	// Guest: connect to host
	// -----------------------------------------------------------

	private _connectToHost(hostId: string): Promise<void> {
		const player = usePlayerStore.getState();

		return new Promise((resolve, reject) => {
			if (!this.peer) {
				reject(new Error("No peer instance"));
				return;
			}

			const conn = this.peer.connect(hostId, {
				reliable: true,
				metadata: { pid: player.id, player: player.data },
			});

			conn.on("open", () => {
				this._setupDataConn(conn);
				const msg: MessageType = {
					type: "HELLO",
					pid: player.id,
					player: player.data!,
				};
				conn.send(msg);
				useNetworkStore.getState().setStatus("connected");
				resolve();
			});

			conn.on("error", (err) => reject(err));
			setTimeout(() => reject(new Error("Connect timeout")), JOIN_TIMEOUT);
		});
	}

	// -----------------------------------------------------------
	// Incoming connections
	// -----------------------------------------------------------

	private _listenIncoming(): void {
		if (!this.peer) return;

		this.peer.on("connection", (conn) => {
			conn.on("open", () => {
				this._setupDataConn(conn);

				if (useNetworkStore.getState().isHost) {
					// Send WELCOME with current player list and game state
					const players: Record<string, PlayerData> = {};
					const localPlayer = usePlayerStore.getState();
					if (localPlayer.data) {
						players[localPlayer.id] = localPlayer.data;
					}
					for (const [pid, info] of Object.entries(useNetworkStore.getState().peers)) {
						players[pid] = info.player;
					}

					const game = useGameStore.getState().state ?? undefined;
					const welcome: MessageType = { type: "WELCOME", players, game };
					conn.send(welcome);

					// Tell everyone about the new player
					const meta = conn.metadata as { pid?: string; player?: PlayerData } | undefined;
					if (meta?.pid && meta?.player) {
						const joined: MessageType = {
							type: "PLAYER_JOINED",
							pid: meta.pid,
							player: meta.player,
						};
						this.broadcast(joined);
					}

					// Mesh: introduce the new peer to all existing peers
					for (const existPid of Object.keys(this.conns)) {
						if (existPid !== conn.peer) {
							const meetNew: MessageType = { type: "MEET", peerId: existPid };
							conn.send(meetNew);
							const meetExist: MessageType = { type: "MEET", peerId: conn.peer };
							this.conns[existPid]?.send(meetExist);
						}
					}
				}
			});
		});

		// Answer incoming media calls
		this.peer.on("call", (call) => {
			const localStream = useNetworkStore.getState().localStream;
			call.answer(localStream ?? undefined);
			call.on("stream", (_stream) => {
				// Media stream handling is done by UI components
			});
			call.on("close", () => {
				delete this.calls[call.peer];
			});
			this.calls[call.peer] = call;
		});

		// Auto-reconnect on disconnect
		this.peer.on("disconnected", () => {
			useNetworkStore.getState().setStatus("connecting");
			setTimeout(() => {
				try {
					this.peer?.reconnect();
				} catch {
					/* ignore */
				}
			}, 3000);
		});

		this.peer.on("error", (err) => {
			console.warn("PeerJS:", err.type, err.message);
		});
	}

	// -----------------------------------------------------------
	// Data connection setup
	// -----------------------------------------------------------

	private _setupDataConn(conn: DataConnection): void {
		const pid = conn.peer;
		this.conns[pid] = conn;

		conn.on("data", (data) => this._handleMsg(pid, data));

		conn.on("close", () => {
			delete this.conns[pid];
			useNetworkStore.getState().removePeer(pid);

			// Broadcast departure if we're the host
			if (useNetworkStore.getState().isHost) {
				const left: MessageType = { type: "PLAYER_LEFT", pid };
				this.broadcast(left);
			}
		});

		conn.on("error", (err) => console.warn("conn error:", err));
	}

	// -----------------------------------------------------------
	// Message handling
	// -----------------------------------------------------------

	private _handleMsg(from: string, data: unknown): void {
		const msg = parseMessage(data);
		if (!msg) return;

		const net = useNetworkStore.getState();
		const player = usePlayerStore.getState();

		switch (msg.type) {
			case "HELLO": {
				net.addPeer(msg.pid || from, {
					name: msg.player.name,
					player: msg.player,
				});

				if (net.isHost) {
					const joined: MessageType = {
						type: "PLAYER_JOINED",
						pid: msg.pid || from,
						player: msg.player,
					};
					this.broadcast(joined);
				}

				net.addChatMessage({
					sender: "system",
					senderName: "System",
					text: `${msg.player.name} joined the convoy!`,
					system: true,
				});
				break;
			}

			case "WELCOME": {
				// Populate peer list from host's player data
				if (msg.players) {
					for (const [pid, pd] of Object.entries(msg.players)) {
						if (pid !== player.id) {
							net.addPeer(pid, { name: pd.name, player: pd });
						}
					}
				}

				// Sync game state if a game is in progress
				if (msg.game) {
					useGameStore.getState().syncFromNetwork(msg.game);
				}
				break;
			}

			case "PLAYER_JOINED": {
				if (msg.pid && msg.player) {
					net.addPeer(msg.pid, {
						name: msg.player.name,
						player: msg.player,
					});
				}
				net.addChatMessage({
					sender: "system",
					senderName: "System",
					text: `${msg.player?.name ?? "Someone"} joined the convoy!`,
					system: true,
				});
				break;
			}

			case "PLAYER_LEFT": {
				net.removePeer(msg.pid);
				net.addChatMessage({
					sender: "system",
					senderName: "System",
					text: "A player left the convoy.",
					system: true,
				});
				break;
			}

			case "MEET": {
				// Connect directly to this peer for mesh networking
				const meetPeerId = msg.peerId;
				if (meetPeerId && meetPeerId !== player.id && !this.conns[meetPeerId] && this.peer) {
					const conn = this.peer.connect(meetPeerId, {
						reliable: true,
						metadata: { pid: player.id, player: player.data },
					});
					conn.on("open", () => {
						this._setupDataConn(conn);
						const hello: MessageType = {
							type: "HELLO",
							pid: player.id,
							player: player.data!,
						};
						conn.send(hello);

						// If we have a local stream, call this peer
						if (net.localStream) {
							this.callPeer(meetPeerId);
						}
					});
				}
				break;
			}

			case "GAME_STATE": {
				if (msg.game) {
					useGameStore.getState().syncFromNetwork(msg.game);
				}
				break;
			}

			case "CHAT": {
				net.addChatMessage({
					sender: msg.sender,
					senderName: msg.senderName,
					text: msg.text,
				});
				break;
			}

			case "CHAT_SYS": {
				net.addChatMessage({
					sender: "system",
					senderName: "System",
					text: msg.text,
					system: true,
				});
				break;
			}
		}
	}

	// -----------------------------------------------------------
	// Sending
	// -----------------------------------------------------------

	broadcast(msg: MessageType): void {
		for (const conn of Object.values(this.conns)) {
			if (conn.open) {
				try {
					conn.send(msg);
				} catch {
					/* ignore */
				}
			}
		}
	}

	broadcastGameState(): void {
		const game = useGameStore.getState().state;
		if (!game) return;
		const msg: MessageType = { type: "GAME_STATE", game };
		this.broadcast(msg);
	}

	sendChat(text: string): void {
		const player = usePlayerStore.getState();
		const name = player.data?.name ?? "Unknown";
		const msg: MessageType = {
			type: "CHAT",
			text,
			sender: player.id,
			senderName: name,
		};
		this.broadcast(msg);

		// Add to local chat too
		useNetworkStore.getState().addChatMessage({
			sender: player.id,
			senderName: name,
			text,
		});
	}

	broadcastSystemChat(text: string): void {
		const msg: MessageType = { type: "CHAT_SYS", text };
		this.broadcast(msg);
		useNetworkStore.getState().addChatMessage({
			sender: "system",
			senderName: "System",
			text,
			system: true,
		});
	}

	// -----------------------------------------------------------
	// Media calls
	// -----------------------------------------------------------

	callPeer(peerId: string): void {
		const stream = useNetworkStore.getState().localStream;
		if (!stream || this.calls[peerId] || !this.peer) return;
		const call = this.peer.call(peerId, stream);
		if (!call) return;
		call.on("stream", (_remoteStream) => {
			// Handled by UI components
		});
		call.on("close", () => {
			delete this.calls[peerId];
		});
		this.calls[peerId] = call;
	}
}

/** Singleton PeerManager instance */
export const peerManager = new PeerManager();

/** Initialize networking — call once from a component or effect */
export async function initNetwork(): Promise<void> {
	await peerManager.init();
}

/** Broadcast game state to all peers — call after game state changes */
export function broadcastState(state: GameState): void {
	const msg: MessageType = { type: "GAME_STATE", game: state };
	peerManager.broadcast(msg);
}
