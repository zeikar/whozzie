/**
 * The dice table in world units, where a die is a 1×1×1 cube. The camera
 * looks down at the origin from the near side (+Z); the table is whatever
 * floor it can see, fenced by invisible walls.
 */

import { shuffle } from "@/lib/random";
import { randomRotation, type Quat, type Vec3 } from "./faces";

/** Camera tilt below the horizon. */
export const ELEVATION = (60 * Math.PI) / 180;
/** Vertical field of view, in degrees as three expects. */
export const FOV = 30;

/** Clearance kept above dice at the far wall so their name tags stay in frame. */
const HEADROOM = 1.9;
/** Grid pitch of dice laid out at rest: room to sit a little turned, and rows apart enough for name tags. */
const REST_PITCH_X = 1.6;
const REST_PITCH_Z = 2.5;
/** Spacing of throw start points; with their jitter, cubes' bounding spheres (radius √3/2) never touch. */
const LAUNCH_PITCH = 2.1;
const LAUNCH_JITTER = 0.1;
const HALF = 0.5;

export type Bounds = { minX: number; maxX: number; minZ: number; maxZ: number };
/** A die's starting state: where it is, which way up, and how it's moving. */
export type Pose = { position: Vec3; rotation: Quat; velocity: Vec3; spin: Vec3 };

/** Floor the dice need to tumble without piling up. */
const tableArea = (count: number) => 24 + 2.5 * count;

/**
 * Where the walls go for a camera `distance` from the origin: the largest
 * floor rectangle in which a die (and its tag) stays wholly in frame.
 */
function visibleBounds(distance: number, aspect: number): Bounds {
  const t = Math.tan((FOV * Math.PI) / 360);
  const s = Math.sin(ELEVATION);
  const c = Math.cos(ELEVATION);
  // A point's depth along the view is distance − y·s − z·c; it's in frame
  // while its offset from the view axis stays within depth·t (·aspect sideways).
  const maxZ = (distance * t) / (s + t * c);
  const minZ = -(distance * t - HEADROOM * (t * s + c)) / (s - t * c);
  // The frame is narrowest at the near wall, level with a die's top.
  const halfWidth = (distance - s - maxZ * c) * t * aspect;
  return { minX: -halfWidth, maxX: halfWidth, minZ, maxZ };
}

const area = (b: Bounds) => Math.max(0, b.maxX - b.minX) * Math.max(0, b.maxZ - b.minZ);

/** How far back the camera sits so `count` dice get enough table at this aspect ratio. */
export function fitView(aspect: number, count: number): { camera: Vec3; bounds: Bounds } {
  const needed = tableArea(count);
  let low = 1;
  let high = 200;
  for (let i = 0; i < 40; i++) {
    const middle = (low + high) / 2;
    if (area(visibleBounds(middle, aspect)) >= needed) high = middle;
    else low = middle;
  }
  return {
    camera: { x: 0, y: high * Math.sin(ELEVATION), z: high * Math.cos(ELEVATION) },
    bounds: visibleBounds(high, aspect),
  };
}

/**
 * Where `point` shows up in a frame of this aspect ratio, seen from `camera`
 * as fitView places it: fractions of the frame's width and height from its
 * top-left corner.
 */
export function screenPoint(point: Vec3, camera: Vec3, aspect: number): { x: number; y: number } {
  const t = Math.tan((FOV * Math.PI) / 360);
  const s = Math.sin(ELEVATION);
  const c = Math.cos(ELEVATION);
  const [dx, dy, dz] = [point.x - camera.x, point.y - camera.y, point.z - camera.z];
  // Along the view axis (0, −s, −c), and along the camera's up (0, c, −s).
  const depth = -dy * s - dz * c;
  const up = dy * c - dz * s;
  return { x: (1 + dx / (depth * t * aspect)) / 2, y: (1 - up / (depth * t)) / 2 };
}

/** Evenly spread centres for `count` items along [from, to], centred when there's room to spare. */
function spread(count: number, from: number, to: number, pitch: number): number[] {
  const step = count > 1 ? Math.min(pitch, (to - from) / (count - 1)) : 0;
  const start = (from + to) / 2 - (step * (count - 1)) / 2;
  return Array.from({ length: count }, (_, i) => start + i * step);
}

/** Floor spots for dice lined up at rest, in reading order from the far left. */
export function restingSpots(count: number, bounds: Bounds): { x: number; z: number }[] {
  const [minX, maxX] = [bounds.minX + HALF, bounds.maxX - HALF];
  const [minZ, maxZ] = [bounds.minZ + HALF, bounds.maxZ - HALF];
  // As few rows as fit, then as even as they can be (3 + 2, not 4 + 1).
  const rows = Math.ceil(count / (Math.floor((maxX - minX) / REST_PITCH_X) + 1));
  const columns = Math.ceil(count / rows);
  const zs = spread(rows, minZ, maxZ, REST_PITCH_Z);
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / columns);
    const inRow = Math.min(columns, count - row * columns);
    return { x: spread(inRow, minX, maxX, REST_PITCH_X)[i % columns], z: zs[row] };
  });
}

/**
 * Start states for a throw: the dice come in from one side wall, stacked
 * clear of each other, flung across the table with a spin. Every number comes
 * from `rand`, so pass the crypto one for real throws.
 */
export function throwStarts(count: number, bounds: Bounds, rand: () => number): Pose[] {
  const side = rand() < 0.5 ? -1 : 1;
  const wall = side < 0 ? bounds.minX : bounds.maxX;
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const rowCount = Math.max(1, Math.floor((depth - LAUNCH_PITCH) / LAUNCH_PITCH) + 1);
  const rows = spread(rowCount, bounds.minZ + LAUNCH_PITCH * HALF, bounds.maxZ - LAUNCH_PITCH * HALF, Infinity);
  const columns = Math.max(1, Math.floor((width - LAUNCH_PITCH) / LAUNCH_PITCH) + 1);

  // Nearest the wall first, two layers high, then further in; stack higher
  // only when the table is too small. Rows are taken in random order.
  const slots: Vec3[] = [];
  for (let layer = 0; slots.length < count; layer += 2) {
    for (let column = 0; column < columns; column++) {
      const x = wall - side * (LAUNCH_PITCH * HALF + column * LAUNCH_PITCH);
      for (const y of [layer, layer + 1].map((l) => 1.4 + l * LAUNCH_PITCH)) {
        for (const z of shuffle(rows)) slots.push({ x, y, z });
      }
    }
  }

  // Who gets which slot is shuffled, so no one is favoured by where they start.
  const jitter = () => (rand() * 2 - 1) * LAUNCH_JITTER;
  return shuffle(slots.slice(0, count)).map((slot) => ({
    position: { x: slot.x + jitter(), y: slot.y + jitter(), z: slot.z + jitter() },
    rotation: randomRotation(rand),
    velocity: {
      x: -side * width * (0.45 + 0.35 * rand()),
      y: 1 + 3 * rand(),
      z: (rand() - 0.5) * 6,
    },
    spin: { x: (rand() - 0.5) * 40, y: (rand() - 0.5) * 40, z: (rand() - 0.5) * 40 },
  }));
}
