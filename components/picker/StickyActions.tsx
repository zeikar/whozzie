"use client";

import type { MouseEvent, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/** Tailwind's lg breakpoint, from where the row stops sticking. */
const LG = "(min-width: 64rem)";

/**
 * The stage's main action row (the Spin/Roll/Reveal buttons). Below lg the stage
 * sits under the names card, so the row sticks to the bottom of the screen while
 * the stage is in view. Sticky only travels inside its parent: render this as a
 * direct child of the stage's outer container, right after one element holding the
 * stage and its status line (so a result never ends up below the stuck row), and
 * keep `overflow: hidden/auto` off its ancestors (`overflow: clip` is fine). Put
 * only buttons in it; their solid fills stay legible over the stage, and where the
 * browser can tell the row is stuck it also gets a strip of paper behind it (see
 * .sticky-actions, which also keeps focus and scrolling clear of the row).
 */
export function StickyActions({
  children,
  sticky = true,
  className,
}: {
  children: ReactNode;
  /**
   * Turn off while the action can't be used for a reason shown on the stage (too
   * few names): a dead button following the reader around, away from the reason,
   * only confuses.
   */
  sticky?: boolean;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  // The row can be pressed while only a sliver of the stage shows above it: bring
  // the stage into view so the spin, roll or trace doesn't play off-screen.
  function showStage(event: MouseEvent<HTMLDivElement>) {
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    const stage = event.currentTarget.previousElementSibling;
    if (!button || button.getAttribute("aria-disabled") === "true" || !stage) return;
    if (window.matchMedia(LG).matches) return;
    stage.scrollIntoView({ block: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
  }

  return (
    <div
      onClickCapture={showStage}
      className={cx(
        sticky && "sticky-actions sticky bottom-0 z-10",
        "-mx-4 self-stretch sm:-mx-8 lg:static lg:mx-0",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8 lg:p-0">
        {children}
      </div>
    </div>
  );
}
