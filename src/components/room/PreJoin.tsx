import { NbButton } from "@/components/nb";
import { Button } from "@/components/ui/button";
import {
  describeMediaError,
  MEDIA_CONSTRAINTS,
  supportsUserMedia,
  type PermissionFailure,
} from "@/lib/livekit";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CameraOff,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const FAILURE_COPY: Record<
  PermissionFailure,
  { title: string; body: string }
> = {
  unsupported: {
    title: "Camera unavailable here",
    body: "LiveCam needs a secure page (https) and a browser that exposes camera and microphone access. Reopen the app over https, then retry.",
  },
  denied: {
    title: "Camera access blocked",
    body: "Your browser is withholding the camera and microphone. Open the padlock in the address bar, set Camera and Microphone to Allow, then hit retry.",
  },
  "not-found": {
    title: "No camera found",
    body: "This device did not report a camera or microphone. Plug one in, or open the room from a device that has them.",
  },
  "in-use": {
    title: "Camera is busy",
    body: "Another app or tab is holding the camera. Close it, then hit retry.",
  },
  unknown: {
    title: "Could not start the camera",
    body: "Something went wrong while opening your devices. Retry, and check that no other app is using the camera.",
  },
};

type Status = "requesting" | "ready" | "failed";

export function PreJoin({
  roomTitle,
  roomSlug,
  onJoin,
  onBack,
}: {
  roomTitle: string;
  roomSlug: string;
  onJoin: (prefs: { cam: boolean; mic: boolean }) => void;
  onBack: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestSeq = useRef(0);

  const supported = supportsUserMedia();
  const [status, setStatus] = useState<Status>(
    supported ? "requesting" : "failed",
  );
  const [failure, setFailure] = useState<PermissionFailure | null>(
    supported ? null : "unsupported",
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const runRequest = useCallback(() => {
    const attempt = ++requestSeq.current;
    navigator.mediaDevices
      .getUserMedia(MEDIA_CONSTRAINTS)
      .then((next) => {
        // A superseded attempt must never leave the camera held open.
        if (attempt !== requestSeq.current) {
          next.getTracks().forEach((track) => track.stop());
          return;
        }
        setStream(next);
        setFailure(null);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (attempt !== requestSeq.current) return;
        setFailure(describeMediaError(error));
        setStatus("failed");
      });
  }, []);

  useEffect(() => {
    if (!supported) return;
    runRequest();
    return () => {
      requestSeq.current += 1;
    };
  }, [runRequest, supported]);

  // Releasing the device whenever the preview is swapped or the screen goes
  // away — React runs this cleanup with the previous stream.
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, status]);

  const handleRetry = () => {
    if (!supportsUserMedia()) {
      setFailure("unsupported");
      setStatus("failed");
      return;
    }
    setStatus("requesting");
    setFailure(null);
    runRequest();
  };

  const toggleCam = () => {
    const next = !camOn;
    stream?.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setCamOn(next);
  };

  const toggleMic = () => {
    const next = !micOn;
    stream?.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setMicOn(next);
  };

  const handleJoin = () => {
    // Hand the device back before LiveKit opens its own capture, so the
    // camera is never held twice at once.
    stream?.getTracks().forEach((track) => track.stop());
    onJoin({ cam: camOn, mic: micOn });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 border-2 border-foreground bg-card font-bold"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          Lobby
        </Button>
        <span className="border-2 border-foreground bg-secondary px-3 py-2 font-mono text-sm font-black tracking-[0.2em]">
          {roomSlug}
        </span>
      </div>

      <p className="nb-label mt-8 text-muted-foreground">Step 1 of 1</p>
      <h1 className="mt-3 text-4xl leading-[0.92] font-black tracking-[-0.03em] uppercase sm:text-5xl">
        Allow camera
        <br />
        &amp; microphone.
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Your browser will ask for permission next. Approve it and you will see
        and hear yourself before anyone else does.
      </p>

      {/* preview */}
      <div className="relative mt-7 aspect-[4/3] w-full overflow-hidden border-2 border-foreground bg-[#0a0a0a] nb-shadow sm:aspect-video">
        {status === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
            <Loader2 className="size-6 animate-spin" />
            <span className="nb-label text-white/70">
              Asking for camera &amp; mic…
            </span>
          </div>
        )}

        {status === "ready" && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "h-full w-full object-cover transition-opacity",
                camOn ? "opacity-100" : "opacity-0",
              )}
              style={{ transform: "scaleX(-1)" }}
            />
            {!camOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                <CameraOff className="size-7" />
                <span className="nb-label text-white/70">Camera off</span>
              </div>
            )}
            <span className="nb-label absolute top-3 left-3 border-2 border-white bg-[#0a0a0a] px-2 py-1.5 text-white">
              You
            </span>
            {!micOn && (
              <span className="nb-label absolute top-3 right-3 flex items-center gap-1.5 border-2 border-white bg-[var(--nb-signal)] px-2 py-1.5 text-foreground">
                <MicOff className="size-3.5" />
                Muted
              </span>
            )}
          </>
        )}

        {status === "failed" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] p-6 text-center text-white">
            <span className="flex size-11 items-center justify-center border-2 border-white bg-[var(--nb-signal)]">
              <AlertTriangle className="size-5" />
            </span>
            <p className="text-xl font-black uppercase">
              {FAILURE_COPY[failure ?? "unknown"].title}
            </p>
            <p className="max-w-md text-sm leading-6 text-white/70">
              {FAILURE_COPY[failure ?? "unknown"].body}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-1 h-10 gap-2 border-2 border-white bg-transparent font-black text-white uppercase hover:bg-white hover:text-[#0a0a0a]"
              onClick={handleRetry}
            >
              <RotateCcw className="size-4" />
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* device toggles */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={toggleMic}
          disabled={status !== "ready"}
          className={cn(
            "nb-press flex h-14 items-center justify-center gap-2.5 border-2 border-foreground text-sm font-black tracking-wide uppercase nb-shadow disabled:opacity-40",
            micOn ? "bg-card" : "bg-[var(--nb-signal)] text-foreground",
          )}
        >
          {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          {micOn ? "Mic on" : "Mic off"}
        </button>
        <button
          type="button"
          onClick={toggleCam}
          disabled={status !== "ready"}
          className={cn(
            "nb-press flex h-14 items-center justify-center gap-2.5 border-2 border-foreground text-sm font-black tracking-wide uppercase nb-shadow disabled:opacity-40",
            camOn ? "bg-[var(--nb-acid)]" : "bg-[var(--nb-signal)] text-foreground",
          )}
        >
          {camOn ? (
            <Camera className="size-5" />
          ) : (
            <CameraOff className="size-5" />
          )}
          {camOn ? "Cam on" : "Cam off"}
        </button>
      </div>

      <div className="mt-6 border-2 border-foreground bg-card p-4">
        <p className="nb-label text-muted-foreground">Joining</p>
        <p className="mt-2 truncate text-lg font-black tracking-tight uppercase">
          {roomTitle}
        </p>
      </div>

      <NbButton
        tone="ink"
        className="mt-5 h-14 w-full text-base"
        disabled={status !== "ready"}
        onClick={handleJoin}
      >
        {status === "requesting" ? "Waiting for permission…" : "Enter room"}
      </NbButton>

      <p className="nb-label mt-4 text-center text-muted-foreground">
        {status === "failed"
          ? "Fix the permission, then retry"
          : "Nothing is broadcast until you enter"}
      </p>
    </div>
  );
}
