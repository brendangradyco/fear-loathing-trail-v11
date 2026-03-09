import { useCallback, useEffect, useState } from "react";
import CharCreate from "./components/screens/CharCreate";
import DeathScreen from "./components/screens/DeathScreen";
import GameMap from "./components/screens/GameMap";
import HuntGame from "./components/screens/HuntGame";
import Lobby from "./components/screens/Lobby";
import LocationSelect from "./components/screens/LocationSelect";
import Shop from "./components/screens/Shop";
import SkillReview from "./components/screens/SkillReview";
import WinScreen from "./components/screens/WinScreen";
import ToastContainer from "./components/shared/Toast";
import ChatPanel from "./components/social/ChatPanel";
import VideoOverlay from "./components/social/VideoOverlay";
import { loadGame, useGameStore } from "./stores/gameStore";
import { useNetworkStore } from "./stores/networkStore";
import { usePlayerStore } from "./stores/playerStore";
import type { Age, Sex } from "./types";
import { Phase, type Region } from "./types";

type Screen =
	| "loading"
	| "char"
	| "location"
	| "skills"
	| "lobby"
	| "shop"
	| "map"
	| "hunt"
	| "dead"
	| "win";

export default function App() {
	const [screen, setScreen] = useState<Screen>("loading");
	const [isFirstShopVisit, setIsFirstShopVisit] = useState(true);

	const playerData = usePlayerStore((s) => s.data);
	const playerId = usePlayerStore((s) => s.id);
	const createCharacter = usePlayerStore((s) => s.createCharacter);
	const loadSavedPlayer = usePlayerStore((s) => s.loadSavedPlayer);
	const resetPlayer = usePlayerStore((s) => s.reset);

	const gameState = useGameStore((s) => s.state);
	const deathReason = useGameStore((s) => s.deathReason);
	const startGame = useGameStore((s) => s.startGame);
	const resumeGame = useGameStore((s) => s.resumeGame);
	const resetGame = useGameStore((s) => s.resetGame);

	const setRoomId = useNetworkStore((s) => s.setRoomId);
	const setHost = useNetworkStore((s) => s.setHost);
	const setStatus = useNetworkStore((s) => s.setStatus);

	// Init: check for saved player on mount
	useEffect(() => {
		const saved = loadSavedPlayer();
		if (saved) {
			// Check for existing game state
			const savedGame = loadGame();
			if (savedGame) {
				resumeGame(savedGame, playerId, saved.name);
				// Route based on game phase
				if (savedGame.phase === Phase.DEAD) {
					setScreen("dead");
				} else if (savedGame.phase === Phase.WIN) {
					setScreen("win");
				} else {
					setScreen("map");
					setIsFirstShopVisit(false);
				}
			} else {
				setScreen("lobby");
			}
		} else {
			setScreen("char");
		}

		// Generate room code
		const hash = window.location.hash.replace("#", "");
		const code =
			hash && hash.length >= 4
				? hash.toUpperCase()
				: Math.random().toString(36).slice(2, 8).toUpperCase();
		if (!hash || hash.length < 4) {
			window.location.hash = code;
		}
		setRoomId(code);
		setHost(true);
		setStatus("connected");
	}, [loadSavedPlayer, playerId, resumeGame, setHost, setRoomId, setStatus]); // eslint-disable-line react-hooks/exhaustive-deps

	// Watch game phase changes for death/win routing
	useEffect(() => {
		if (!gameState) return;
		if (gameState.phase === Phase.DEAD && screen !== "dead") {
			setScreen("dead");
		} else if (gameState.phase === Phase.WIN && screen !== "win") {
			setScreen("win");
		}
	}, [gameState?.phase, gameState, screen]); // eslint-disable-line react-hooks/exhaustive-deps

	// Character creation complete
	const handleCharComplete = useCallback((name: string, sex: Sex, age: Age, quirks: string[]) => {
		// Store pending char data, go to location select
		window.__pendingChar = { name, sex, age, quirks };
		setScreen("location");
	}, []);

	// Location selected
	const handleLocationComplete = useCallback(
		(region: Region) => {
			const pending = window.__pendingChar;
			if (pending) {
				createCharacter(pending.name, pending.sex, pending.age, pending.quirks, region);
				delete window.__pendingChar;
			}
			setScreen("skills");
		},
		[createCharacter],
	);

	// Skills accepted
	const handleSkillsComplete = useCallback(() => {
		setScreen("lobby");
	}, []);

	// Lobby → start game (go to shop first)
	const handleStartGame = useCallback(() => {
		if (!playerData) return;
		startGame(playerId, playerData.name, playerData.skills);
		setScreen("shop");
		setIsFirstShopVisit(true);
	}, [playerData, playerId, startGame]);

	// Leave shop
	const handleShopLeave = useCallback(() => {
		setScreen("map");
		setIsFirstShopVisit(false);
	}, []);

	// Enter shop from map
	const handleShopOpen = useCallback(() => {
		setScreen("shop");
		setIsFirstShopVisit(false);
	}, []);

	// Hunt start
	const handleHuntStart = useCallback(() => {
		setScreen("hunt");
	}, []);

	// Hunt end
	const handleHuntEnd = useCallback(() => {
		setScreen("map");
	}, []);

	// Restart
	const handleRestart = useCallback(() => {
		resetGame();
		resetPlayer();
		setScreen("char");
	}, [resetGame, resetPlayer]);

	// Determine whether to show overlays
	const showOverlays =
		screen === "map" || screen === "shop" || screen === "hunt" || screen === "lobby";

	return (
		<>
			{/* Active screen */}
			{screen === "loading" && (
				<div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-bg">
					<div className="h-10 w-10 animate-spin rounded-full border-3 border-border border-t-orange" />
					<h2 className="font-bold text-orange">We can&apos;t stop here...</h2>
					<p className="text-[12px] text-dim">this is bat country</p>
				</div>
			)}

			{screen === "char" && <CharCreate onComplete={handleCharComplete} />}

			{screen === "location" && <LocationSelect onComplete={handleLocationComplete} />}

			{screen === "skills" && <SkillReview onComplete={handleSkillsComplete} />}

			{screen === "lobby" && <Lobby onStartGame={handleStartGame} />}

			{screen === "shop" && <Shop onLeave={handleShopLeave} isFirstVisit={isFirstShopVisit} />}

			{screen === "map" && <GameMap onShop={handleShopOpen} onHunt={handleHuntStart} />}

			{screen === "hunt" && <HuntGame onEnd={handleHuntEnd} />}

			{screen === "dead" && <DeathScreen reason={deathReason} onRestart={handleRestart} />}

			{screen === "win" && <WinScreen onRestart={handleRestart} />}

			{/* Overlays */}
			{showOverlays && (
				<>
					<VideoOverlay />
					<ChatPanel />
				</>
			)}

			{/* Toast notifications */}
			<ToastContainer />
		</>
	);
}

// Type augmentation for temp char storage during multi-step creation
declare global {
	interface Window {
		__pendingChar?: {
			name: string;
			sex: Sex;
			age: Age;
			quirks: string[];
		};
	}
}
