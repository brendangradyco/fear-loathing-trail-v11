import { useNetworkStore } from "../stores/networkStore";
import { peerManager } from "./peerManager";

/**
 * Camera and microphone management for video chat.
 * Interacts with networkStore for state and peerManager for WebRTC calls.
 */

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
	facingMode: "user",
	width: { ideal: 640 },
	height: { ideal: 480 },
};

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
	echoCancellation: true,
	noiseSuppression: true,
};

/**
 * Start the camera and microphone.
 * Audio is muted by default until the user unmutes.
 */
export async function startCamera(): Promise<MediaStream | null> {
	const net = useNetworkStore.getState();
	if (net.localStream) return net.localStream;

	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: VIDEO_CONSTRAINTS,
			audio: AUDIO_CONSTRAINTS,
		});

		// Mute audio by default
		for (const track of stream.getAudioTracks()) {
			track.enabled = false;
		}

		net.setLocalStream(stream);

		// Call all connected peers
		for (const pid of Object.keys(peerManager.conns)) {
			peerManager.callPeer(pid);
		}

		return stream;
	} catch (err) {
		console.warn("Camera not available:", err);
		return null;
	}
}

/**
 * Stop the camera — releases all tracks and clears the stream.
 */
export function stopCamera(): void {
	const net = useNetworkStore.getState();
	const stream = net.localStream;

	if (stream) {
		for (const track of stream.getTracks()) {
			track.stop();
		}
	}

	net.setLocalStream(null);
}

/**
 * Toggle microphone mute/unmute.
 * If no stream exists, starts the camera first.
 */
export async function toggleMic(): Promise<void> {
	const net = useNetworkStore.getState();

	if (!net.localStream) {
		const stream = await startCamera();
		if (stream) {
			// Unmute after starting — user explicitly wanted mic
			for (const track of stream.getAudioTracks()) {
				track.enabled = true;
			}
			// Update store — startCamera left it muted
			useNetworkStore.setState({ micMuted: false });
		}
		return;
	}

	// Toggle via the store (which also flips track.enabled)
	net.toggleMic();
}

/**
 * Toggle camera on/off.
 * If no stream exists, starts the camera.
 * If stream exists, toggles video tracks.
 */
export async function toggleCam(): Promise<void> {
	const net = useNetworkStore.getState();

	if (!net.localStream) {
		await startCamera();
		return;
	}

	// If camera is on, stop all tracks entirely
	if (net.camOn) {
		stopCamera();
	} else {
		await startCamera();
	}
}
