/**
 * Die face math, in the die's own frame. Opposite faces sum to 7: 1/6 on ±Y,
 * 2/5 on ±Z, 3/4 on ±X, so 1-2-3 run counter-clockwise round their shared
 * corner like on a Western die. Quaternions are plain {x, y, z, w} objects so
 * they pass straight to and from Rapier.
 */

import { randomInt } from "@/lib/random";

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;
export type Vec3 = { x: number; y: number; z: number };
export type Quat = { x: number; y: number; z: number; w: number };

export const DIE_VALUES: readonly DieValue[] = [1, 2, 3, 4, 5, 6];

/** A fair roll without the physics, for when motion is reduced. */
export const rollDie = () => (randomInt(6) + 1) as DieValue;

export const FACE_NORMALS: Record<DieValue, Vec3> = {
  1: { x: 0, y: 1, z: 0 },
  6: { x: 0, y: -1, z: 0 },
  2: { x: 0, y: 0, z: 1 },
  5: { x: 0, y: 0, z: -1 },
  3: { x: 1, y: 0, z: 0 },
  4: { x: -1, y: 0, z: 0 },
};

/** The value on each of a BoxGeometry's material groups, which three orders +X, −X, +Y, −Y, +Z, −Z. */
export const FACE_GROUP_VALUES: readonly DieValue[] = [3, 4, 1, 6, 2, 5];

/**
 * A die counts as lying flat when its top face points within ~25° of straight
 * up (the cosine of that tilt). Anything less is cocked against a wall or
 * another die, and gets nudged rather than read.
 */
export const FLAT_ENOUGH = 0.9;

const IDENTITY: Quat = { x: 0, y: 0, z: 0, w: 1 };

/** v rotated by the unit quaternion q. */
export function rotate(q: Quat, v: Vec3): Vec3 {
  // v + 2w(u × v) + 2u × (u × v), with u the quaternion's vector part.
  const tx = 2 * (q.y * v.z - q.z * v.y);
  const ty = 2 * (q.z * v.x - q.x * v.z);
  const tz = 2 * (q.x * v.y - q.y * v.x);
  return {
    x: v.x + q.w * tx + (q.y * tz - q.z * ty),
    y: v.y + q.w * ty + (q.z * tx - q.x * tz),
    z: v.z + q.w * tz + (q.x * ty - q.y * tx),
  };
}

/** The rotation a then b (b applied after a). */
export function multiply(b: Quat, a: Quat): Quat {
  return {
    x: b.w * a.x + b.x * a.w + b.y * a.z - b.z * a.y,
    y: b.w * a.y - b.x * a.z + b.y * a.w + b.z * a.x,
    z: b.w * a.z + b.x * a.y - b.y * a.x + b.z * a.w,
    w: b.w * a.w - b.x * a.x - b.y * a.y - b.z * a.z,
  };
}

/** Rotation by `angle` radians about the unit `axis`. */
export function axisAngle(axis: Vec3, angle: number): Quat {
  const s = Math.sin(angle / 2);
  return { x: axis.x * s, y: axis.y * s, z: axis.z * s, w: Math.cos(angle / 2) };
}

/** Which face is up for a die at `rotation`, and how squarely (1 = perfectly flat). */
export function readTopFace(rotation: Quat): { value: DieValue; alignment: number } {
  let value: DieValue = 1;
  let alignment = -Infinity;
  for (const face of DIE_VALUES) {
    const up = rotate(rotation, FACE_NORMALS[face]).y;
    if (up > alignment) {
      value = face;
      alignment = up;
    }
  }
  return { value, alignment };
}

export const isCocked = (rotation: Quat) => readTopFace(rotation).alignment < FLAT_ENOUGH;

/** A rotation that rests the die with `value` on top, turned `yaw` radians about the vertical. */
export function restingRotation(value: DieValue, yaw: number): Quat {
  const n = FACE_NORMALS[value];
  // Tip the face up along the shortest arc: about n × up, by the angle between them.
  let tip = IDENTITY;
  if (n.y === -1) tip = axisAngle({ x: 1, y: 0, z: 0 }, Math.PI);
  else if (n.y !== 1) tip = axisAngle({ x: -n.z, y: 0, z: n.x }, Math.PI / 2);
  return multiply(axisAngle({ x: 0, y: 1, z: 0 }, yaw), tip);
}

/** A uniformly random orientation (Shoemake), from three uniform [0, 1) draws. */
export function randomRotation(rand: () => number): Quat {
  const u = rand();
  const a = 2 * Math.PI * rand();
  const b = 2 * Math.PI * rand();
  const r1 = Math.sqrt(1 - u);
  const r2 = Math.sqrt(u);
  return { x: r1 * Math.sin(a), y: r1 * Math.cos(a), z: r2 * Math.sin(b), w: r2 * Math.cos(b) };
}
