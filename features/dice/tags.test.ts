import { describe, expect, it } from "vitest";
import { placeTags, type Point, type Size } from "./tags";

const FRAME: Size = { width: 400, height: 300 };
const TAG: Size = { width: 80, height: 24 };

const boxes = (spots: Point[], sizes: Size[]) => spots.map((spot, i) => ({ ...spot, ...sizes[i] }));
const within = (box: Point & Size, frame: Size) =>
  box.x >= 0 && box.y >= 0 && box.x + box.width <= frame.width && box.y + box.height <= frame.height;

describe("placeTags", () => {
  it("centres a tag just above its die when there's room", () => {
    const [spot] = placeTags([{ x: 200, y: 150 }], [TAG], FRAME);
    expect(spot.x).toBe(160);
    expect(spot.y + TAG.height).toBeLessThan(150);
    expect(spot.y + TAG.height).toBeGreaterThan(140);
  });

  it("keeps tags for dice at the edges inside the frame", () => {
    const anchors = [
      { x: 5, y: 150 },
      { x: 395, y: 150 },
      { x: 200, y: 3 },
      { x: 200, y: 330 },
    ];
    const sizes = anchors.map(() => TAG);
    for (const box of boxes(placeTags(anchors, sizes, FRAME), sizes)) expect(within(box, FRAME)).toBe(true);
  });

  it("moves a nearer tag down off one further back, which stays put", () => {
    const anchors = [
      { x: 210, y: 110 },
      { x: 200, y: 100 },
    ];
    const [near, far] = placeTags(anchors, [TAG, TAG], FRAME);
    expect(far).toEqual(placeTags([anchors[1]], [TAG], FRAME)[0]);
    expect(near.y).toBeGreaterThanOrEqual(far.y + TAG.height);
  });

  it("never lets two tags cover each other while there's room below", () => {
    // A tight cluster, like 12 dice piled in one corner.
    const anchors = Array.from({ length: 12 }, (_, i) => ({ x: 100 + (i % 4) * 30, y: 60 + Math.floor(i / 4) * 12 }));
    const sizes = anchors.map((_, i) => ({ width: 60 + (i % 3) * 20, height: 24 }));
    const frame = { width: 400, height: 460 };
    const placed = boxes(placeTags(anchors, sizes, frame), sizes);
    for (const [i, a] of placed.entries()) {
      expect(within(a, frame)).toBe(true);
      for (const b of placed.slice(i + 1)) {
        const apart = a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;
        expect(apart).toBe(true);
      }
    }
  });

  it("stays in the frame even when it runs out of room", () => {
    const anchors = Array.from({ length: 20 }, () => ({ x: 200, y: 250 }));
    const sizes = anchors.map(() => TAG);
    for (const box of boxes(placeTags(anchors, sizes, FRAME), sizes)) expect(within(box, FRAME)).toBe(true);
  });
});
