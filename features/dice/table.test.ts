import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { seededRandom } from "@/lib/random";
import { FOV, fitView, restingSpots, screenPoint, throwStarts, type Bounds } from "./table";

const ASPECTS = [0.8, 1, 1.35, 1.9, 2.4];
const COUNTS = [1, 2, 3, 6, 12];

function cameraFor(aspect: number, count: number) {
  const view = fitView(aspect, count);
  const camera = new PerspectiveCamera(FOV, aspect, 0.1, 100);
  camera.position.set(view.camera.x, view.camera.y, view.camera.z);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return { camera, bounds: view.bounds };
}

const inside = (b: Bounds, x: number, z: number, margin = 0) =>
  x >= b.minX + margin && x <= b.maxX - margin && z >= b.minZ + margin && z <= b.maxZ - margin;

describe("fitView", () => {
  it("keeps a die against any wall wholly in frame", () => {
    for (const aspect of ASPECTS) {
      for (const count of COUNTS) {
        const { camera, bounds } = cameraFor(aspect, count);
        // The extreme box a die can occupy: flush with every wall, one unit tall.
        for (const x of [bounds.minX, bounds.maxX]) {
          for (const z of [bounds.minZ, bounds.maxZ]) {
            for (const y of [0, 1]) {
              const ndc = new Vector3(x, y, z).project(camera);
              expect(Math.abs(ndc.x), `aspect ${aspect}, ${count} dice`).toBeLessThanOrEqual(1 + 1e-9);
              expect(Math.abs(ndc.y), `aspect ${aspect}, ${count} dice`).toBeLessThanOrEqual(1 + 1e-9);
            }
          }
        }
      }
    }
  });

  it("uses the frame: the near wall sits on the bottom edge", () => {
    const { camera, bounds } = cameraFor(1.35, 6);
    expect(new Vector3(0, 0, bounds.maxZ).project(camera).y).toBeCloseTo(-1, 6);
  });

  it("gives more dice more table", () => {
    const area = (b: Bounds) => (b.maxX - b.minX) * (b.maxZ - b.minZ);
    for (const aspect of ASPECTS) {
      expect(area(fitView(aspect, 12).bounds)).toBeGreaterThan(area(fitView(aspect, 2).bounds));
      expect(area(fitView(aspect, 12).bounds)).toBeGreaterThanOrEqual(54 - 1e-6);
    }
  });
});

describe("screenPoint", () => {
  it("lands where three projects the same point", () => {
    for (const aspect of ASPECTS) {
      const { camera, bounds } = cameraFor(aspect, 6);
      const view = fitView(aspect, 6);
      for (const [x, y, z] of [
        [0, 0, 0],
        [bounds.minX, 1, bounds.minZ],
        [bounds.maxX, 0.5, bounds.maxZ],
        [1.3, 2.4, -0.7],
      ]) {
        const ndc = new Vector3(x, y, z).project(camera);
        const point = screenPoint({ x, y, z }, view.camera, aspect);
        expect(point.x).toBeCloseTo((ndc.x + 1) / 2, 9);
        expect(point.y).toBeCloseTo((1 - ndc.y) / 2, 9);
      }
    }
  });
});

describe("restingSpots", () => {
  it("lines dice up on the table without touching", () => {
    for (const aspect of ASPECTS) {
      for (let count = 1; count <= 12; count++) {
        const { bounds } = fitView(aspect, count);
        const spots = restingSpots(count, bounds);
        expect(spots).toHaveLength(count);
        for (const [i, a] of spots.entries()) {
          expect(inside(bounds, a.x, a.z, 0.5)).toBe(true);
          for (const b of spots.slice(i + 1)) {
            expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeGreaterThanOrEqual(1.3);
          }
        }
      }
    }
  });

  it("fills rows far to near, left to right", () => {
    const spots = restingSpots(5, fitView(1.35, 5).bounds);
    expect(spots[0].z).toBeLessThan(spots[4].z);
    expect(spots[0].x).toBeLessThan(spots[1].x);
  });
});

describe("throwStarts", () => {
  it("starts every die inside the walls, clear of the others, heading across", () => {
    const rand = seededRandom(11);
    for (const aspect of ASPECTS) {
      for (let count = 1; count <= 12; count++) {
        const { bounds } = fitView(aspect, count);
        for (let trial = 0; trial < 5; trial++) {
          const starts = throwStarts(count, bounds, rand);
          expect(starts).toHaveLength(count);
          // All thrown the same way, off the wall behind them.
          const direction = Math.sign(starts[0].velocity.x);
          const backWall = direction > 0 ? bounds.minX : bounds.maxX;
          const fromWall = Math.min(...starts.map((start) => Math.abs(start.position.x - backWall)));
          expect(fromWall).toBeLessThan(1.2);
          for (const [i, a] of starts.entries()) {
            expect(inside(bounds, a.position.x, a.position.z, Math.sqrt(3) / 2)).toBe(true);
            expect(a.position.y).toBeGreaterThan(Math.sqrt(3) / 2);
            expect(Math.sign(a.velocity.x)).toBe(direction);
            for (const b of starts.slice(i + 1)) {
              const gap = Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y, a.position.z - b.position.z);
              expect(gap).toBeGreaterThanOrEqual(Math.sqrt(3));
            }
          }
        }
      }
    }
  });
});
