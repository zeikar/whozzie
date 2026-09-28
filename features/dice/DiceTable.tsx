"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MeshToonMaterial } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Outlines, PerspectiveCamera } from "@react-three/drei";
import {
  CuboidCollider,
  Physics,
  RigidBody,
  RoundCuboidCollider,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import { hashString, randomFloat, seededRandom } from "@/lib/random";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useThemeColors } from "@/lib/use-theme-colors";
import {
  DIE_VALUES,
  isCocked,
  readTopFace,
  restingRotation,
  rollDie,
  type DieValue,
  type Vec3,
} from "./faces";
import { DIE_GEOMETRY, dieMaterials } from "./look";
import { SETTLING, advanceSettle, type Settling } from "./settle";
import { ELEVATION, FOV, fitView, restingSpots, screenPoint, throwStarts, type Bounds, type Pose } from "./table";

/** A die to put on the table, in resolved colours. */
export type DieSpec = { id: string; body: string; pips: string };

/**
 * A die at rest as it looks on screen: the point just above it, in fractions
 * of the canvas from its top-left, and the face it shows.
 */
export type DieSpot = { id: string; x: number; y: number; value: DieValue };

export type DiceTableApi = {
  /**
   * Throws the listed dice (the rest leave the table) and resolves with the
   * face each one settles on, in the same order.
   */
  roll(ids: readonly string[]): Promise<DieValue[]>;
};

/** Where a die ended up, and which way up. */
type Rest = Pick<Pose, "position" | "rotation">;

/**
 * The dice on the table. Every new layout remounts its dice under a new
 * generation, so a pose is only ever a starting state: physics owns the rest.
 */
type Layout = { key: string; generation: number; poses: ReadonlyMap<string, Pose>; moving: boolean };

type Throw = {
  generation: number;
  ids: readonly string[];
  resolve: (values: DieValue[]) => void;
  settling: Settling;
  /** Frames spent waiting for the thrown dice to appear in the world. */
  waited: number;
};

type Register = (key: string, body: RapierRigidBody | null) => void;

const GRAVITY: [number, number, number] = [0, -26, 0];
/** Longest slice of time simulated in one physics step; a slow frame takes several. */
const MAX_STEP = 1 / 90;
/** Longer frames (a background tab, a hitch) are cut short rather than fast-forwarded. */
const MAX_FRAME = 1 / 20;
const STILL_SPEED = 0.05;
const STILL_SPIN = 0.08;
/** New bodies turn up a frame or two after a throw starts; this many frames means one never will. */
const MAX_WAIT_FRAMES = 60;
const REST: Vec3 = { x: 0, y: 0, z: 0 };

const keyOf = (dice: readonly DieSpec[]) => dice.map((die) => die.id).join("\n");
const bodyKey = (generation: number, id: string) => `${generation}:${id}`;
const speed = (v: Vec3) => Math.hypot(v.x, v.y, v.z);

// Before anyone rolls, dice sit showing some face; seeded so it stays put across renders.
const idleValue = (id: string) => DIE_VALUES[Math.floor(seededRandom(hashString(id))() * 6)];
const idleYaw = (id: string) => (seededRandom(hashString(id) + 1)() - 0.5) * 0.5;

/** Dice lined up at rest, each showing `valueAt(index)` and turned a little off square. */
function atRest(
  ids: readonly string[],
  bounds: Bounds,
  valueAt: (index: number) => DieValue,
  yawAt: (index: number) => number,
): Map<string, Pose> {
  const spots = restingSpots(ids.length, bounds);
  return new Map(
    ids.map((id, i) => [
      id,
      {
        position: { x: spots[i].x, y: 0.5, z: spots[i].z },
        rotation: restingRotation(valueAt(i), yawAt(i)),
        velocity: REST,
        spin: REST,
      },
    ]),
  );
}

const idleLayout = (dice: readonly DieSpec[], bounds: Bounds, generation: number): Layout => {
  const ids = dice.map((die) => die.id);
  return {
    key: keyOf(dice),
    generation,
    poses: atRest(ids, bounds, (i) => idleValue(ids[i]), (i) => idleYaw(ids[i])),
    moving: false,
  };
};

/**
 * The 3D dice table: a transparent canvas over the page with real physics.
 * Loaded lazily; `onReady` hands over the controls once Rapier is running.
 */
export function DiceTable(props: {
  dice: readonly DieSpec[];
  onReady: (api: DiceTableApi) => void;
  /** Where each die sits on screen once they're all at rest; null while any is moving. */
  onRest: (spots: readonly DieSpot[] | null) => void;
}) {
  return (
    <Canvas shadows="percentage" flat dpr={[1, 2]} frameloop="demand" gl={{ alpha: true }}>
      <Suspense fallback={null}>
        {/* Paused: the throw steps the world itself, and nothing runs between throws. */}
        <Physics paused timeStep="vary" gravity={GRAVITY}>
          <DiceWorld {...props} />
        </Physics>
      </Suspense>
    </Canvas>
  );
}

