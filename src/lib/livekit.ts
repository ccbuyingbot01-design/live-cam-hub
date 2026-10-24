import { AccessToken } from "livekit-server-sdk";

/**
 * LiveKit project credentials.
 *
 * V1 mints join tokens in the browser so the app runs with zero backend
 * configuration, which means the API secret ships in the client bundle.
 * Every value can be overridden with a `VITE_LIVEKIT_*` env var, so moving
 * token minting behind a Convex action later does not require touching call
 * sites.
 */
const env = import.meta.env as Record<string, string | undefined>;

export const LIVEKIT_SERVER_URL =
  env.VITE_LIVEKIT_SERVER_URL ?? "wss://live-cam-g2een99y.livekit.cloud";
export const LIVEKIT_API_KEY = env.VITE_LIVEKIT_API_KEY ?? "APIoUizemAhL4XR";
export const LIVEKIT_API_SECRET =
  env.VITE_LIVEKIT_API_SECRET ??
  "OmqL8hsDwstYmL4s4ObjoEs0ox32DsoSx910q24wyCM";

/** How long a join token stays valid. Long enough for a long session. */
const TOKEN_TTL_SECONDS = 60 * 60 * 6;

/** LiveKit keys rooms on this, so keep it short, lowercase and URL-safe. */
export function toLiveKitRoomName(slug: string) {
  return `cam-${slug}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 64);
}

/**
 * Participant identities must be unique inside a room. Two tabs of the same
 * user get distinct identities so one does not evict the other.
 */
export function makeParticipantIdentity(seed: string) {
  const suffix = Math.random().toString(36).slice(2, 8);
  const safe = `cam_${seed}_${suffix}`.replace(/[^a-zA-Z0-9_-]/g, "");
  return (safe || `cam_guest_${suffix}`).slice(0, 64);
}

export async function createJoinToken(options: {
  roomSlug: string;
  identity: string;
  displayName: string;
}): Promise<string> {
  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: options.identity,
    name: options.displayName.slice(0, 64),
    ttl: TOKEN_TTL_SECONDS,
  });

  token.addGrant({
    roomJoin: true,
    room: toLiveKitRoomName(options.roomSlug),
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  });

  return await token.toJwt();
}

/* ------------------------------------------------------------------ *
 * Local media permission helpers
 * ------------------------------------------------------------------ */

export type PermissionFailure =
  | "unsupported"
  | "denied"
  | "not-found"
  | "in-use"
  | "unknown";

export const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: "user",
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

export function supportsUserMedia() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

/** Turn a `getUserMedia` rejection into something we can show the user. */
export function describeMediaError(error: unknown): PermissionFailure {
  const name = (error as { name?: string } | null)?.name ?? "";
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return "denied";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "not-found";
    case "NotReadableError":
    case "TrackStartError":
    case "AbortError":
      return "in-use";
    default:
      return "unknown";
  }
}
