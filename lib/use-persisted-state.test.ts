import { describe, expect, it, vi } from "vitest";
import { parsePersisted } from "./use-persisted-state";

const MODES = ["everyone", "justRoll"] as const;
type Mode = (typeof MODES)[number];
const parseMode = (value: unknown) => MODES.find((mode) => mode === value);

describe("parsePersisted", () => {
  it("returns a valid saved value", () => {
    expect(parsePersisted('"justRoll"', parseMode)).toBe("justRoll");
  });

  it("is undefined when nothing was saved", () => {
    expect(parsePersisted<Mode>(null, parseMode)).toBeUndefined();
  });

  it("is undefined when the saved value fails validation", () => {
    expect(parsePersisted('"sometimes"', parseMode)).toBeUndefined();
    expect(parsePersisted("42", parseMode)).toBeUndefined();
  });

  it("is undefined, with a warning, when the saved JSON is corrupt", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(parsePersisted("{not json", parseMode)).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("passes structured values through the validator", () => {
    const parseCount = (value: unknown) =>
      typeof value === "object" && value !== null && "count" in value && value.count === 3 ? { count: 3 } : undefined;
    expect(parsePersisted('{"count":3}', parseCount)).toEqual({ count: 3 });
    expect(parsePersisted('{"count":"3"}', parseCount)).toBeUndefined();
  });
});
