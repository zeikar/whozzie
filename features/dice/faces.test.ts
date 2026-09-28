import { describe, expect, it } from "vitest";
import { seededRandom } from "@/lib/random";
import {
  DIE_VALUES,
  FACE_GROUP_VALUES,
  FACE_NORMALS,
  FLAT_ENOUGH,
  axisAngle,
  isCocked,
  multiply,
  randomRotation,
  readTopFace,
  restingRotation,
  rotate,
} from "./faces";

const length = (q: { x: number; y: number; z: number; w: number }) => Math.hypot(q.x, q.y, q.z, q.w);

describe("face layout", () => {
  it("puts opposite faces on opposite sides, summing to 7", () => {
    for (const value of DIE_VALUES) {
      const n = FACE_NORMALS[value];
      const opposite = FACE_NORMALS[(7 - value) as typeof value];
      expect({ x: n.x + opposite.x, y: n.y + opposite.y, z: n.z + opposite.z }).toEqual({ x: 0, y: 0, z: 0 });
    }
  });

  it("maps each geometry group to the face on that side", () => {
    const groupNormals = [
      { x: 1, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: -1 },
    ];
    expect([...FACE_GROUP_VALUES].sort()).toEqual([...DIE_VALUES]);
    FACE_GROUP_VALUES.forEach((value, group) => expect(FACE_NORMALS[value]).toEqual(groupNormals[group]));
  });

  it("runs 1-2-3 counter-clockwise round their corner", () => {
    // Seen from outside the shared corner, the triple product is positive.
    const [a, b, c] = [FACE_NORMALS[1], FACE_NORMALS[2], FACE_NORMALS[3]];
    const triple = a.x * (b.y * c.z - b.z * c.y) - a.y * (b.x * c.z - b.z * c.x) + a.z * (b.x * c.y - b.y * c.x);
    expect(triple).toBeGreaterThan(0);
  });
});

describe("restingRotation", () => {
  it("rests every face on top, whatever the yaw", () => {
    for (const value of DIE_VALUES) {
      for (const yaw of [0, 0.4, -2.1, Math.PI]) {
        const rotation = restingRotation(value, yaw);
        expect(length(rotation)).toBeCloseTo(1, 10);
        const top = readTopFace(rotation);
        expect(top.value).toBe(value);
        expect(top.alignment).toBeCloseTo(1, 10);
        expect(isCocked(rotation)).toBe(false);
      }
    }
  });
});

describe("readTopFace", () => {
  it("reads the identity as 1 up", () => {
    expect(readTopFace({ x: 0, y: 0, z: 0, w: 1 })).toEqual({ value: 1, alignment: 1 });
  });

  it("keeps reading a slightly tilted die as flat", () => {
    const tilt = axisAngle({ x: 1, y: 0, z: 0 }, (12 * Math.PI) / 180);
    const rotation = multiply(tilt, restingRotation(5, 1));
    expect(readTopFace(rotation).value).toBe(5);
    expect(isCocked(rotation)).toBe(false);
  });

  it("flags a die leaning on something as cocked", () => {
    for (const degrees of [30, 45]) {
      const lean = axisAngle({ x: 0, y: 0, z: 1 }, (degrees * Math.PI) / 180);
      const rotation = multiply(lean, restingRotation(4, 0));
      expect(readTopFace(rotation).alignment).toBeLessThan(FLAT_ENOUGH);
      expect(isCocked(rotation)).toBe(true);
    }
  });

  it("always finds a face at least 1/√3 up", () => {
    const rand = seededRandom(7);
    for (let i = 0; i < 500; i++) {
      const rotation = randomRotation(rand);
      expect(length(rotation)).toBeCloseTo(1, 10);
      expect(readTopFace(rotation).alignment).toBeGreaterThanOrEqual(1 / Math.sqrt(3) - 1e-9);
    }
  });
});

describe("rotate", () => {
  it("turns +X to +Y a quarter-turn about +Z", () => {
    const v = rotate(axisAngle({ x: 0, y: 0, z: 1 }, Math.PI / 2), { x: 1, y: 0, z: 0 });
    expect(v.x).toBeCloseTo(0, 10);
    expect(v.y).toBeCloseTo(1, 10);
    expect(v.z).toBeCloseTo(0, 10);
  });
});
