import { describe, expect, it } from "vitest";
import { fitLabel, labelWidth, sliceAtPointer, targetRotation, upsideDown } from "./geometry";

describe("sliceAtPointer", () => {
  it("reads slice 0 at rest", () => {
    // The pointer sits on the boundary between the last slice and slice 0 at
    // rotation 0; a hair of clockwise turn backs slice n-1 under it.
    expect(sliceAtPointer(-1, 4)).toBe(0);
    expect(sliceAtPointer(1, 4)).toBe(3);
  });

  it("walks backwards through slices as the wheel turns clockwise", () => {
    expect(sliceAtPointer(90 + 45, 4)).toBe(2);
    expect(sliceAtPointer(360 * 7 + 270 + 10, 4)).toBe(0);
  });
});

describe("targetRotation", () => {
  it("lands the chosen slice under the pointer", () => {
    for (const count of [1, 2, 3, 7, 12, 50]) {
      for (let index = 0; index < count; index++) {
        for (const offset of [0.1, 0.5, 0.9]) {
          const from = 1234.5;
          const to = targetRotation(from, index, count, offset, 5);
          expect(sliceAtPointer(to, count)).toBe(index);
          expect(to - from).toBeGreaterThanOrEqual(5 * 360);
          expect(to - from).toBeLessThan(6 * 360);
        }
      }
    }
  });

  it("supports a spin with no extra turns", () => {
    const to = targetRotation(0, 2, 5, 0.5, 0);
    expect(sliceAtPointer(to, 5)).toBe(2);
    expect(to).toBeGreaterThanOrEqual(0);
    expect(to).toBeLessThan(360);
  });
});

describe("upsideDown", () => {
  it("flips labels that point into the left half", () => {
    expect(upsideDown(270)).toBe(true);
    expect(upsideDown(181)).toBe(true);
    expect(upsideDown(359)).toBe(true);
    expect(upsideDown(90)).toBe(false);
    expect(upsideDown(1)).toBe(false);
    expect(upsideDown(179)).toBe(false);
  });

  it("leaves straight up and straight down as they are", () => {
    expect(upsideDown(0)).toBe(false);
    expect(upsideDown(180)).toBe(false);
    expect(upsideDown(360)).toBe(false);
  });

  it("works on the turned wheel's angles, past a full turn or below zero", () => {
    expect(upsideDown(45 + 180)).toBe(true);
    expect(upsideDown(90 + 720)).toBe(false);
    expect(upsideDown(-45)).toBe(true);
  });
});

describe("fitLabel", () => {
  it("keeps labels that fit", () => {
    expect(fitLabel("Mina", 20, 200)).toBe("Mina");
  });

  it("cuts long labels with an ellipsis that still fits", () => {
    for (const text of ["Bartholomew the Third", "가나다라마바사아자차"]) {
      const label = fitLabel(text, 20, 80);
      expect(label.endsWith("…")).toBe(true);
      expect(labelWidth(label.slice(0, -1), 20) + 0.6 * 20).toBeLessThanOrEqual(80);
    }
  });

  it("treats Hangul as wider than Latin", () => {
    expect(fitLabel("가나다라마바사", 20, 80)).toBe("가나다…");
    expect(fitLabel("abcdefghijk", 20, 80)).toBe("abcdef…");
  });
});
