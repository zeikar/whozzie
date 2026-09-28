import { describe, expect, it } from "vitest";
import {
  CHIP_HEIGHT,
  FLAP_HEIGHT,
  PEEL_MS,
  REVEAL_ALL_MS,
  TAPE_OVERHANG,
  TRACE_MS,
  lanePath,
  layout,
  maxBoardWidth,
  minBoardWidth,
  scrollToShow,
  traceTiming,
  type Geometry,
} from "./geometry";
import { MAX_PLAYERS, MIN_PLAYERS, dealRound, generateLadder, type Ladder, type Rng } from "./ladder";

type Box = { left: number; right: number; top: number; bottom: number };

/** A rung wherever the rules allow one: the most rungs sharing each line. */
const dense: Rng = { int: () => 0, float: () => 0 };

/** Every board size worth checking: the narrowest, around the stagger switch, and the widest. */
function boards(check: (geometry: Geometry, ladder: Ladder, width: number) => void) {
  for (let columns = MIN_PLAYERS; columns <= MAX_PLAYERS; columns++) {
    const min = minBoardWidth(columns);
    const max = maxBoardWidth(columns);
    const widths = [min, min + 1, columns * 95.9, columns * 96, (min + max) / 2, max];
    for (const ladder of [generateLadder(columns), generateLadder(columns, dense)]) {
      for (const width of widths) check(layout(width, ladder), ladder, width);
    }
  }
}

