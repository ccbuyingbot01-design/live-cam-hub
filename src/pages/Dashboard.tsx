import { NbButton, NbEyebrow, NbPanel, NbTag } from "@/components/nb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  LogOut,
  Radio,
  Server,
  Users,
  Video,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

function normalizeCode(raw: string) {
  return raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const authState = useConvexAuth();

  const createRoom = useMutation(api.rooms.createRoom);
  const heartbeat = useMutation(api.rooms.heartbeat);
  const liveRooms = useQuery(api.rooms.listLive);

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy("create");
    setError(null);
    try {
      const slug = await createRoom({ title: title.trim() || "Live room" });
      // Claim the room immediately so it shows up in the lobby list at once.
      await heartbeat({ slug, title: title.trim() || "Live room" });
      navigate(`/room/${slug}`);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not open the room.",
      );
      setBusy(null);
    }
  };

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const slug = normalizeCode(code);
    if (slug.length < 4) {
      setError("A room code is 6 characters.");
      return;
    }
    setBusy("join");
    setError(null);
    navigate(`/room/${slug}`);
  };

  const initials = (user?.name || user?.email || "G")
    .trim()
    .slice(0, 1)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* header */}
      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center bg-primary text-primary-foreground">
              <Video className="size-4" />
            </span>
            <span className="text-lg font-black tracking-tight uppercase">
              Livecam
            </span>
            <span className="nb-label ml-2 hidden border-l-2 border-foreground pl-3 text-muted-foreground sm:inline">
              Studio lobby
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 border-2 border-foreground bg-card px-3 py-1.5 sm:flex">
              <span className="flex size-5 items-center justify-center bg-primary text-[10px] font-black text-primary-foreground">
                {initials}
              </span>
              <span className="max-w-[10rem] truncate text-xs font-bold">
                {user?.name || user?.email || "Guest"}
              </span>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-2 font-bold"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        {/* title block */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <NbEyebrow>Studio lobby</NbEyebrow>
            <h1 className="mt-4 text-5xl leading-[0.9] font-black tracking-[-0.03em] uppercase sm:text-6xl">
              Go live
              <br />
              in one tap.
            </h1>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            Open a room of your own, or punch in the code a friend sent you.
            Camera and microphone are requested the moment you enter.
          </p>
        </div>

        {/* create / join */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <NbPanel className="bg-[var(--nb-acid)] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="nb-label border-2 border-foreground bg-card px-2 py-1.5">
                Host
              </span>
              <Radio className="size-5" />
            </div>
            <h2 className="mt-5 text-3xl leading-none font-black tracking-tight uppercase">
              Open a room
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground/75">
              Give the stream a name. You get a 6-character code to hand out.
            </p>
            <form onSubmit={handleCreate} className="mt-6 flex flex-col gap-3">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Room name — e.g. Morning coffee"
                maxLength={60}
                className="h-12 border-2 bg-card text-base font-semibold"
              />
              <NbButton
                tone="ink"
                type="submit"
                disabled={busy !== null}
                className="h-12"
              >
                {busy === "create" ? "Opening…" : "Go live"}
                <ArrowRight className="size-4" />
              </NbButton>
            </form>
          </NbPanel>

          <NbPanel className="p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="nb-label border-2 border-foreground bg-secondary px-2 py-1.5">
                Guest
              </span>
              <Users className="size-5" />
            </div>
            <h2 className="mt-5 text-3xl leading-none font-black tracking-tight uppercase">
              Join a room
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Six characters, uppercase. Letters and numbers only.
            </p>
            <form onSubmit={handleJoin} className="mt-6 flex flex-col gap-3">
              <Input
                value={code}
                onChange={(event) => setCode(normalizeCode(event.target.value))}
                placeholder="K7XQ2M"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className="h-12 border-2 bg-card text-center font-mono text-2xl font-black tracking-[0.3em] uppercase"
              />
              <NbButton
                tone="ink"
                type="submit"
                disabled={busy !== null}
                className="h-12"
              >
                {busy === "join" ? "Opening…" : "Join room"}
                <ArrowRight className="size-4" />
              </NbButton>
            </form>
          </NbPanel>
        </div>

        {error && (
          <p className="mt-4 border-2 border-foreground bg-[var(--nb-signal)] px-4 py-3 text-sm font-bold text-foreground">
            {error}
          </p>
        )}

        {/* live rooms */}
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "size-2.5 bg-[var(--nb-signal)]",
                  authState.isLoading ? "" : "animate-pulse",
                )}
              />
              <h2 className="text-2xl font-black tracking-tight uppercase">
                On air now
              </h2>
            </div>
            <span className="nb-label text-muted-foreground">
              {liveRooms ? `${liveRooms.length} room${liveRooms.length === 1 ? "" : "s"}` : "…"}
            </span>
          </div>

          {liveRooms === undefined ? (
            <div className="mt-6 border-2 border-dashed border-foreground/40 px-6 py-10 text-center text-sm font-bold text-muted-foreground">
              Looking for open rooms…
            </div>
          ) : liveRooms.length === 0 ? (
            <div className="mt-6 border-2 border-dashed border-foreground/40 px-6 py-12 text-center">
              <Server className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-bold">
                Nobody is on air right now.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Open the first room and share the code.
              </p>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4">
              {liveRooms.map((room) => (
                <li key={room._id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/room/${room.slug}`)}
                    className="nb-press flex w-full flex-col gap-4 border-2 border-foreground bg-card p-4 text-left nb-shadow sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground">
                        <Video className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-base font-black tracking-tight uppercase">
                          {room.title}
                        </p>
                        <p className="nb-label mt-1.5 text-muted-foreground">
                          Hosted by {room.hostName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <NbTag tone="signal">
                        <span className="size-2 animate-pulse bg-foreground" />
                        Live
                      </NbTag>
                      <span className="border-2 border-foreground bg-secondary px-3 py-2 font-mono text-sm font-black tracking-[0.2em]">
                        {room.slug}
                      </span>
                      <span className="nb-label flex items-center gap-1.5 border-2 border-foreground bg-[var(--nb-acid)] px-3 py-2.5">
                        Join
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
