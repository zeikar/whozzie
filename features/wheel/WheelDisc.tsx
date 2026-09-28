import { memo } from "react";
import { markerVar } from "@/lib/markers";
import { hashString, seededRandom } from "@/lib/random";
import { sketchLine } from "@/lib/sketch";
import { fitLabel, polar, sliceAngle, slicePath, upsideDown } from "./geometry";

const SIZE = 400;
const C = SIZE / 2;
const R = 188;
const HUB = 18;
/** Labels run along the slice's centre line, from just outside the hub to near the rim. */
const LABEL_END = R - 16;
const LABEL_LENGTH = LABEL_END - HUB - 22;
/** Below this, labels are unreadable; the names card still lists everyone. */
const MIN_FONT = 9;

function labelFont(count: number) {
  if (count === 1) return 34;
  // The chord across the slice at mid-radius bounds the letter height.
  const chord = 2 * (R * 0.55) * Math.sin(Math.PI / Math.max(count, 2));
  return Math.min(30, chord * 0.52);
}

/**
 * The wheel face: marker-colored slices, drawn by hand. Rotation is applied by the
 * parent; `restRotation` is where the wheel last stopped, so labels that would sit
 * upside down there are turned to read the right way up.
 */
export const WheelDisc = memo(function WheelDisc({
  names,
  restRotation,
}: {
  names: readonly string[];
  restRotation: number;
}) {
  const count = names.length;
  const rand = seededRandom(hashString(names.join("\n")) + count);
  const slice = count > 0 ? sliceAngle(count) : 0;
  const fontSize = labelFont(count);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full overflow-visible" aria-hidden>
      {count === 0 ? (
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeDasharray="10 12"
          strokeLinecap="round"
          className="text-ink-faint"
        />
      ) : (
        <>
          <g className="chalk">
            {count === 1 ? (
              <circle cx={C} cy={C} r={R} fill={markerVar(0, 1)} />
            ) : (
              names.map((name, i) => (
                <path key={name} d={slicePath(C, C, R, i * slice, (i + 1) * slice)} fill={markerVar(i, count)} />
              ))
            )}
            <g fill="none" stroke="var(--ink)" strokeLinecap="round">
              {count > 1 &&
                names.map((name, i) => {
                  const edge = polar(C, C, R, i * slice);
                  return <path key={name} d={sketchLine(C, C, edge.x, edge.y, rand, 1.8)} strokeWidth={2} />;
                })}
              {/* The rim, gone over twice like a pen outline. */}
              <circle cx={C} cy={C} r={R} strokeWidth={3.5} />
              <circle cx={C + 0.8} cy={C - 0.6} r={R + 1.6} strokeWidth={1.2} opacity={0.6} />
            </g>
          </g>

          {fontSize >= MIN_FONT && (
            <g className="font-hand font-bold" fill="var(--on-marker)" fontSize={fontSize}>
              {names.map((name, i) => {
                const centre = (i + 0.5) * slice;
                // Flipped labels start at the rim and read inward, so all of them read left to right.
                const flip = upsideDown(centre + restRotation);
                return (
                  <text
                    key={name}
                    x={flip ? C - LABEL_END : C + LABEL_END}
                    y={C}
                    textAnchor={flip ? "start" : "end"}
                    dominantBaseline="central"
                    transform={`rotate(${centre - 90 + (flip ? 180 : 0)} ${C} ${C})`}
                  >
                    {fitLabel(name, fontSize, LABEL_LENGTH)}
                  </text>
                );
              })}
            </g>
          )}
        </>
      )}

      <circle cx={C} cy={C} r={HUB} fill="var(--card)" stroke="var(--ink)" strokeWidth={3} />
      <circle cx={C} cy={C} r={4} fill="var(--ink)" />
    </svg>
  );
});
