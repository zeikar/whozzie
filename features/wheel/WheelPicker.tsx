"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { NamesCard } from "@/components/picker/NamesCard";
import { PickerLayout } from "@/components/picker/PickerLayout";
import { ResultDialog, Verdict } from "@/components/picker/ResultDialog";
import { Button } from "@/components/ui/Button";
import { removeName, useNames } from "@/lib/names";
import { randomFloat, randomInt } from "@/lib/random";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { sliceAtPointer, targetRotation } from "./geometry";
import { WheelDisc } from "./WheelDisc";

const SPIN_MS = 5200;
// Fast start, long coast: most of the suspense is in the last turn.
const SPIN_EASING = "cubic-bezier(0.12, 0.8, 0.1, 1)";

const angleOf = (element: Element) => {
  const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
  return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
};

export function WheelPicker() {
  const t = useTranslations("wheel");
  const tResult = useTranslations("result");
  const names = useNames();
  const reducedMotion = useReducedMotion();

  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const discRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const rotation = useRef(0);
  const cancelSpin = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelSpin.current?.(), []);

  function spin() {
    const disc = discRef.current;
    if (spinning || names.length === 0 || !disc) return;

    // The winner is drawn first, fairly; the animation just shows it.
    const count = names.length;
    const index = randomInt(count);
    const picked = names[index];
    const from = rotation.current;
    const to = targetRotation(from, index, count, 0.12 + randomFloat() * 0.76, reducedMotion ? 0 : 5 + randomInt(3));

    setSpinning(true);
    setWinner(null);
    setDialogOpen(false);

    const animation = disc.animate(
      [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }],
      { duration: reducedMotion ? 0 : SPIN_MS, easing: SPIN_EASING, fill: "forwards" },
    );

    // Flick the pointer each time a slice boundary passes under it.
    let frame = 0;
    let lastSlice = sliceAtPointer(from, count);
    const tick = () => {
      const current = sliceAtPointer(angleOf(disc), count);
      if (current !== lastSlice) {
        lastSlice = current;
        pointerRef.current?.animate(
          [{ rotate: "0deg" }, { rotate: "-16deg" }, { rotate: "0deg" }],
          { duration: 140, easing: "ease-out" },
        );
      }
      frame = requestAnimationFrame(tick);
    };
    if (!reducedMotion && count > 1) frame = requestAnimationFrame(tick);

    cancelSpin.current = () => {
      cancelAnimationFrame(frame);
      animation.cancel();
    };

    animation.finished
      .then(() => {
        cancelAnimationFrame(frame);
        // Park the wheel at the equivalent angle so rotation doesn't grow forever.
        rotation.current = to % 360;
        disc.style.transform = `rotate(${rotation.current}deg)`;
        animation.cancel();
        cancelSpin.current = null;
        setSpinning(false);
        setWinner(picked);
        setDialogOpen(true);
      })
      .catch((error: unknown) => {
        // AbortError means we cancelled it (the page unmounted mid-spin).
        if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
      });
  }

  return (
    <PickerLayout picker="wheel" aside={<NamesCard highlight={spinning ? null : winner} locked={spinning} />}>
      <div className="flex flex-col items-center gap-8">
        <div className="relative aspect-square w-full max-w-[34rem]">
          <div
            ref={discRef}
            role="img"
            aria-label={t("wheelLabel", { count: names.length })}
            className="size-full will-change-transform"
          >
            <WheelDisc names={names} />
          </div>
          {/* The pointer: a pen-drawn arrowhead biting into the rim from above. */}
          <div ref={pointerRef} className="absolute -top-3 left-1/2 w-10 -translate-x-1/2 origin-top">
            <svg viewBox="0 0 40 48" className="w-full overflow-visible" aria-hidden>
              <path
                d="M5.5 4.2C15 3.4 25 3.5 34.6 4.4 30 18 25.6 31.2 20.3 44.6 15 31.1 10.4 17.6 5.5 4.2Z"
                fill="var(--ink)"
                stroke="var(--paper)"
                strokeWidth={3}
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button variant="primary" size="lg" onClick={spin} disabled={spinning || names.length === 0}>
            {spinning ? t("spinning") : t("spin")}
          </Button>
          {names.length === 0 && <p className="text-ink-soft">{t("needNames")}</p>}
        </div>
      </div>

      <ResultDialog
        open={dialogOpen && winner !== null}
        onClose={() => setDialogOpen(false)}
        heading={t("winner")}
        actions={
          winner && (
            <>
              <Button variant="primary" onClick={spin} className="flex-1">
                {t("spinAgain")}
              </Button>
              <Button
                onClick={() => {
                  removeName(winner);
                  setWinner(null);
                  setDialogOpen(false);
                }}
                className="flex-1"
              >
                {tResult("removeName", { name: winner })}
              </Button>
            </>
          )
        }
      >
        {winner && <Verdict name={winner} />}
      </ResultDialog>
    </PickerLayout>
  );
}
