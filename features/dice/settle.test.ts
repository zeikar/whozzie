import { describe, expect, it } from "vitest";
import { MAX_NUDGES, NUDGE_TIMEOUT, SETTLING, STILL_FOR, TIMEOUT, advanceSettle, type Settling } from "./settle";

const FRAME = 1 / 60;

/** Runs frames until something other than "wait" happens; returns it and how long it took. */
function runUntil(state: Settling, still: (elapsed: number) => boolean, cocked: boolean) {
  for (let i = 0; i < 100_000; i++) {
    const result = advanceSettle(state, FRAME, still(state.elapsed), cocked);
    state = result.state;
    if (result.next !== "wait") return { next: result.next, state };
  }
  throw new Error("never stopped waiting");
}

describe("advanceSettle", () => {
  it("finishes once every die has been still for a moment", () => {
    const { next, state } = runUntil(SETTLING, (elapsed) => elapsed > 1.5, false);
    expect(next).toBe("done");
    expect(state.elapsed).toBeGreaterThan(1.5 + STILL_FOR - FRAME);
    expect(state.elapsed).toBeLessThan(1.5 + STILL_FOR + 2 * FRAME);
  });

  it("starts the stillness count over when a die moves again", () => {
    const { state } = runUntil(SETTLING, (elapsed) => elapsed < 0.2 || elapsed > 0.4, false);
    expect(state.elapsed).toBeGreaterThan(0.4 + STILL_FOR - FRAME);
  });

  it("gives up waiting at the deadline", () => {
    const { next, state } = runUntil(SETTLING, () => false, false);
    expect(next).toBe("done");
    expect(state.elapsed).toBeCloseTo(TIMEOUT, 1);
  });

  it("nudges a cocked die and gives it more time", () => {
    const { next, state } = runUntil(SETTLING, () => true, true);
    expect(next).toBe("nudge");
    expect(state).toMatchObject({ nudges: 1, stillFor: 0 });
    expect(state.deadline).toBeCloseTo(state.elapsed + NUDGE_TIMEOUT, 9);
  });

  it("stops nudging after a few tries and reads what's there", () => {
    let state = SETTLING;
    const seen: string[] = [];
    for (;;) {
      const result = runUntil(state, () => true, true);
      seen.push(result.next);
      state = result.state;
      if (result.next === "done") break;
    }
    expect(seen).toEqual([...Array(MAX_NUDGES).fill("nudge"), "done"]);
  });
});
