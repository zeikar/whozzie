import { describe, expect, it } from "vitest";
import { parsePersisted } from "@/lib/use-persisted-state";
import { DEFAULT_SETTINGS, MAX_DICE, parseSettings } from "./settings";

describe("parseSettings", () => {
  it("accepts both modes with any count from 1 to MAX_DICE", () => {
    expect(parseSettings({ mode: "everyone", count: 2 })).toEqual({ mode: "everyone", count: 2 });
    expect(parseSettings({ mode: "justRoll", count: 1 })).toEqual({ mode: "justRoll", count: 1 });
    expect(parseSettings({ mode: "justRoll", count: MAX_DICE })).toEqual({ mode: "justRoll", count: MAX_DICE });
  });

  it("keeps only the known fields", () => {
    expect(parseSettings({ mode: "justRoll", count: 3, extra: true })).toEqual({ mode: "justRoll", count: 3 });
  });

  it("rejects anything that isn't a settings object", () => {
    for (const value of [null, undefined, "justRoll", 3, [], true]) expect(parseSettings(value)).toBeUndefined();
  });

  it("rejects an unknown mode", () => {
    expect(parseSettings({ mode: "someone", count: 2 })).toBeUndefined();
    expect(parseSettings({ count: 2 })).toBeUndefined();
  });

  it("rejects a count the table can't show", () => {
    for (const count of [0, -1, MAX_DICE + 1, 2.5, Number.NaN, "2", null]) {
      expect(parseSettings({ mode: "justRoll", count })).toBeUndefined();
    }
  });

  it("falls back from a corrupt save through the shared loader", () => {
    expect(parsePersisted('{"mode":"justRoll","count":4}', parseSettings)).toEqual({ mode: "justRoll", count: 4 });
    expect(parsePersisted('{"mode":"justRoll","count":9}', parseSettings) ?? DEFAULT_SETTINGS).toBe(DEFAULT_SETTINGS);
  });
});
