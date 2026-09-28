import { describe, expect, it } from "vitest";
import { MAX_PLAYERS, MIN_PLAYERS, dealRound, generateLadder, rowsFor, trace, type Ladder, type Rng } from "./ladder";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Only the rungs every pair must have: the sparsest ladder the generator can make. */
const sparse: Rng = { int: () => 0, float: () => 0.99 };
/** A rung wherever the rules allow one. */
const dense: Rng = { int: () => 0, float: () => 0 };

function expectValidRungs(ladder: Ladder) {
  expect(ladder.rungs).toHaveLength(ladder.rows);
  ladder.rungs.forEach((row, r) => {
    expect(row).toHaveLength(ladder.columns - 1);
    // No two rungs in a row share a line.
    for (let gap = 1; gap < row.length; gap++) expect(row[gap] && row[gap - 1]).toBe(false);
    // No rung sits right under another in the same gap.
    if (r > 0) row.forEach((rung, gap) => expect(rung && ladder.rungs[r - 1][gap]).toBe(false));
  });
  for (let gap = 0; gap < ladder.columns - 1; gap++) {
    expect(ladder.rungs.some((row) => row[gap]), `gap ${gap} has a rung`).toBe(true);
  }
}

describe("generateLadder", () => {
  it("uses at least 8 rows, growing with the number of lines", () => {
    expect(rowsFor(2)).toBe(8);
    expect(rowsFor(4)).toBe(8);
    expect(rowsFor(12)).toBe(24);
    expect(generateLadder(7).rows).toBe(14);
  });

  it("follows the rung rules at every size", () => {
    for (let columns = MIN_PLAYERS; columns <= MAX_PLAYERS; columns++) {
      for (let i = 0; i < 50; i++) expectValidRungs(generateLadder(columns));
      expectValidRungs(generateLadder(columns, sparse));
      expectValidRungs(generateLadder(columns, dense));
    }
  });

  it("joins every neighbouring pair even when no extra rungs are drawn", () => {
    const ladder = generateLadder(6, sparse);
    const perGap = range(5).map((gap) => ladder.rungs.filter((row) => row[gap]).length);
    expect(perGap).toEqual([1, 1, 1, 1, 1]);
  });
});

describe("trace", () => {
  it("maps starts to ends one-to-one", () => {
    for (let columns = MIN_PLAYERS; columns <= MAX_PLAYERS; columns++) {
      for (let i = 0; i < 50; i++) {
        const ladder = generateLadder(columns);
        const ends = range(columns).map((start) => trace(ladder, start).end);
        expect([...ends].sort((a, b) => a - b)).toEqual(range(columns));
      }
    }
  });

  it("walks straight down and crosses exactly at the rungs", () => {
    const ladder: Ladder = {
      columns: 3,
      rows: 3,
      rungs: [
        [true, false],
        [false, false],
        [false, true],
      ],
    };
    expect(trace(ladder, 0)).toEqual({
      end: 2,
      points: [
        [0, 0],
        [0, 0.5],
        [1, 0.5],
        [1, 2.5],
        [2, 2.5],
        [2, 3],
      ],
    });
    expect(trace(ladder, 2)).toEqual({ end: 1, points: [[2, 0], [2, 2.5], [1, 2.5], [1, 3]] });
  });

  it("draws a path that only moves along lines and rungs", () => {
    const ladder = generateLadder(8);
    for (let start = 0; start < 8; start++) {
      const { end, points } = trace(ladder, start);
      expect(points[0]).toEqual([start, 0]);
      expect(points.at(-1)).toEqual([end, ladder.rows]);
      for (let i = 1; i < points.length; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        if (x0 === x1) {
          expect(y1).toBeGreaterThan(y0);
        } else {
          expect(y1).toBe(y0);
          expect(Math.abs(x1 - x0)).toBe(1);
          expect(ladder.rungs[y0 - 0.5][Math.min(x0, x1)]).toBe(true);
        }
      }
    }
  });
});

describe("dealRound", () => {
  it("seats every player once and gives out every result once", () => {
    const { lanes } = dealRound(9);
    expect(lanes.map((lane) => lane.player).sort((a, b) => a - b)).toEqual(range(9));
    expect(lanes.map((lane) => lane.result).sort((a, b) => a - b)).toEqual(range(9));
  });

  // Each check is ~6 standard deviations wide, so a fair draw essentially never fails it.
  it("gives each player each result about 1/n of the time", () => {
    const players = 5;
    const rounds = 20_000;
    const hits = range(players).map(() => new Array<number>(players).fill(0));
    for (let i = 0; i < rounds; i++) {
      for (const lane of dealRound(players).lanes) hits[lane.player][lane.result]++;
    }
    for (const row of hits) {
      for (const count of row) expect(Math.abs(count - rounds / players)).toBeLessThan(340);
    }
  });

  it("stays fair when the rungs fall the same way every time", () => {
    // With `sparse` every round gets the identical ladder, so any fairness left
    // comes from how players and results are seated around it.
    const players = 4;
    const rounds = 20_000;
    const hits = new Array<number>(players).fill(0);
    for (let i = 0; i < rounds; i++) {
      const lane = dealRound(players, sparse).lanes.find((l) => l.player === 0);
      hits[lane!.result]++;
    }
    for (const count of hits) expect(Math.abs(count - rounds / players)).toBeLessThan(370);
  });

  it("makes every assignment of results equally likely", () => {
    const rounds = 30_000;
    const counts = new Map<string, number>();
    for (let i = 0; i < rounds; i++) {
      const byPlayer = [...dealRound(3).lanes].sort((a, b) => a.player - b.player).map((lane) => lane.result);
      const key = byPlayer.join("");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    expect(counts.size).toBe(6);
    for (const count of counts.values()) expect(Math.abs(count - rounds / 6)).toBeLessThan(400);
  });
});
