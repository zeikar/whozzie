/**
 * Wheel math. Angles are degrees clockwise from 12 o'clock, where the pointer sits.
 * Slice i covers [i·s, (i+1)·s) with s = 360/n. Rotating the wheel clockwise by R
 * brings wheel-angle (−R mod 360) under the pointer.
 */

const mod = (value: number, by: number) => ((value % by) + by) % by;

export const sliceAngle = (count: number) => 360 / count;

/** The slice under the pointer when the wheel is turned by `rotation`. */
export function sliceAtPointer(rotation: number, count: number): number {
  return Math.floor(mod(-rotation, 360) / sliceAngle(count)) % count;
}

/**
 * Final rotation that lands `index` under the pointer, at least `turns` full turns
 * past `from`. `offset` in (0, 1) chooses where inside the slice it stops, so
 * spins don't always stop dead-centre.
 */
export function targetRotation(
  from: number,
  index: number,
  count: number,
  offset: number,
  turns: number,
): number {
  const landing = (index + offset) * sliceAngle(count);
  return from + turns * 360 + mod(-landing - from, 360);
}

/** Point on a circle of radius r around (cx, cy) at wheel-angle `degrees`. */
export function polar(cx: number, cy: number, r: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  return { x: cx + r * Math.sin(radians), y: cy - r * Math.cos(radians) };
}

/** SVG path of a pie slice between two wheel-angles. */
export function slicePath(cx: number, cy: number, r: number, start: number, end: number): string {
  const a = polar(cx, cy, r, start);
  const b = polar(cx, cy, r, end);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M${cx} ${cy}L${a.x} ${a.y}A${r} ${r} 0 ${largeArc} 1 ${b.x} ${b.y}Z`;
}

// Rough advance widths for Gaegu, in em. Hangul and other wide scripts take
// about a full em; Latin letters about half.
const WIDE = /[\u1100-\u11ff\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff\uff00-\uffef]/;
const charWidth = (char: string) => (WIDE.test(char) ? 0.92 : 0.52);

const ELLIPSIS_WIDTH = 0.6;

/** Width of `text` at `fontSize`, by the estimates above. */
export const labelWidth = (text: string, fontSize: number) =>
  [...text].reduce((width, char) => width + charWidth(char), 0) * fontSize;

/** Cuts `text` to fit `maxWidth` at `fontSize`, ending in an ellipsis when cut. */
export function fitLabel(text: string, fontSize: number, maxWidth: number): string {
  if (labelWidth(text, fontSize) <= maxWidth) return text;
  const chars = [...text];
  let width = ELLIPSIS_WIDTH * fontSize;
  let end = 0;
  while (end < chars.length && width + charWidth(chars[end]) * fontSize <= maxWidth) {
    width += charWidth(chars[end]) * fontSize;
    end++;
  }
  return `${chars.slice(0, Math.max(1, end)).join("")}…`;
}