function DiceWorld({
  dice,
  onReady,
  onRest,
}: {
  dice: readonly DieSpec[];
  onReady: (api: DiceTableApi) => void;
  onRest: (spots: readonly DieSpot[] | null) => void;
}) {
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();
  const { step } = useRapier();
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);
  const invalidate = useThree((state) => state.invalidate);

  const aspect = size.width / size.height;
  const view = useMemo(() => fitView(aspect, dice.length), [aspect, dice.length]);
  const key = keyOf(dice);
  const [layout, setLayout] = useState(() => idleLayout(dice, view.bounds, 0));
  // Where thrown dice came to rest; a layout's own poses say where the others sit.
  const [settled, setSettled] = useState<{ generation: number; rests: ReadonlyMap<string, Rest> } | null>(null);

  // A different set of dice starts over, lined up at rest.
  if (layout.key !== key && !layout.moving) setLayout(idleLayout(dice, view.bounds, layout.generation + 1));

  const bodies = useRef(new Map<string, RapierRigidBody>());
  const current = useRef<Throw | null>(null);
  // The API outlives renders, so it reads these through a ref.
  const latest = useRef({ bounds: view.bounds, key, reducedMotion, generation: layout.generation });
  useEffect(() => {
    latest.current = { bounds: view.bounds, key, reducedMotion, generation: layout.generation };
  });

  const register = useCallback<Register>((key, body) => {
    if (body) bodies.current.set(key, body);
    else bodies.current.delete(key);
  }, []);

  useEffect(() => {
    onReady({
      roll(ids) {
        const { bounds, key, reducedMotion } = latest.current;
        const generation = ++latest.current.generation;
        setSettled(null);

        if (reducedMotion) {
          // No tumbling: draw each face fairly and set the dice down showing it.
          const values = ids.map(() => rollDie());
          const poses = atRest(ids, bounds, (i) => values[i], () => (randomFloat() - 0.5) * 0.5);
          setLayout({ key, generation, poses, moving: false });
          return Promise.resolve(values);
        }

        const starts = throwStarts(ids.length, bounds, randomFloat);
        const poses = new Map(ids.map((id, i) => [id, starts[i]]));
        setLayout({ key, generation, poses, moving: true });
        return new Promise((resolve) => {
          current.current = { generation, ids, resolve, settling: SETTLING, waited: 0 };
          invalidate();
        });
      },
    });
  }, [onReady, invalidate]);

  const spots = useMemo(() => {
    if (layout.moving) return null;
    const rests: ReadonlyMap<string, Rest> = settled?.generation === layout.generation ? settled.rests : layout.poses;
    return [...rests].map(([id, { position: p, rotation }]) => ({
      id,
      // Just past the top of the die's far edge, so whatever hangs there sits above it.
      ...screenPoint({ x: p.x, y: p.y + 0.5, z: p.z - 0.62 }, view.camera, aspect),
      value: readTopFace(rotation).value,
    }));
  }, [layout, settled, view, aspect]);
  useEffect(() => onRest(spots), [onRest, spots]);

  /** Ends the throw: reads every die where it lies and hands the faces back. */
  function finish(run: Throw, thrown: readonly (RapierRigidBody | undefined)[]) {
    current.current = null;
    const rests = new Map<string, Rest>();
    const values = thrown.map((body, i) => {
      // A die that never made it onto the table still gets a fair value.
      if (!body) return rollDie();
      const rest = { position: body.translation(), rotation: body.rotation() };
      rests.set(run.ids[i], rest);
      return readTopFace(rest.rotation).value;
    });
    setLayout((layout) => ({ ...layout, moving: false }));
    setSettled({ generation: run.generation, rests });
    run.resolve(values);
  }

  useFrame((_, delta) => {
    const run = current.current;
    if (!run) return;
    invalidate();
    const thrown = run.ids.map((id) => bodies.current.get(bodyKey(run.generation, id)));
    // The new layout's bodies appear a frame or so after the throw starts; one
    // that never does (its die was taken off the table) mustn't keep this loop going.
    if (!thrown.every((body) => body !== undefined)) {
      if (++run.waited >= MAX_WAIT_FRAMES) finish(run, thrown);
      return;
    }

    const frame = Math.min(delta, MAX_FRAME);
    const steps = Math.ceil(frame / MAX_STEP);
    for (let i = 0; i < steps; i++) step(frame / steps);

    const still = thrown.every(
      (body) => body.isSleeping() || (speed(body.linvel()) < STILL_SPEED && speed(body.angvel()) < STILL_SPIN),
    );
    const cocked = thrown.filter((body) => isCocked(body.rotation()));
    const { state, next } = advanceSettle(run.settling, frame, still, cocked.length > 0);
    run.settling = state;
    if (next === "nudge") {
      // Leaning on a wall or another die: bump it so it falls flat.
      for (const body of cocked) {
        body.applyImpulse({ x: (randomFloat() - 0.5) * 1.5, y: 4, z: (randomFloat() - 0.5) * 1.5 }, true);
        body.applyTorqueImpulse({ x: (randomFloat() - 0.5) * 0.4, y: 0, z: (randomFloat() - 0.5) * 0.4 }, true);
      }
    } else if (next === "done") {
      finish(run, thrown);
    }
  });

  if (!colors) return null;
  const specs = new Map(dice.map((die) => [die.id, die]));

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={FOV}
        near={0.5}
        far={100}
        position={[view.camera.x, view.camera.y, view.camera.z]}
        rotation={[-ELEVATION, 0, 0]}
      />
      <ambientLight intensity={Math.PI * 0.3} />
      <directionalLight
        position={[-6, 20, 3]}
        intensity={Math.PI * 0.7}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={6}
        shadow-bias={-0.0005}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {/* An invisible floor that only catches shadows, so they fall on the page itself. */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial transparent opacity={0.18} />
      </mesh>
      <Walls bounds={view.bounds} />

      {[...layout.poses].map(([id, pose]) => {
        const spec = specs.get(id);
        const key = bodyKey(layout.generation, id);
        return (
          spec && (
            <Die
              key={key}
              bodyId={key}
              pose={pose}
              materials={dieMaterials(spec.body, spec.pips, colors.ink)}
              ink={colors.ink}
              outline={2 * dpr}
              register={register}
            />
          )
        );
      })}
    </>
  );
}

