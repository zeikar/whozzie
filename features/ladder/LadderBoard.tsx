"use client";

import { memo, useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState, type Ref } from "react";
import { useTranslations } from "next-intl";
import { NameChip } from "@/components/picker/NameChip";
import { RedPenCircle } from "@/components/ui/RedPenCircle";
import { cx } from "@/lib/cx";
import { markerVar } from "@/lib/markers";
import { hashString, seededRandom } from "@/lib/random";
import { sketchLine } from "@/lib/sketch";
import {
  FLAP_HEIGHT,
  TAPE_OVERHANG,
  lanePath,
  layout,
  maxBoardWidth,
  minBoardWidth,
  traceTiming,
  type Geometry,
} from "./geometry";
import type { Ladder, Round } from "./ladder";

const HIGHLIGHTER = 12;
const TRACE_EASING = "cubic-bezier(0.45, 0, 0.55, 1)";

const PEEL: Keyframe[] = [
  { transform: "none", opacity: 1 },
  { transform: "translate(30%, -70%) rotate(16deg)", opacity: 0 },
];

const TAPE_COLOR = "color-mix(in oklab, var(--marker-4) 38%, var(--card))";
// Torn ends, in px so the teeth stay the same size on every width.
const TAPE_EDGES =
  "polygon(4px 0, calc(100% - 4px) 0, 100% 22%, calc(100% - 3px) 45%, 100% 70%, calc(100% - 4px) 100%, " +
  "4px 100%, 0 76%, 3px 52%, 0 28%)";

/** The ladder itself in hand-drawn ink. */
const LadderInk = memo(function LadderInk({ ladder, geometry }: { ladder: Ladder; geometry: Geometry }) {
  const rand = seededRandom(hashString(JSON.stringify(ladder.rungs)));
  const { x, rungY } = geometry;
  return (
    <g className="chalk" fill="none" stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="round">
      {Array.from({ length: ladder.columns }, (_, column) => (
        <path
          key={column}
          d={sketchLine(x(column), geometry.lineTop(column), x(column), geometry.flapTop(column), rand, 2.4)}
        />
      ))}
      {ladder.rungs.flatMap((row, r) =>
        row.map((rung, gap) => {
          if (!rung) return null;
          const y = rungY(r, gap);
          return <path key={`${r}-${gap}`} d={sketchLine(x(gap), y, x(gap + 1), y, rand, 2)} />;
        }),
      )}
    </g>
  );
});

const ignoreAbort = (error: unknown) => {
  // AbortError means we cancelled it: a new round, or the page unmounted.
  if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
};

/**
 * The stage: names on top, the ladder, and the results taped over along the
 * bottom. Tracing is animated here; the picker learns when a line has landed.
 */
