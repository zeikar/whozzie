import { CanvasTexture, DataTexture, MeshToonMaterial, NearestFilter, RedFormat, SRGBColorSpace } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { seededRandom } from "@/lib/random";
import { FACE_GROUP_VALUES, type DieValue } from "./faces";

/** Every die shares one mesh: a unit cube with the edges sanded round. */
export const DIE_GEOMETRY = new RoundedBoxGeometry(1, 1, 1, 4, 0.12);

// Three flat tones instead of smooth shading, like a face coloured in with a
// marker: lit tops keep their true colour, sides one shade down, undersides two.
const TONES = new DataTexture(new Uint8Array([100, 175, 255]), 3, 1, RedFormat);
TONES.minFilter = NearestFilter;
TONES.magFilter = NearestFilter;
TONES.needsUpdate = true;

// Pip centres on a 3×3 grid, in face units; kept off the rounded edge.
const LOW = 0.27;
const MID = 0.5;
const HIGH = 0.73;
const PIPS: Record<DieValue, [number, number][]> = {
  1: [[MID, MID]],
  2: [[LOW, LOW], [HIGH, HIGH]],
  3: [[LOW, LOW], [MID, MID], [HIGH, HIGH]],
  4: [[LOW, LOW], [HIGH, LOW], [LOW, HIGH], [HIGH, HIGH]],
  5: [[LOW, LOW], [HIGH, LOW], [MID, MID], [LOW, HIGH], [HIGH, HIGH]],
  6: [[LOW, LOW], [LOW, MID], [LOW, HIGH], [HIGH, LOW], [HIGH, MID], [HIGH, HIGH]],
};

const SIZE = 256;

/** One face: the body colour, an ink edge just inside the rim, and hand-dotted pips. */
function drawFace(value: DieValue, body: string, pips: string, edge: string): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("dice: 2D canvas unavailable for face textures");

  context.fillStyle = body;
  context.fillRect(0, 0, SIZE, SIZE);

  // The edge line sits on the rounded bevel, so neighbouring faces' lines meet
  // into one pen stroke along each edge of the cube.
  context.strokeStyle = edge;
  context.lineWidth = SIZE * 0.035;
  context.lineJoin = "round";
  const inset = SIZE * 0.04;
  context.beginPath();
  context.roundRect(inset, inset, SIZE - inset * 2, SIZE - inset * 2, SIZE * 0.12);
  context.stroke();

  // Pips are dabs, not perfect circles: a wobbly loop per pip, the same on every die.
  const rand = seededRandom(value);
  context.fillStyle = pips;
  for (const [u, v] of PIPS[value]) {
    const radius = SIZE * (value === 1 ? 0.11 : 0.085);
    context.beginPath();
    for (let i = 0; i <= 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = radius * (0.94 + rand() * 0.12);
      const x = u * SIZE + Math.cos(angle) * r;
      const y = v * SIZE + Math.sin(angle) * r;
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
    context.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

const cache = new Map<string, MeshToonMaterial[]>();

/**
 * The six face materials for a die of these colours, in geometry group order.
 * Cached per colour set: a table of 12 dice draws at most 8 sets per theme.
 */
export function dieMaterials(body: string, pips: string, edge: string): MeshToonMaterial[] {
  const key = `${body}|${pips}|${edge}`;
  let materials = cache.get(key);
  if (!materials) {
    materials = FACE_GROUP_VALUES.map(
      (value) => new MeshToonMaterial({ map: drawFace(value, body, pips, edge), gradientMap: TONES }),
    );
    cache.set(key, materials);
  }
  return materials;
}
