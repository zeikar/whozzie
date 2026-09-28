/** Laying out name tags over the dice table, in CSS pixels from its top-left. */

export type Point = { x: number; y: number };
export type Size = { width: number; height: number };

/** Space between a tag and its die, and between tags moved apart. */
const GAP = 4;
/** Kept clear at the frame's edges, so a red-pen circle round a tag fits inside. */
const MARGIN = 10;

const overlaps = (a: Point & Size, b: Point & Size) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

/**
 * Where each tag's top-left corner goes: centred just above its anchor, inside
 * the frame, and moved down clear of any tag it would cover. Tags further back
 * (higher up) go first, so a nearer tag gives way by sliding onto its own die.
 */
export function placeTags(anchors: readonly Point[], sizes: readonly Size[], frame: Size): Point[] {
  const placed: (Point & Size)[] = [];
  const spots: Point[] = [];
  const order = anchors.map((_, i) => i).sort((a, b) => anchors[a].y - anchors[b].y);
  for (const i of order) {
    const { width, height } = sizes[i];
    const lowest = frame.height - MARGIN - height;
    const box = {
      x: clamp(anchors[i].x - width / 2, MARGIN, frame.width - MARGIN - width),
      y: clamp(anchors[i].y - GAP - height, MARGIN, lowest),
      width,
      height,
    };
    // Each step moves strictly down, so this ends at the latest at the bottom edge.
    for (let other = placed.find((p) => overlaps(box, p)); other && box.y < lowest; ) {
      box.y = Math.min(other.y + other.height + GAP, lowest);
      other = placed.find((p) => overlaps(box, p));
    }
    placed.push(box);
    spots[i] = { x: box.x, y: box.y };
  }
  return spots;
}
