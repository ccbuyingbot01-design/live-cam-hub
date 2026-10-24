import { NbButton, NbPanel } from "@/components/nb";
import { LiveRoom } from "@/components/room/LiveRoom";
import { PreJoin } from "@/components/room/PreJoin";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { createJoinToken, makeParticipantIdentity } from "@/lib/livekit";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, Loader2, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

type Phase = "prejoin" | "connecting";

function normalizeSlug(raw: string | undefined) {
  return (raw ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
}

export default function Room() {
  const { roomId } = useParams();
  const slug = normalizeSlug(roomId);
  const navigate = useNavigate();
  const { user } = useAuth();

  const room = useQuery(api.rooms.getRoom, slug ? { slug } : "skip");
  const heartbeat = useMutation(api.rooms.heartbeat);

  const [phase, setPhase] = useState<Phase>("prejoin");
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState({ cam: true, mic: true });

  const displayName =
    user?.name?.trim() || user?.email?.trim() || "Guest";
  const title = room?.title ?? "Live room";

  /* Keep the room listed for as long as somebody has the page open. */
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const beat = () => {
      heartbeat({ slug, title: room?.title, hostName: displayName }).catch(
        () => undefined,
      );
    };
    beat();
    const interval = window.setInterval(() => {
      if (!cancelled) beat();
    }, 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [slug, room?.title, displayName, heartbeat]);

  /* Mint the LiveKit join token once the user asks to enter. */
  useEffect(() => {
    if (phase !== "connecting") return;
    let cancelled = false;

    (async () => {
      try {
        const jwt = await createJoinToken({
          roomSlug: slug,
          identity: makeParticipantIdentity(displayName),
          displayName,
        });
        if (!cancelled) setToken(jwt);
      } catch (cause) {
        if (!cancelled) {
          setTokenError(
            cause instanceof Error
              ? cause.message
              : "Could not create a join token.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [phase, slug, displayName]);

  if (!slug) {
    return (
      <Shell>
        <NbPanel className="p-8 text-center">
          <AlertTriangle className="mx-auto size-6" />
          <p className="mt-4 text-xl font-black uppercase">Bad room code</p>
          <p className="mt-2 text-sm text-muted-foreground">
            That address does not look like a LiveCam room.
          </p>
          <NbButton
            tone="ink"
            className="mt-6 h-12 w-full"
            onClick={() => navigate("/dashboard")}
          >
            Back to lobby
          </NbButton>
        </NbPanel>
      </Shell>
    );
  }

  if (room === undefined) {
    return (
      <Shell>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span className="nb-label">Opening room {slug}…</span>
        </div>
      </Shell>
    );
  }

  if (phase === "connecting" && token) {
    return (
      <LiveRoom
        token={token}
        slug={slug}
        title={title}
        startCam={prefs.cam}
        startMic={prefs.mic}
        onLeave={() => navigate("/dashboard")}
      />
    );
  }

  if (phase === "connecting") {
    if (tokenError) {
      return (
        <Shell>
          <NbPanel className="w-full max-w-md p-7">
            <span className="flex size-11 items-center justify-center border-2 border-foreground bg-[var(--nb-signal)] text-white">
              <AlertTriangle className="size-5" />
            </span>
            <p className="mt-5 text-xl font-black uppercase">
              Couldn&apos;t open the room
            </p>
            <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
              {tokenError}
            </p>
            <div className="mt-6 flex gap-3">
              <NbButton
                tone="paper"
                className="h-12 flex-1"
                onClick={() => navigate("/dashboard")}
              >
                Lobby
              </NbButton>
              <NbButton
                tone="acid"
                className="h-12 flex-1"
                onClick={() => {
                  setToken(null);
                  setTokenError(null);
                  setPhase("prejoin");
                }}
              >
                Try again
              </NbButton>
            </div>
          </NbPanel>
        </Shell>
      );
    }

    return (
      <Shell>
        <div className="flex flex-col items-center gap-4">
          <span className="flex size-12 items-center justify-center border-2 border-foreground bg-[var(--nb-acid)] nb-shadow">
            <Video className="size-6" />
          </span>
          <span className="nb-label">Opening the room…</span>
        </div>
      </Shell>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PreJoin
        roomTitle={title}
        roomSlug={slug}
        onBack={() => navigate("/dashboard")}
        onJoin={(next) => {
          setToken(null);
          setTokenError(null);
          setPrefs(next);
          setPhase("connecting");
        }}
      />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
      {children}
    </div>
  );
}