const points = (d: string) =>
  [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(([, x, y]) => [Number(x), Number(y)] as const);

const overlaps = (a: Box, b: Box) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

function chipBox(geometry: Geometry, column: number): Box {
  const x = geometry.x(column);
  const top = geometry.chipTop(column);
  return { left: x - geometry.labelWidth / 2, right: x + geometry.labelWidth / 2, top, bottom: top + CHIP_HEIGHT };
}

function flapBox(geometry: Geometry, column: number): Box {
  const x = geometry.x(column);
  const top = geometry.flapTop(column);
  return { left: x - geometry.flapWidth / 2, right: x + geometry.flapWidth / 2, top, bottom: top + FLAP_HEIGHT };
}

const tapeBox = (geometry: Geometry, column: number): Box => {
  const flap = flapBox(geometry, column);
  return {
    left: flap.left - TAPE_OVERHANG.x,
    right: flap.right + TAPE_OVERHANG.x,
    top: flap.top - TAPE_OVERHANG.y,
    bottom: flap.bottom + TAPE_OVERHANG.y,
  };
};

/** A line as drawn, thick enough to cover its stroke and hand-drawn wobble. */
function lineBox(geometry: Geometry, column: number): Box {
  const x = geometry.x(column);
  return { left: x - 4, right: x + 4, top: geometry.lineTop(column), bottom: geometry.flapTop(column) };
}

describe("layout", () => {
  it("keeps every name and taped result on the board", () => {
    boards((geometry, ladder, width) => {
      for (let column = 0; column < ladder.columns; column++) {
        for (const box of [chipBox(geometry, column), tapeBox(geometry, column)]) {
          expect(box.left).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(width);
          expect(box.bottom).toBeLessThanOrEqual(geometry.height + TAPE_OVERHANG.y);
        }
      }
    });
  });

  it("keeps names and taped results off each other and off the neighbouring lines", () => {
    boards((geometry, ladder) => {
      for (let column = 0; column < ladder.columns; column++) {
        for (const other of [column + 1, column + 2]) {
          if (other >= ladder.columns) continue;
          expect(overlaps(chipBox(geometry, column), chipBox(geometry, other))).toBe(false);
          expect(overlaps(flapBox(geometry, column), flapBox(geometry, other))).toBe(false);
        }
        for (const line of [column - 1, column + 1]) {
          if (line < 0 || line >= ladder.columns) continue;
          expect(overlaps(chipBox(geometry, column), lineBox(geometry, line))).toBe(false);
          expect(overlaps(tapeBox(geometry, column), lineBox(geometry, line))).toBe(false);
        }
      }
    });
  });

  it("keeps rungs between the ends of every line, in order down each line", () => {
    boards((geometry, ladder) => {
      const tops = Array.from({ length: ladder.columns }, (_, column) => geometry.lineTop(column));
      const bottoms = Array.from({ length: ladder.columns }, (_, column) => geometry.flapTop(column));
      for (let line = 0; line < ladder.columns; line++) {
        // The rungs touching this line, top to bottom by row.
        const ys = ladder.rungs.flatMap((row, r) =>
          row[line] ? [geometry.rungY(r, line)] : row[line - 1] ? [geometry.rungY(r, line - 1)] : [],
        );
        ys.forEach((y, i) => {
          expect(y).toBeGreaterThan(Math.max(...tops));
          expect(y).toBeLessThan(Math.min(...bottoms));
          if (i > 0) expect(y).toBeGreaterThan(ys[i - 1]);
        });
      }
    });
  });
});

describe("lanePath", () => {
  it("runs down the drawn lines and across the drawn rungs, end to end", () => {
    for (let columns = MIN_PLAYERS; columns <= MAX_PLAYERS; columns++) {
      for (const width of [minBoardWidth(columns), maxBoardWidth(columns)]) {
        const { ladder, lanes } = dealRound(columns);
        const geometry = layout(width, ladder);
        const lineAt = (x: number) =>
          Array.from({ length: columns }, (_, column) => column).find((column) => Math.abs(geometry.x(column) - x) < 0.01);

        lanes.forEach((lane, start) => {
          const { d, length } = lanePath(lane, geometry);
          const path = points(d);
          const [first, last] = [path[0], path[path.length - 1]];
          expect(first[0]).toBeCloseTo(geometry.x(start), 1);
          expect(first[1]).toBeCloseTo(geometry.lineTop(start), 1);
          expect(last[0]).toBeCloseTo(geometry.x(lane.end), 1);
          expect(last[1]).toBeCloseTo(geometry.flapTop(lane.end), 1);

          let walked = 0;
          for (let i = 1; i < path.length; i++) {
            const [[x1, y1], [x2, y2]] = [path[i - 1], path[i]];
            walked += Math.hypot(x2 - x1, y2 - y1);
            const [from, to] = [lineAt(x1), lineAt(x2)];
            expect(from).toBeDefined();
            expect(to).toBeDefined();
            if (from === to) {
              // Down a line, never back up.
              expect(y2).toBeGreaterThan(y1);
              continue;
            }
            // Across to the next line, on a rung that's on the ladder, at the height it's drawn.
            expect(y2).toBe(y1);
            expect(Math.abs(to! - from!)).toBe(1);
            const gap = Math.min(from!, to!);
            const rung = ladder.rungs.findIndex((row, r) => row[gap] && Math.abs(geometry.rungY(r, gap) - y1) < 0.01);
            expect(rung, `a rung in gap ${gap} at y ${y1}`).toBeGreaterThanOrEqual(0);
          }
          expect(length).toBeCloseTo(walked, 0);
        });
      }
    }
  });
});

describe("traceTiming", () => {
  it("takes 1.5 to 2.5 seconds for a single line, longer for longer paths", () => {
    expect(traceTiming(100, 1)).toEqual({ trace: TRACE_MS.min, peel: PEEL_MS });
    expect(traceTiming(5000, 1)).toEqual({ trace: TRACE_MS.max, peel: PEEL_MS });
    expect(traceTiming(900, 1).trace).toBeGreaterThan(traceTiming(700, 1).trace);
  });

  it("keeps a short Reveal all at the usual speed", () => {
    for (const lines of [2, 3]) expect(traceTiming(900, lines)).toEqual(traceTiming(900, 1));
  });

  it("speeds up a long Reveal all, without going too fast to follow", () => {
    const total = (lines: number) => lines * (traceTiming(5000, lines).trace + traceTiming(5000, lines).peel);
    for (let lines = 2; lines <= 8; lines++) expect(total(lines)).toBeLessThanOrEqual(REVEAL_ALL_MS + 1e-6);
    expect(total(MAX_PLAYERS)).toBeLessThan(15_000);
    for (let lines = 2; lines <= MAX_PLAYERS; lines++) {
      expect(traceTiming(0, lines).trace).toBeGreaterThanOrEqual(600);
      expect(traceTiming(900, lines).trace).toBeLessThanOrEqual(traceTiming(900, lines - 1).trace);
    }
  });
});

describe("scrollToShow", () => {
  // A 390px screen scrolled 100px into the board, with 40px kept around each end.
  const view = { pad: 40, scrollLeft: 100, width: 390 };
  const scroll = (from: number, to: number) => scrollToShow(from, to, view.pad, view.scrollLeft, view.width);

  it("leaves the board alone when both ends are already in view", () => {
    expect(scroll(150, 440)).toBeNull();
    expect(scroll(300, 300)).toBeNull();
  });

  it("centres both ends when they fit on screen together", () => {
    expect(scroll(500, 300)).toBe(400 - 195);
    expect(scroll(20, 20)).toBe(20 - 195);
  });

  it("centres the leading end when both don't fit", () => {
    expect(scroll(700, 150)).toBe(700 - 195);
    expect(scroll(150, 700)).toBe(150 - 195);
  });
});
