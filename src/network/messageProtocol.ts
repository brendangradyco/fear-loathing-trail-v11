import type { MessageType } from "../types";

const VALID_TYPES = new Set([
	"HELLO",
	"WELCOME",
	"PLAYER_JOINED",
	"PLAYER_LEFT",
	"MEET",
	"GAME_STATE",
	"CHAT",
	"CHAT_SYS",
]);

/**
 * Validates and parses an incoming PeerJS data message.
 * Returns a typed MessageType if valid, null otherwise.
 * Validates required fields per message type to prevent crashes from malformed data.
 */
export function parseMessage(data: unknown): MessageType | null {
	if (!data || typeof data !== "object" || !("type" in data)) return null;
	const msg = data as Record<string, unknown>;
	if (typeof msg.type !== "string" || !VALID_TYPES.has(msg.type)) return null;

	// Validate required fields per message type
	switch (msg.type) {
		case "HELLO":
		case "PLAYER_JOINED":
			if (!msg.player || typeof msg.player !== "object") return null;
			if (typeof (msg.player as Record<string, unknown>).name !== "string") return null;
			break;
		case "WELCOME":
			if (!msg.players || typeof msg.players !== "object") return null;
			break;
		case "PLAYER_LEFT":
			if (typeof msg.pid !== "string") return null;
			break;
		case "MEET":
			if (typeof msg.peerId !== "string") return null;
			break;
		case "GAME_STATE":
			if (!msg.game || typeof msg.game !== "object") return null;
			break;
		case "CHAT":
			if (typeof msg.text !== "string" || typeof msg.sender !== "string") return null;
			break;
		case "CHAT_SYS":
			if (typeof msg.text !== "string") return null;
			break;
	}

	return data as MessageType;
}
