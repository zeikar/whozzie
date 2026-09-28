import { describe, expect, it } from "vitest";
import { MAX_NAME_LENGTH, MAX_NAMES, mergeNames, parseNames } from "./names";

describe("parseNames", () => {
  it("splits on newlines, commas and tabs and trims", () => {
    expect(parseNames(" Minsu \nJiyoung,  Chulsoo\tYuna ")).toEqual([
      "Minsu",
      "Jiyoung",
      "Chulsoo",
      "Yuna",
    ]);
  });

  it("drops blank entries", () => {
    expect(parseNames("\n , ,\n\n")).toEqual([]);
  });

  it("caps each name's length", () => {
    const [name] = parseNames("x".repeat(MAX_NAME_LENGTH + 10));
    expect(name).toHaveLength(MAX_NAME_LENGTH);
  });
});

describe("mergeNames", () => {
  it("appends new names and reports duplicates", () => {
    const result = mergeNames(["a", "b"], ["b", "c", "c"]);
    expect(result.names).toEqual(["a", "b", "c"]);
    expect(result.added).toEqual(["c"]);
    expect(result.duplicates).toEqual(["b", "c"]);
  });

  it("stops at MAX_NAMES", () => {
    const full = Array.from({ length: MAX_NAMES - 1 }, (_, i) => `n${i}`);
    const result = mergeNames(full, ["x", "y"]);
    expect(result.names).toHaveLength(MAX_NAMES);
    expect(result.added).toEqual(["x"]);
    expect(result.overflow).toEqual(["y"]);
  });
});
