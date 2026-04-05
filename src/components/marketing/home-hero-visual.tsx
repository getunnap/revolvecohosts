"use client";

import { User } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

const POOL_START = 72;
/** Pool size after each of the 7 filters is applied (last = shortlist). */
const TARGET_SIZES = [72, 56, 42, 28, 18, 11, 6, 3] as const;

function removalScore(i: number): number {
  return ((i * 2654435761) ^ (i >>> 3)) >>> 0;
}

function buildSurvivorSets(): Set<number>[] {
  const sets: Set<number>[] = [];
  const current = new Set<number>(Array.from({ length: POOL_START }, (_, i) => i));
  sets.push(new Set(current));
  for (let step = 0; step < 7; step++) {
    const nextSize = TARGET_SIZES[step + 1]!;
    while (current.size > nextSize) {
      const arr = Array.from(current);
      arr.sort((a, b) => removalScore(b) - removalScore(a));
      current.delete(arr[0]!);
    }
    sets.push(new Set(current));
  }
  return sets;
}

const SURVIVOR_SETS = buildSurvivorSets();
const FINAL_THREE_SORTED = Array.from(SURVIVOR_SETS[7]!).sort((a, b) => a - b);
const RECOMMENDED = FINAL_THREE_SORTED[1]!;

const PHASE_MS = 2200;
const HOLD_WINNER_MS = 3600;
/** Time for a tile to collapse in layout (width/height → 0) and fade. */
const COLLAPSE_MS = 640;

const FILTERS = [
  { key: "geo", label: "Area & market" },
  { key: "prop", label: "Property type" },
  { key: "stage", label: "Listing stage" },
  { key: "cap", label: "Portfolio & bandwidth" },
  { key: "ops", label: "Working style" },
  { key: "guest", label: "Guest type" },
  { key: "exp", label: "Expertise" },
] as const;

/** Ingest grid — small from first paint (no “big then shrink” when the loop resets). */
const POOL_VISUAL_EARLY = {
  cell: "h-3 w-3 sm:h-3.5 sm:w-3.5",
  icon: "h-1.5 w-1.5 sm:h-2 sm:w-2",
  wrap: "max-w-[140px] gap-0.5 sm:max-w-[156px] sm:gap-0.5",
} as const;

/** Tile / gap scale per pipeline step — starts compact for 72, grows toward the final 3. */
const POOL_VISUAL_BY_STEP: Record<
  number,
  { cell: string; icon: string; wrap: string }
> = {
  0: POOL_VISUAL_EARLY,
  1: POOL_VISUAL_EARLY,
  2: POOL_VISUAL_EARLY,
  3: {
    cell: "h-5 w-5 sm:h-6 sm:w-6",
    icon: "h-2.5 w-2.5 sm:h-3 sm:w-3",
    wrap: "max-w-[200px] gap-1 sm:max-w-[224px] sm:gap-1",
  },
  4: {
    cell: "h-6 w-6 sm:h-7 sm:w-7",
    icon: "h-3 w-3 sm:h-3.5 sm:w-3.5",
    wrap: "max-w-[232px] gap-1 sm:max-w-[260px] sm:gap-1.5",
  },
  5: {
    cell: "h-6 w-6 sm:h-7 sm:w-7",
    icon: "h-3 w-3 sm:h-3.5 sm:w-3.5",
    wrap: "max-w-[232px] gap-1 sm:max-w-[260px] sm:gap-1.5",
  },
  6: {
    cell: "h-7 w-7 sm:h-8 sm:w-8",
    icon: "h-3.5 w-3.5 sm:h-4 sm:w-4",
    wrap: "max-w-[268px] gap-1 sm:max-w-[300px] sm:gap-1.5",
  },
  7: {
    cell: "h-14 w-14 sm:h-16 sm:w-16",
    icon: "h-7 w-7 sm:h-8 sm:w-8",
    wrap: "max-w-[300px] gap-3 sm:max-w-[320px] sm:gap-4",
  },
};

function diffExiting(prevStep: number, nextStep: number): Set<number> {
  const prevSet = SURVIVOR_SETS[prevStep]!;
  const nextSet = SURVIVOR_SETS[nextStep]!;
  const out = new Set<number>();
  prevSet.forEach((i) => {
    if (!nextSet.has(i)) out.add(i);
  });
  return out;
}

