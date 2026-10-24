import { NbButton } from "@/components/nb";
import { LIVEKIT_SERVER_URL } from "@/lib/livekit";
import { cn } from "@/lib/utils";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  useConnectionState,
  useLocalParticipant,
  useParticipants,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import {
  Camera,
  CameraOff,
  Check,
  Copy,
  Link2,
  LogOut,
  Mic,
  MicOff,
  Users,
} from "lucide-react";
import { MediaDeviceFailure, Track } from "livekit-client";
import { useRef, useState } from "react";

function initialsOf(name: string | undefined, fallback: string) {
  const source = (name || fallback || "").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/);
  const mark = (parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2))
    .toUpperCase();
  return mark;
}

function connectionLabel(state: string) {
  switch (state) {
    case "connected":
      return { text: "Live", tone: "bg-[var(--nb-acid)] text-foreground" };
    case "reconnecting":
      return { text: "Reconnecting", tone: "bg-[var(--nb-signal)] text-foreground" };
    case "connecting":
      return { text: "Connecting", tone: "bg-[var(--nb-sky)] text-foreground" };
    default:
      return { text: "Offline", tone: "bg-[var(--nb-signal)] text-foreground" };
  }
}

function Studio({
  slug,
  title,
  connectedOnce,
  dropped,
  fatal,
  onLeave,
}: {
  slug: string;
  title: string;
  connectedOnce: boolean;
  dropped: boolean;
  fatal: string | null;
  onLeave: () => void;
}) {
  const participants = useParticipants();
  const cameraRefs = useTracks([Track.Source.Camera]);
  const connectionState = useConnectionState();
  const {
    isCameraEnabled,
    isMicrophoneEnabled,
    localParticipant,
    lastCameraError,
    lastMicrophoneError,
  } = useLocalParticipant();

  const [copied, setCopied] = useState(false);
  const cameraByIdentity = new Map<
    string,
    (typeof cameraRefs)[number]
  >();
  for (const ref of cameraRefs) {
    cameraByIdentity.set(ref.participant.identity, ref);
  }

  const count = participants.length;
  const columns =
    count <= 1
      ? "grid-cols-1"
      : count <= 4
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const toggleMic = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch {
      /* surfaced through lastMicrophoneError */
    }
  };

  const toggleCam = async () => {
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch {
      /* surfaced through lastCameraError */
    }
  };

  const mediaError =
    lastMicrophoneError?.message ?? lastCameraError?.message;

  // The room reports "disconnected" before the first connect too, so only
  // treat it as a drop once we have actually been on air.
  const connection = connectionLabel(connectedOnce ? connectionState : "connecting");
  const blocked = dropped || (connectedOnce && connectionState === "disconnected");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ---------- header ---------- */}
      <header className="border-b-2 border-foreground bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "nb-label flex items-center gap-2 border-2 border-foreground px-2.5 py-2",
                connection.tone,
              )}
            >
              <span
                className={cn(
                  "size-2 bg-current",
                  connectionState === "connected" ? "animate-pulse" : "",
                )}
              />
              {connection.text}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base leading-tight font-black tracking-tight uppercase">
                {title}
              </p>
              <p className="nb-label mt-1 text-muted-foreground">
                Room {slug}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StartAudio
              label="Tap to enable sound"
              className="h-10 border-2 border-foreground bg-[var(--nb-acid)] px-3 text-xs font-black tracking-wide uppercase nb-shadow"
            />
            <span className="nb-label flex items-center gap-1.5 border-2 border-foreground bg-card px-2.5 py-2">
              <Users className="size-3.5" />
              {count}
            </span>
            <button
              type="button"
              onClick={copyInvite}
              className="nb-press nb-label flex items-center gap-1.5 border-2 border-foreground bg-[var(--nb-acid)] px-2.5 py-2 nb-shadow"
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Link2 className="size-3.5" />
              )}
              {copied ? "Copied" : "Invite"}
            </button>
          </div>
        </div>
      </header>

      {/* ---------- banners ---------- */}
      {(fatal || mediaError) && (
        <div className="border-b-2 border-foreground bg-[var(--nb-signal)] px-4 py-3 text-center text-sm font-bold text-foreground sm:px-6">
          {fatal ?? mediaError}
        </div>
      )}

      {/* ---------- stage ---------- */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {count === 1 && (
          <div className="mb-6 flex flex-col items-start gap-4 border-2 border-dashed border-foreground bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-black tracking-tight uppercase">
                You&apos;re on air.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Share the room code and invite link — you go live the moment
                someone else joins.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="border-2 border-foreground bg-secondary px-3 py-2.5 font-mono text-base font-black tracking-[0.25em]">
                {slug}
              </span>
              <NbButton tone="acid" onClick={copyInvite} className="h-11">
                {copied ? (
                  <>
                    <Check className="size-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4" /> Copy link
                  </>
                )}
              </NbButton>
            </div>
          </div>
        )}

        <div className={cn("grid gap-4", columns)}>
          {participants.map((participant) => {
            const trackRef = cameraByIdentity.get(participant.identity);
            const isLocal =
              participant.identity === localParticipant.identity;
            const micOn = participant.isMicrophoneEnabled;
            const label = isLocal
              ? "You"
              : participant.name || "Guest";

            return (
              <figure
                key={participant.identity}
                className={cn(
                  "relative aspect-[4/3] overflow-hidden border-2 border-foreground bg-[#0a0a0a] nb-shadow sm:aspect-video",
                  count === 1 && "max-h-[62vh]",
                )}
              >
                {trackRef ? (
                  <VideoTrack
                    trackRef={trackRef}
                    className="h-full w-full object-cover"
                    style={
                      isLocal ? { transform: "scaleX(-1)" } : undefined
                    }
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="flex size-16 items-center justify-center border-2 border-white/40 text-2xl font-black text-white/70">
                      {initialsOf(participant.name, label)}
                    </span>
                  </div>
                )}

                {!trackRef && (
                  <span className="nb-label absolute top-3 left-3 border-2 border-white bg-black/70 px-2 py-1.5 text-white">
                    Cam off
                  </span>
                )}

                <figcaption className="absolute right-0 bottom-0 left-0 flex items-center justify-between gap-2 bg-black/75 px-3 py-2.5">
                  <span className="nb-label truncate text-white">{label}</span>
                  {micOn ? (
                    <Mic className="size-4 shrink-0 text-white" />
                  ) : (
                    <MicOff className="size-4 shrink-0 text-[var(--nb-signal)]" />
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>

        {count === 0 && (
          <div className="border-2 border-dashed border-foreground/40 px-6 py-16 text-center text-sm font-bold text-muted-foreground">
            Joining the room…
          </div>
        )}
      </main>

      {/* ---------- controls ---------- */}
      <footer className="sticky bottom-0 border-t-2 border-foreground bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMic}
              aria-pressed={isMicrophoneEnabled}
              className={cn(
                "nb-press flex h-12 min-w-[7.5rem] items-center justify-center gap-2 border-2 border-foreground px-4 text-sm font-black uppercase nb-shadow",
                isMicrophoneEnabled
                  ? "bg-card"
                  : "bg-[var(--nb-signal)] text-foreground",
              )}
            >
              {isMicrophoneEnabled ? (
                <Mic className="size-5" />
              ) : (
                <MicOff className="size-5" />
              )}
              {isMicrophoneEnabled ? "Mic" : "Muted"}
            </button>

            <button
              type="button"
              onClick={toggleCam}
              aria-pressed={isCameraEnabled}
              className={cn(
                "nb-press flex h-12 min-w-[7.5rem] items-center justify-center gap-2 border-2 border-foreground px-4 text-sm font-black uppercase nb-shadow",
                isCameraEnabled
                  ? "bg-[var(--nb-acid)]"
                  : "bg-[var(--nb-signal)] text-foreground",
              )}
            >
              {isCameraEnabled ? (
                <Camera className="size-5" />
              ) : (
                <CameraOff className="size-5" />
              )}
              {isCameraEnabled ? "Cam" : "No cam"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="nb-label hidden items-center gap-1.5 text-muted-foreground sm:flex">
              <span className="size-2 bg-[var(--nb-signal)]" />
              Broadcasting
            </span>
            <NbButton
              tone="signal"
              onClick={onLeave}
              className="h-12 min-w-[7.5rem]"
            >
              <LogOut className="size-5" />
              Leave
            </NbButton>
          </div>
        </div>
      </footer>

      {/* ---------- blocked overlay ---------- */}
      {blocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/85 p-6">
          <div className="w-full max-w-md border-2 border-foreground bg-card p-7 nb-shadow-lg">
            <p className="text-2xl font-black uppercase">
              {dropped ? "Connection lost" : "Disconnected"}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The connection to this room dropped. Check your network and enter
              again — the room code stays the same.
            </p>
            <NbButton tone="ink" className="mt-6 h-12 w-full" onClick={onLeave}>
              Back to lobby
            </NbButton>
          </div>
        </div>
      )}
    </div>
  );
}

export function LiveRoom({
  token,
  slug,
  title,
  startCam,
  startMic,
  onLeave,
}: {
  token: string;
  slug: string;
  title: string;
  startCam: boolean;
  startMic: boolean;
  onLeave: () => void;
}) {
  const [dropped, setDropped] = useState(false);
  const [fatal, setFatal] = useState<string | null>(null);
  const [connectedOnce, setConnectedOnce] = useState(false);
  const leavingRef = useRef(false);

  const handleLeave = () => {
    leavingRef.current = true;
    onLeave();
  };

  return (
    <LiveKitRoom
      className="contents"
      token={token}
      serverUrl={LIVEKIT_SERVER_URL}
      connect
      audio={startMic}
      video={startCam}
      options={{ adaptiveStream: true, dynacast: true }}
      onConnected={() => {
        setConnectedOnce(true);
        setDropped(false);
        setFatal(null);
      }}
      onDisconnected={() => {
        if (!leavingRef.current) setDropped(true);
      }}
      onError={(error) => setFatal(error.message)}
      onMediaDeviceFailure={(failure, kind) => {
        const label =
          kind === "videoinput"
            ? "Camera"
            : kind === "audioinput"
              ? "Microphone"
              : "Media device";
        if (failure === MediaDeviceFailure.PermissionDenied) {
          setFatal(
            `${label} permission was revoked. Allow it again in your browser and rejoin.`,
          );
        } else if (failure === MediaDeviceFailure.NotFound) {
          setFatal(`No ${label.toLowerCase()} was found on this device.`);
        } else if (failure === MediaDeviceFailure.DeviceInUse) {
          setFatal(`${label} is being used by another app.`);
        } else {
          setFatal(`${label} could not be started.`);
        }
      }}
    >
      <RoomAudioRenderer />
      <Studio
        slug={slug}
        title={title}
        connectedOnce={connectedOnce}
        dropped={dropped}
        fatal={fatal}
        onLeave={handleLeave}
      />
    </LiveKitRoom>
  );
}
