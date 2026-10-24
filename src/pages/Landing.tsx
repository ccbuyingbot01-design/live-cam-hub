import { NbButton, NbEyebrow, NbPanel, NbTag } from "@/components/nb";
import { motion } from "framer-motion";
import { ArrowRight, Mic, Video, Zap } from "lucide-react";
import { useNavigate } from "react-router";

const ENTER = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const STATS = [
  { value: "0", label: "Downloads" },
  { value: "2-WAY", label: "Video + audio" },
  { value: "<1s", label: "Glass-to-glass" },
  { value: "1 TAP", label: "To go live" },
];

const FEATURES = [
  {
    tone: "acid" as const,
    icon: Zap,
    title: "Instant rooms",
    body: "Name your stream, get a 6-character code, send it out. The room exists the moment you open it.",
  },
  {
    tone: "paper" as const,
    icon: Video,
    title: "Both ways, live",
    body: "LiveKit carries your camera and microphone over WebRTC and brings theirs straight back — real two-way, not a broadcast.",
  },
  {
    tone: "sky" as const,
    icon: Mic,
    title: "Built for phones",
    body: "Front camera, microphone and speaker are already in the browser. Approve access once and you are on air.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Allow the camera",
    body: "The browser asks for camera and microphone. Approve it and you will see yourself before anyone else does.",
  },
  {
    n: "02",
    title: "Open or join",
    body: "Start a room of your own, or drop a friend's 6-character code into the lobby.",
  },
  {
    n: "03",
    title: "Stay on air",
    body: "Mute, freeze or hang up whenever you like. A room only stays listed while somebody is inside it.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const enterStudio = () => navigate("/auth?returnTo=%2Fdashboard");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ---------------- header ---------------- */}
      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center bg-primary text-primary-foreground">
              <Video className="size-4" />
            </span>
            <span className="text-lg font-black tracking-tight uppercase">
              Livecam
            </span>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#features"
              className="nb-label hover:text-[var(--nb-signal)]"
            >
              Features
            </a>
            <a href="#how" className="nb-label hover:text-[var(--nb-signal)]">
              How it works
            </a>
            <span className="nb-label flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 animate-pulse bg-[var(--nb-signal)]" />
              LiveKit WebRTC
            </span>
          </nav>

          <NbButton tone="acid" onClick={enterStudio} className="h-9 px-4">
            Start streaming
          </NbButton>
        </div>
      </header>

      {/* ---------------- hero ---------------- */}
      <section id="top" className="nb-grid border-b-2 border-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-12 md:py-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={ENTER}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="md:col-span-7"
          >
            <div className="flex flex-wrap items-center gap-2">
              <NbTag tone="signal">
                <span className="size-2 animate-pulse bg-foreground" />
                On air
              </NbTag>
              <NbTag tone="paper">No install</NbTag>
              <NbTag tone="paper">Phone ready</NbTag>
            </div>

            <h1 className="mt-7 text-[clamp(2.75rem,9vw,5.5rem)] leading-[0.86] font-black tracking-[-0.04em] uppercase">
              Cam on.
              <br />
              Room open.
              <br />
              <span className="bg-[var(--nb-acid)] px-2 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
                You&apos;re live.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Livecam turns any browser into a two-way live studio. Open a room,
              allow the camera and microphone, and stream video and audio to
              anyone with the link — on a laptop or in your pocket.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <NbButton tone="acid" onClick={enterStudio}>
                Open a room
                <ArrowRight className="size-4" />
              </NbButton>
              <NbButton
                tone="paper"
                onClick={() => document.getElementById("how")?.scrollIntoView()}
              >
                See how it works
              </NbButton>
            </div>

            <p className="nb-label mt-6 text-muted-foreground">
              Free · Sign in with email or as a guest
            </p>
          </motion.div>

          {/* viewfinder mock */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={ENTER}
            transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
            className="relative md:col-span-5"
          >
            <div className="border-2 border-foreground bg-card nb-shadow-lg">
              <div className="flex items-center justify-between border-b-2 border-foreground px-3 py-2.5">
                <span className="nb-label flex items-center gap-2">
                  <span className="size-2 animate-pulse bg-[var(--nb-signal)]" />
                  Rec
                </span>
                <span className="nb-label font-mono tracking-normal">
                  K7XQ2M
                </span>
              </div>

              <div className="nb-grid relative aspect-[4/3] bg-[#0a0a0a]">
                <span className="absolute top-4 left-4 h-6 w-6 border-t-[3px] border-l-[3px] border-white/70" />
                <span className="absolute top-4 right-4 h-6 w-6 border-t-[3px] border-r-[3px] border-white/70" />
                <span className="absolute bottom-4 left-4 h-6 w-6 border-b-[3px] border-l-[3px] border-white/70" />
                <span className="absolute right-4 bottom-4 h-6 w-6 border-r-[3px] border-b-[3px] border-white/70" />

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <span className="border-2 border-white bg-[var(--nb-signal)] px-4 py-2 text-2xl font-black tracking-[0.2em] text-white uppercase">
                    Live
                  </span>
                  <span className="nb-label text-white/60">
                    Waiting for a face
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 border-t-2 border-foreground">
                <span className="nb-label flex items-center justify-center gap-1.5 border-r-2 border-foreground py-3">
                  <Mic className="size-3.5" /> Mic
                </span>
                <span className="nb-label flex items-center justify-center gap-1.5 border-r-2 border-foreground bg-[var(--nb-acid)] py-3">
                  <Video className="size-3.5" /> Cam
                </span>
                <span className="nb-label flex items-center justify-center gap-1.5 bg-primary py-3 text-primary-foreground">
                  End
                </span>
              </div>
            </div>

            <div className="absolute -top-5 -left-4 hidden rotate-[-4deg] sm:block">
              <NbTag tone="acid">Camera ✓ Allowed</NbTag>
            </div>
            <div className="absolute -right-4 -bottom-5 hidden rotate-[3deg] sm:block">
              <NbTag tone="sky">Mic ✓ Allowed</NbTag>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------------- stats band ---------------- */}
      <section className="border-b-2 border-foreground bg-primary text-primary-foreground">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 sm:grid-cols-4">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-5 py-7 sm:px-6 ${
                index % 2 === 0 ? "border-r-2" : ""
              } border-foreground sm:border-r-2 ${
                index < 2 ? "border-b-2 sm:border-b-0" : ""
              } ${index === 3 ? "sm:border-r-0" : ""}`}
            >
              <p className="text-3xl font-black tracking-tight sm:text-4xl">
                {stat.value}
              </p>
              <p className="nb-label mt-2 text-primary-foreground/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- features ---------------- */}
      <section id="features" className="border-b-2 border-foreground">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <NbEyebrow>What you get</NbEyebrow>
          <h2 className="mt-5 max-w-2xl text-4xl leading-[0.95] font-black tracking-tight uppercase sm:text-5xl">
            Everything a live cam needs. Nothing it doesn&apos;t.
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <NbPanel
                  key={feature.title}
                  className={`nb-shadow p-6 ${
                    feature.tone === "acid"
                      ? "bg-[var(--nb-acid)]"
                      : feature.tone === "sky"
                        ? "bg-[var(--nb-sky)]"
                        : "bg-card"
                  }`}
                >
                  <span className="flex size-11 items-center justify-center border-2 border-foreground bg-card">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-black tracking-tight uppercase">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-foreground/75">
                    {feature.body}
                  </p>
                </NbPanel>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- how it works ---------------- */}
      <section id="how" className="border-b-2 border-foreground bg-secondary">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <NbEyebrow>Three steps</NbEyebrow>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="border-2 border-foreground bg-card p-6 nb-shadow"
              >
                <span className="block text-6xl leading-none font-black tracking-tighter text-foreground/15">
                  {step.n}
                </span>
                <h3 className="mt-4 text-lg font-black tracking-tight uppercase">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="border-b-2 border-foreground bg-[var(--nb-acid)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-7 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between md:py-20">
          <div>
            <h2 className="text-4xl leading-[0.95] font-black tracking-tight uppercase sm:text-6xl">
              Ready when
              <br />
              you are.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-foreground/75">
              Grant the camera, name your room, share the code. Your first live
              cam room is about ninety seconds away.
            </p>
          </div>
          <NbButton
            tone="ink"
            onClick={enterStudio}
            className="h-14 px-8 text-base"
          >
            Start streaming
            <ArrowRight className="size-5" />
          </NbButton>
        </div>
      </section>

      {/* ---------------- footer ---------------- */}
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-6 items-center justify-center bg-[var(--nb-acid)] text-foreground">
              <Video className="size-3.5" />
            </span>
            <span className="text-sm font-black uppercase">Livecam</span>
          </div>
          <p className="nb-label text-primary-foreground/60">
            Video &amp; audio by LiveKit · WebRTC
          </p>
          <NbButton
            tone="acid"
            onClick={enterStudio}
            className="h-9 px-4"
          >
            Open studio
          </NbButton>
        </div>
      </footer>
    </div>
  );
}
