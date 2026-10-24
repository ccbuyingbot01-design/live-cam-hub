import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Neobrutalism Minimalism primitives.
 *
 * Three rules, applied everywhere: square corners (enforced globally in
 * index.css), a 2px ink border on every block, and one hard offset shadow.
 * Everything else is flat colour — no gradients, no blur, no soft elevation.
 */

type Tone = "acid" | "ink" | "paper" | "signal" | "sky";

const TONES: Record<Tone, string> = {
  acid: "bg-[var(--nb-acid)] text-foreground hover:bg-[#c9f22c]",
  ink: "bg-primary text-primary-foreground hover:bg-[#232323]",
  paper: "bg-secondary text-secondary-foreground hover:bg-[#d9d5c9]",
  signal: "bg-[var(--nb-signal)] text-foreground hover:bg-[#f0340f]",
  sky: "bg-[var(--nb-sky)] text-foreground hover:bg-[#68aaf7]",
};

export function NbButton({
  tone = "acid",
  className,
  ...props
}: React.ComponentProps<typeof Button> & { tone?: Tone }) {
  return (
    <Button
      className={cn(
        "h-11 border-2 border-foreground px-5 text-[13px] font-black uppercase tracking-[0.1em] nb-shadow nb-press",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

export function NbPanel({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-2 border-foreground bg-card nb-shadow",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function NbTag({
  tone = "ink",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  const tagTones: Record<Tone, string> = {
    acid: "bg-[var(--nb-acid)] text-foreground",
    ink: "bg-primary text-primary-foreground",
    paper: "bg-card text-foreground",
    signal: "bg-[var(--nb-signal)] text-foreground",
    sky: "bg-[var(--nb-sky)] text-foreground",
  };

  return (
    <span
      className={cn(
        "nb-label inline-flex items-center gap-1.5 border-2 border-foreground px-2.5 py-1.5",
        tagTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Section eyebrow: a rule, then tracked-out uppercase text. */
export function NbEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-0.5 w-8 bg-foreground" />
      <span className="nb-label">{children}</span>
    </div>
  );
}
