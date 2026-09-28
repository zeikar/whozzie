import { describe, expect, it } from "vitest";
import { covered, follow, followAll, isComplete, land, newGame, tracing, uncover } from "./game";

const NAMES = ["Mina", "Jiho", "Yuna", "Dana"];

describe("newGame", () => {
  it("deals a round only for 2 to 12 players", () => {
    expect(newGame(["Mina"]).round).toBeNull();
    expect(newGame(Array.from({ length: 13 }, (_, i) => `n${i}`)).round).toBeNull();
    expect(newGame(NAMES).round?.lanes).toHaveLength(4);
    expect(covered(newGame(NAMES))).toEqual([0, 1, 2, 3]);
  });

  it("has nothing to trace without a round", () => {
    const game = newGame([]);
    expect(follow(game, 0)).toBe(game);
    expect(followAll(game)).toBe(game);
    expect(isComplete(game)).toBe(false);
  });
});

describe("tracing one line", () => {
  it("traces, then uncovers when it lands", () => {
    const started = follow(newGame(NAMES), 2);
    expect(tracing(started)).toBe(2);
    const landed = land(started, 2);
    expect(tracing(landed)).toBeNull();
    expect(landed.revealed).toEqual([2]);
    expect(covered(landed)).toEqual([0, 1, 3]);
  });

  it("ignores picks while a trace runs, and lines already uncovered", () => {
    const started = follow(newGame(NAMES), 2);
    expect(follow(started, 0)).toBe(started);
    expect(followAll(started)).toBe(started);
    const landed = land(started, 2);
    expect(follow(landed, 2)).toBe(landed);
  });

  it("ignores a landing for a line that isn't being traced", () => {
    const started = follow(newGame(NAMES), 1);
    expect(land(started, 3)).toBe(started);
  });
});

describe("tracing everyone", () => {
  it("runs through the covered lines left to right", () => {
    let game = land(follow(newGame(NAMES), 1), 1);
    game = followAll(game);
    expect(game.run).toEqual([0, 2, 3]);
    for (const column of [0, 2, 3]) {
      expect(tracing(game)).toBe(column);
      expect(isComplete(game)).toBe(false);
      game = land(game, column);
    }
    expect(tracing(game)).toBeNull();
    expect(game.revealed).toEqual([1, 0, 2, 3]);
    expect(isComplete(game)).toBe(true);
    expect(followAll(game)).toBe(game);
  });

  it("keeps the finished run's lines until the next one starts", () => {
    let game = followAll(newGame(NAMES));
    for (const column of [0, 1, 2, 3]) game = land(game, column);
    expect(game.run).toEqual([0, 1, 2, 3]);
    game = land(follow(newGame(NAMES), 2), 2);
    expect(game.run).toEqual([2]);
    expect(followAll(game).run).toEqual([0, 1, 3]);
  });
});

describe("uncover", () => {
  it("reveals lines at once as a finished run, skipping ones already uncovered", () => {
    let game = uncover(newGame(NAMES), [3]);
    expect(game.revealed).toEqual([3]);
    expect(game.run).toEqual([3]);
    game = uncover(game, covered(game));
    expect(game.revealed).toEqual([3, 0, 1, 2]);
    expect(game.run).toEqual([0, 1, 2]);
    expect(tracing(game)).toBeNull();
    expect(isComplete(game)).toBe(true);
    expect(uncover(game, [0])).toBe(game);
  });

  it("waits for a running trace", () => {
    const started = follow(newGame(NAMES), 1);
    expect(uncover(started, [0])).toBe(started);
  });
});