export default function HomeHeroVisual() {
  const [appliedCount, setAppliedCount] = useState(0);
  const [exiting, setExiting] = useState<Set<number>>(() => new Set());
  /** After exiting ids appear, wait one frame so tiles mount at full size, then collapse. */
  const [exitingShrink, setExitingShrink] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const effectiveApplied = reducedMotion ? 7 : appliedCount;

  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleFrom = (step: number) => {
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        if (step < 7) {
          const next = step + 1;
          setExitingShrink(false);
          setAppliedCount(next);
          setExiting(diffExiting(step, next));
          scheduleFrom(next);
        } else {
          setExitingShrink(false);
          setExiting(new Set());
          setAppliedCount(0);
          scheduleFrom(0);
        }
      }, step < 7 ? PHASE_MS : HOLD_WINNER_MS);
    };

    scheduleFrom(0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (exiting.size === 0) {
      queueMicrotask(() => setExitingShrink(false));
      return;
    }
    if (reducedMotion) {
      queueMicrotask(() => setExitingShrink(true));
      return;
    }
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setExitingShrink(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [exiting, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    if (exiting.size === 0) return;
    const clearTimer = window.setTimeout(() => {
      setExiting(new Set());
      setExitingShrink(false);
    }, COLLAPSE_MS + 100);
    return () => window.clearTimeout(clearTimer);
  }, [appliedCount, exiting, reducedMotion]);

  const toRender = useMemo(() => {
    const alive = SURVIVOR_SETS[effectiveApplied]!;
    const out = new Set<number>([...alive, ...exiting]);
    return Array.from(out).sort((a, b) => a - b);
  }, [effectiveApplied, exiting]);

  const statusRight =
    effectiveApplied === 0
      ? `INGEST · ${POOL_START} operators`
      : effectiveApplied < 7
        ? `SIGNAL ${String(effectiveApplied).padStart(2, "0")}/07`
        : "SHORTLIST · 3 matches";

  const pool = SURVIVOR_SETS[effectiveApplied]!;
  const poolVisual = POOL_VISUAL_BY_STEP[effectiveApplied] ?? POOL_VISUAL_BY_STEP[7]!;

  return (
    <div
      className="relative mx-auto w-full max-w-xl lg:max-w-none"
      role="img"
      aria-label="Illustration: seven match signals apply one at a time; the candidate pool shrinks from 72 to three, with one match highlighted."
    >
      <div
        className="pointer-events-none absolute -inset-[1px] rounded-2xl opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.07) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          animation: reducedMotion ? "none" : "hero-grid-drift 18s linear infinite",
        }}
      />

      <div className="relative min-h-0 overflow-hidden rounded-2xl border border-border/80 bg-card/60 shadow-sm backdrop-blur-md dark:bg-card/40">
        {!reducedMotion && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#10B981]/10 to-transparent"
            style={{
              animation: "hero-scanline 4.5s ease-in-out infinite",
            }}
          />
        )}

        <div className="relative flex flex-col gap-3 p-4 sm:gap-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
              Match engine
            </span>
            <span className="max-w-[58%] truncate text-right font-mono text-[10px] tabular-nums text-[#059669] sm:max-w-[65%] sm:text-xs">
              {statusRight}
            </span>
          </div>

          {/* lg: stretch both columns to same height; center signal card & pool content on that track */}
          <div className="flex min-h-0 flex-col gap-4 lg:h-[220px] lg:min-h-[220px] lg:flex-row lg:items-stretch lg:gap-5">
            {/* Signal panel — vertically centered in the shared row height */}
            <div className="flex min-h-0 w-full flex-1 flex-col justify-center lg:h-full lg:w-[260px] lg:max-w-[260px] lg:flex-none lg:justify-center">
              {effectiveApplied < 7 ? (
                <div
                  key={effectiveApplied}
                  className="rounded-xl border border-[#10B981]/40 bg-[#10B981]/8 px-4 py-3 transition-colors duration-300"
                  style={
                    !reducedMotion
                      ? { animation: "hero-filter-shine 1.6s ease-in-out infinite" }
                      : undefined
                  }
                >
                  <p className="mb-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    Signal {effectiveApplied + 1} of 7
                  </p>
                  <p className="text-sm font-semibold leading-snug text-foreground">
                    {FILTERS[effectiveApplied]!.label}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-[#10B981]/45 bg-[#10B981]/10 px-4 py-3">
                  <p className="mb-1 font-mono text-[9px] uppercase tracking-wider text-[#059669]">
                    Signals complete
                  </p>
                  <p className="text-sm font-semibold text-foreground">3 curated matches</p>
                </div>
              )}
            </div>

            {/* Candidate pool — clipped so collapsing tiles and labels stay inside the card */}
            <div className="flex h-[188px] min-h-[188px] w-full min-w-0 flex-1 items-center justify-center overflow-hidden sm:h-[208px] sm:min-h-[208px] lg:h-full lg:min-h-0 lg:flex-1">
              <div
                className={`flex h-full min-h-0 w-full max-w-full min-w-0 max-h-full flex-wrap content-center items-center justify-center ${poolVisual.wrap}`}
              >
                {toRender.map((i) => {
                  const isExiting = exiting.has(i);
                  const isFinal = SURVIVOR_SETS[7]!.has(i);
                  const isRecommended = effectiveApplied === 7 && i === RECOMMENDED;
                  const isShortlistPeer =
                    effectiveApplied === 7 && isFinal && i !== RECOMMENDED;
                  const growIntoFinal = effectiveApplied === 7 && !isExiting && !reducedMotion;
                  const isIngestIdle = effectiveApplied === 0 && !isExiting;
                  const holdStep = Math.max(0, effectiveApplied - 1);
                  const holdVisual =
                    POOL_VISUAL_BY_STEP[holdStep] ?? POOL_VISUAL_EARLY;
                  const exitingHold = isExiting && !exitingShrink;
                  const exitingCollapse = isExiting && exitingShrink;

                  const collapseCls =
                    "pointer-events-none m-0 max-h-0 max-w-0 min-h-0 min-w-0 h-0 w-0 shrink overflow-hidden rounded-sm border-0 bg-transparent p-0 opacity-0 transition-[width,height,min-width,min-height,max-width,max-height,opacity] duration-[640ms] ease-[cubic-bezier(0.4,0,0.2,1)]";

                  const survivorCls = `relative box-border flex shrink-0 items-center justify-center overflow-hidden rounded-md border ${poolVisual.cell} ${
                    growIntoFinal
                      ? "transition-[width,height,min-width,min-height,border-color,background-color,box-shadow] duration-[720ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                      : isIngestIdle
                        ? "transition-none"
                        : "transition-[width,height,min-width,min-height,border-color,background-color,box-shadow] duration-[480ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                  } ${
                    isRecommended
                      ? "border-[#10B981] bg-[#10B981]/15"
                      : isShortlistPeer
                        ? "border-[#10B981]/40 bg-[#10B981]/7"
                        : "border-border/45 bg-muted/35"
                  }`;

                  const exitingHoldCls = `relative box-border flex shrink-0 items-center justify-center overflow-hidden rounded-md border ${holdVisual.cell} border-border/50 bg-muted/40 opacity-95 transition-opacity duration-200 ease-out`;

                  return (
                    <div
                      key={i}
                      className={
                        exitingCollapse ? collapseCls : exitingHold ? exitingHoldCls : survivorCls
                      }
                      style={
                        isRecommended && !isExiting && !reducedMotion
                          ? { animation: "hero-winner-glow 2.2s ease-in-out infinite" }
                          : undefined
                      }
                    >
                      {!exitingCollapse && (
                        <>
                          <User
                            className={`${
                              exitingHold ? holdVisual.icon : poolVisual.icon
                            } ${
                              growIntoFinal
                                ? "transition-[width,height] duration-[720ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                                : isIngestIdle
                                  ? "transition-none"
                                  : exitingHold
                                    ? "transition-none"
                                    : "transition-[width,height] duration-[480ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                            } ${
                              isRecommended
                                ? "text-[#059669]"
                                : isShortlistPeer
                                  ? "text-[#10B981]"
                                  : "text-muted-foreground"
                            }`}
                            strokeWidth={1.5}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3 font-mono text-[9px] text-muted-foreground sm:text-[10px]">
            <span className="truncate">live_curate · sequential signals</span>
            <span className="shrink-0 tabular-nums text-[#10B981]/90">
              {effectiveApplied === 7
                ? "3 retained · 1 pick"
                : `${pool.size} qualified`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
