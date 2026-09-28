/**
 * SVG path builders that make geometry look drawn by hand: lines bow a little,
 * loops don't quite close. Pass a seededRandom() so server and client agree.
 */

type Rand = () => number;

const jitter = (rand: Rand, amount: number) => (rand() - 0.5) * 2 * amount;
/** Two decimals is plenty for a path in px, and keeps the `d` strings short. */
export const round = (value: number) => Math.round(value * 100) / 100;

/** A line from (x1, y1) to (x2, y2) with a slight bow and wobbly ends. */
export function sketchLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rand: Rand,
  wobble = 1.5,
): string {
  const length = Math.hypot(x2 - x1, y2 - y1) || 1;
  // Unit normal, for bowing the midpoint sideways.
  const nx = -(y2 - y1) / length;
  const ny = (x2 - x1) / length;
  const bow = jitter(rand, wobble);
  const cx = (x1 + x2) / 2 + nx * bow;
  const cy = (y1 + y2) / 2 + ny * bow;
  const end = wobble * 0.4;
  return (
    `M${round(x1 + jitter(rand, end))} ${round(y1 + jitter(rand, end))}` +
    `Q${round(cx)} ${round(cy)} ${round(x2 + jitter(rand, end))} ${round(y2 + jitter(rand, end))}`
  );
}

/**
 * A pen loop around an ellipse centred at (cx, cy): it starts upper right,
 * goes all the way round and overshoots its start, the way people circle things.
 */
export function sketchLoop(cx: number, cy: number, rx: number, ry: number, rand: Rand): string {
  const steps = 56;
  const start = -Math.PI / 3 + jitter(rand, 0.3);
  const sweep = Math.PI * 2 + 0.55 + rand() * 0.35;
  // The radius drifts over the stroke so the ends don't meet.
  const drift = 0.06 + rand() * 0.05;
  const tilt = jitter(rand, 0.08);
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = start + sweep * t;
    const scale = 1 + drift * (t - 0.5) + jitter(rand, 0.012);
    const x = Math.cos(angle) * rx * scale;
    const y = Math.sin(angle) * ry * scale;
    // Rotate slightly so the loop sits at a hand's angle.
    const px = cx + x * Math.cos(tilt) - y * Math.sin(tilt);
    const py = cy + x * Math.sin(tilt) + y * Math.cos(tilt);
    d += `${i === 0 ? "M" : "L"}${round(px)} ${round(py)}`;
  }
  return d;
}
