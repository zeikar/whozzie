import { describe, expect, it } from "vitest";
import { hashString, randomInt, seededRandom, shuffle } from "./random";

describe("randomInt", () => {
  it("stays within [0, max)", () => {
    for (let i = 0; i < 2000; i++) {
      const value = randomInt(7);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(7);
    }
  });

  it("covers every outcome roughly evenly", () => {
    const counts = new Array(5).fill(0);
    const draws = 50_000;
    for (let i = 0; i < draws; i++) counts[randomInt(5)]++;
    for (const count of counts) {
      // ±6% of the expected 10k is far outside any plausible fluctuation.
      expect(Math.abs(count - draws / 5)).toBeLessThan(600);
    }
  });

  it("rejects invalid bounds", () => {
    expect(() => randomInt(0)).toThrow(RangeError);
    expect(() => randomInt(2.5)).toThrow(RangeError);
  });
});

describe("shuffle", () => {
  it("returns a permutation without touching the input", () => {
    const input = ["a", "b", "c", "d", "e"];
    const result = shuffle(input);
    expect(result).not.toBe(input);
    expect([...result].sort()).toEqual(input);
    expect(input).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("puts each item in each slot with equal probability", () => {
    const hits = [0, 0, 0];
    const rounds = 30_000;
    for (let i = 0; i < rounds; i++) hits[shuffle([0, 1, 2]).indexOf(0)]++;
    for (const count of hits) expect(Math.abs(count - rounds / 3)).toBeLessThan(600);
  });
});

describe("seededRandom", () => {
  it("is deterministic per seed", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(seededRandom(1)()).not.toBe(seededRandom(2)());
  });

  it("produces values in [0, 1)", () => {
    const next = seededRandom(hashString("whozzie"));
    for (let i = 0; i < 1000; i++) {
      const value = next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
