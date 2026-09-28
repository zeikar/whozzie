/**
 * Each person gets a marker color from their position in the names list, and
 * keeps it in every picker: their wheel slice, their die, their ladder line.
 * The colors themselves live in CSS (--marker-0…7) so they follow the theme.
 */
export const MARKER_COUNT = 8;

export function markerIndex(position: number, count: number): number {
  const index = position % MARKER_COUNT;
  // When the palette wraps, the last slot would touch the first around a ring
  // (the wheel), so give it the color opposite in the palette instead.
  if (count > MARKER_COUNT && position === count - 1 && index === 0) return MARKER_COUNT / 2;
  return index;
}

export const markerVar = (position: number, count: number) =>
  `var(--marker-${markerIndex(position, count)})`;
