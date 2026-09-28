"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { hashString, seededRandom } from "@/lib/random";
import { sketchLoop } from "@/lib/sketch";

type Size = { width: number; height: number };

/**
 * The signature mark: a teacher's red-pen circle drawn around whatever was picked.
 * It draws itself once when `active` turns on; the loop's shape comes from `seed`
 * so the same name always gets the same hand-drawn circle.
 */
export function RedPenCircle({
  active,
  seed,
  children,
  className,
}: {
  active: boolean;
  seed: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<Size | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!active || !element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [active]);

  const loop = useMemo(() => {
    // Zero while hidden, e.g. inside a closed <dialog>.
    if (!size || size.width === 0) return null;
    const padX = Math.max(10, size.height * 0.4);
    const padY = Math.max(6, size.height * 0.28);
    const box = { width: size.width + padX * 2, height: size.height + padY * 2 };
    const d = sketchLoop(
      box.width / 2,
      box.height / 2,
      size.width / 2 + padX * 0.75,
      size.height / 2 + padY * 0.8,
      seededRandom(hashString(seed)),
    );
    const strokeWidth = Math.min(4, 2 + size.height / 40);
    return { d, padX, padY, strokeWidth, ...box };
  }, [size, seed]);

  return (
    <span ref={ref} className={cx("relative inline-block", className)}>
      {children}
      {active && loop && (
        <svg
          aria-hidden
          className="pointer-events-none absolute overflow-visible text-verdict"
          style={{ left: -loop.padX, top: -loop.padY, width: loop.width, height: loop.height }}
        >
          <path
            className="redpen-path"
            d={loop.d}
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth={loop.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
