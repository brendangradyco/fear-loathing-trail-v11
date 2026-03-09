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
 */
export function parseMessage(data: unknown): MessageType | null {
	if (!data || typeof data !== "object" || !("type" in data)) return null;
	const msg = data as Record<string, unknown>;
	if (typeof msg.type !== "string" || !VALID_TYPES.has(msg.type)) return null;
	return data as MessageType;
}
