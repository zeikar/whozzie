import { describe, expect, it } from "vitest";
import { MAX_PLAYERS } from "./ladder";
import { INITIAL_RESULTS, MAX_RESULT_LENGTH, choose, edit, parseResults } from "./results";

const WINNER = ["Winner", "Nope", "Nope"];
const ORDER = ["1st", "2nd", "3rd"];

describe("edit", () => {
  it("switches to custom and keeps what the other slots say", () => {
    expect(edit(INITIAL_RESULTS, WINNER, 1, "Coffee")).toEqual({ preset: "custom", custom: ["Winner", "Coffee", "Nope"] });
    expect(edit({ preset: "order", custom: ["old"] }, ORDER, 0, "")).toEqual({ preset: "custom", custom: ["", "2nd", "3rd"] });
  });

  it("keeps custom text past the current count, for names taken off and put back", () => {
    const results = { preset: "custom" as const, custom: ["a", "b", "c", "d"] };
    expect(edit(results, ["a", "b", "c"], 0, "x").custom).toEqual(["x", "b", "c", "d"]);
  });
});

describe("choose", () => {
  it("starts custom from what's showing", () => {
    expect(choose(INITIAL_RESULTS, "custom", WINNER)).toEqual({ preset: "custom", custom: WINNER });
    // Blank earlier text doesn't count as something to return to.
    expect(choose({ preset: "order", custom: [" ", ""] }, "custom", ORDER).custom).toEqual(ORDER);
  });

  it("returns to earlier custom text, and keeps it while a preset is showing", () => {
    const written = edit(INITIAL_RESULTS, WINNER, 2, "Dishes");
    const order = choose(written, "order", ["Winner", "Nope", "Dishes"]);
    expect(order).toEqual({ preset: "order", custom: written.custom });
    expect(choose(order, "custom", ORDER)).toEqual(written);
  });
});

describe("parseResults", () => {
  it("accepts saved results", () => {
    expect(parseResults(INITIAL_RESULTS)).toEqual(INITIAL_RESULTS);
    const saved = { preset: "order", custom: ["Coffee", "", "Dishes"] };
    expect(parseResults(saved)).toEqual(saved);
  });

  it("rejects anything that isn't a preset and a list of result texts", () => {
    expect(parseResults(null)).toBeUndefined();
    expect(parseResults("winner")).toBeUndefined();
    expect(parseResults({ preset: "lottery", custom: [] })).toBeUndefined();
    expect(parseResults({ preset: "custom" })).toBeUndefined();
    expect(parseResults({ preset: "custom", custom: "Coffee" })).toBeUndefined();
    expect(parseResults({ preset: "custom", custom: ["Coffee", 2] })).toBeUndefined();
  });

  it("rejects more results, or longer ones, than the card lets you write", () => {
    expect(parseResults({ preset: "custom", custom: Array(MAX_PLAYERS + 1).fill("") })).toBeUndefined();
    expect(parseResults({ preset: "custom", custom: ["x".repeat(MAX_RESULT_LENGTH + 1)] })).toBeUndefined();
  });
});