function Die({
  bodyId,
  pose,
  materials,
  ink,
  outline,
  register,
}: {
  /** Unique per layout, so a re-thrown die never answers for the one it replaced. */
  bodyId: string;
  pose: Pose;
  materials: MeshToonMaterial[];
  ink: string;
  /** Outline width in device pixels. */
  outline: number;
  register: Register;
}) {
  const ref = useRef<RapierRigidBody>(null);
  useEffect(() => {
    const body = ref.current;
    if (!body) return;
    register(bodyId, body);
    return () => register(bodyId, null);
  }, [bodyId, register]);

  const { position: p, rotation: q, velocity: v, spin: w } = pose;
  return (
    <RigidBody
      ref={ref}
      colliders={false}
      position={[p.x, p.y, p.z]}
      quaternion={[q.x, q.y, q.z, q.w]}
      linearVelocity={[v.x, v.y, v.z]}
      angularVelocity={[w.x, w.y, w.z]}
      linearDamping={0.25}
      angularDamping={0.35}
      ccd
    >
      <RoundCuboidCollider args={[0.38, 0.38, 0.38, 0.12]} friction={0.55} restitution={0.3} />
      <mesh geometry={DIE_GEOMETRY} material={materials} castShadow>
        <Outlines thickness={outline} color={ink} angle={0} />
      </mesh>
    </RigidBody>
  );
}

/** The floor and invisible walls just inside the frame, with a lid so nothing leaves. */
function Walls({ bounds }: { bounds: Bounds }) {
  const { minX, maxX, minZ, maxZ } = bounds;
  const [x, z] = [(minX + maxX) / 2, (minZ + maxZ) / 2];
  const [halfX, halfZ] = [(maxX - minX) / 2 + 2, (maxZ - minZ) / 2 + 2];
  return (
    <RigidBody key={`${minX} ${maxX} ${minZ} ${maxZ}`} type="fixed" colliders={false}>
      <CuboidCollider args={[halfX, 1, halfZ]} position={[x, -1, z]} friction={0.8} restitution={0.25} />
      <CuboidCollider args={[halfX, 1, halfZ]} position={[x, 25, z]} />
      <CuboidCollider args={[1, 12, halfZ]} position={[minX - 1, 12, z]} restitution={0.4} />
      <CuboidCollider args={[1, 12, halfZ]} position={[maxX + 1, 12, z]} restitution={0.4} />
      <CuboidCollider args={[halfX, 12, 1]} position={[x, 12, minZ - 1]} restitution={0.4} />
      <CuboidCollider args={[halfX, 12, 1]} position={[x, 12, maxZ + 1]} restitution={0.4} />
    </RigidBody>
  );
}