export function LadderBoard({
  names,
  round,
  labels,
  revealed,
  tracing,
  runLength,
  winner,
  onPick,
  onLanded,
}: {
  names: readonly string[];
  round: Round;
  /** Result text by result index. */
  labels: readonly string[];
  /** Columns whose results are uncovered. */
  revealed: readonly number[];
  /** Column being traced now. */
  tracing: number | null;
  /** How many lines are traced back to back: one for a pick, more for "Reveal all", which goes faster. */
  runLength: number;
  /** Column of the player to circle in red pen. */
  winner: number | null;
  onPick: (column: number) => void;
  /** The trace on `column` reached the bottom and its result is uncovered. */
  onLanded: (column: number) => void;
}) {
  const t = useTranslations("ladder");
  const { ladder, lanes } = round;
  const count = names.length;

  const boxRef = useRef<HTMLDivElement>(null);
  const traceRef = useRef<SVGPathElement>(null);
  const tapeRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    // Measure before the first paint so the board doesn't flash empty; then follow resizes.
    setWidth(box.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const geometry = useMemo(() => (width > 0 ? layout(width, ladder) : null), [width, ladder]);
  const paths = useMemo(() => geometry && lanes.map((lane) => lanePath(lane, geometry)), [geometry, lanes]);

  const land = useEffectEvent((column: number) => onLanded(column));
  const timing = useEffectEvent((column: number) => traceTiming(paths?.[column].length ?? 0, runLength));

  // Draw the highlighter down the path, then peel the tape off the result it lands on.
  useEffect(() => {
    const path = traceRef.current;
    if (tracing === null || !path) return;
    const ms = timing(tracing);
    // Dashes are in pathLength units (the path is 1 long), so a resize mid-trace
    // redraws the path without throwing the dash off.
    const trace = path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
      duration: ms.trace,
      easing: TRACE_EASING,
      fill: "forwards",
    });
    let peel: Animation | undefined;
    trace.finished
      .then(() => {
        peel = tapeRef.current?.animate(PEEL, { duration: ms.peel, easing: "ease-in", fill: "forwards" });
        return peel?.finished;
      })
      .then(() => land(tracing))
      .catch(ignoreAbort);
    return () => {
      trace.cancel();
      peel?.cancel();
    };
  }, [tracing]);

  const busy = tracing !== null;
  const landing = tracing === null ? null : lanes[tracing].end;
  // The lanes in the order they arrive along the bottom (ends are one per column).
  const arrivals = lanes.map((lane, column) => ({ lane, column })).sort((a, b) => a.lane.end - b.lane.end);

  return (
    // Scrolls sideways inside the stage when the lines can't fit; the padding keeps
    // the red-pen circle and lifted chips from being clipped by the scroll box.
    <div className="-mx-4 overflow-x-auto px-4 pt-3 pb-2 sm:-mx-2 sm:px-2">
      <div
        ref={boxRef}
        role="group"
        aria-label={t("ladderLabel", { count })}
        className="relative mx-auto w-full"
        style={{ minWidth: minBoardWidth(count), maxWidth: maxBoardWidth(count), height: geometry?.height }}
      >
        {geometry && paths && (
          <>
            <svg width="100%" height={geometry.height} className="absolute inset-0 overflow-visible" aria-hidden>
              {/* Highlighter under the ink, the way it goes on paper after the pen. */}
              <g
                className="chalk mix-blend-multiply dark:mix-blend-normal"
                fill="none"
                strokeWidth={HIGHLIGHTER}
                strokeLinejoin="round"
                opacity={0.85}
              >
                {lanes.map((lane, column) => {
                  const active = column === tracing;
                  if (!active && !revealed.includes(column)) return null;
                  return (
                    <path
                      key={column}
                      ref={active ? traceRef : undefined}
                      d={paths[column].d}
                      stroke={markerVar(lane.player, count)}
                      pathLength={active ? 1 : undefined}
                      strokeDasharray={active ? 1 : undefined}
                      strokeDashoffset={active ? 1 : undefined}
                    />
                  );
                })}
              </g>
              <LadderInk ladder={ladder} geometry={geometry} />
            </svg>

            <ul>
              {lanes.map((lane, column) => {
                const name = names[lane.player];
                const done = revealed.includes(column);
                return (
                  <li
                    key={column}
                    className="absolute w-max -translate-x-1/2"
                    style={{ left: geometry.x(column), top: geometry.chipTop(column), maxWidth: geometry.labelWidth }}
                  >
                    <button
                      type="button"
                      onClick={() => onPick(column)}
                      aria-disabled={busy || done}
                      aria-label={
                        done ? t("lane", { name, result: labels[lane.result] }) : t("follow", { name })
                      }
                      className={cx(
                        "block max-w-full rounded-xl transition-transform duration-200",
                        column === tracing && "-translate-y-1",
                        !busy && !done && "hover:-translate-y-0.5",
                        busy && column !== tracing && "cursor-default",
                        done && "cursor-default",
                      )}
                    >
                      <RedPenCircle active={column === winner} seed={name} className="max-w-full align-top">
                        <NameChip name={name} index={lane.player} count={count} />
                      </RedPenCircle>
                    </button>
                  </li>
                );
              })}
            </ul>

            <ul>
              {arrivals.map(({ lane, column }) => {
                const end = lane.end;
                const uncovered = revealed.includes(column);
                const label = labels[lane.result];
                return (
                  <li
                    key={end}
                    className="absolute -translate-x-1/2"
                    style={{
                      left: geometry.x(end),
                      top: geometry.flapTop(end),
                      width: geometry.flapWidth,
                      height: FLAP_HEIGHT,
                    }}
                  >
                    {/* Rendered under the tape just before it peels, so it's there to be seen. */}
                    {(uncovered || end === landing) && (
                      <p
                        aria-hidden={!uncovered}
                        title={label}
                        className="sketch-sm grid h-full place-items-center border-2 border-ink px-1.5 font-hand text-lg font-bold text-on-marker"
                        style={{ backgroundColor: markerVar(lane.player, count) }}
                      >
                        <span className="max-w-full truncate">{label}</span>
                      </p>
                    )}
                    {!uncovered && (
                      <Tape ref={end === landing ? tapeRef : undefined} seed={end} label={t("covered")} />
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/** A strip of masking tape over a result until someone lands on it. */
function Tape({ ref, seed, label }: { ref?: Ref<HTMLDivElement>; seed: number; label: string }) {
  const tilt = (seededRandom(hashString(`tape-${seed}`))() - 0.5) * 5;
  return (
    <div
      ref={ref}
      className="absolute grid place-items-center font-hand text-2xl font-bold text-ink-soft"
      style={{
        inset: `${-TAPE_OVERHANG.y}px ${-TAPE_OVERHANG.x}px`,
        backgroundColor: TAPE_COLOR,
        clipPath: TAPE_EDGES,
        rotate: `${tilt}deg`,
      }}
    >
      <span aria-hidden>?</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
