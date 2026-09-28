import { describe, expect, it } from "vitest";
import { MARKER_COUNT, markerIndex } from "./markers";

describe("markerIndex", () => {
  it("cycles through the palette", () => {
    expect(markerIndex(0, 3)).toBe(0);
    expect(markerIndex(MARKER_COUNT + 2, 20)).toBe(2);
  });

  it("never gives ring neighbours the same color", () => {
    for (let count = 2; count <= 40; count++) {
      for (let i = 0; i < count; i++) {
        const next = (i + 1) % count;
        expect(markerIndex(i, count), `count ${count}, slot ${i}`).not.toBe(markerIndex(next, count));
      }
    }
  });
});
