/**
 * When a throw is over, decided one frame at a time: every die has to sit
 * still for a moment; a die left leaning on something gets a nudge, a few
 * times at most; and stragglers are cut off at a deadline.
 */

/** How long every die must stay still to count as settled, in seconds. */
export const STILL_FOR = 0.25;
/** Stop waiting after this long and read whatever is showing. */
export const TIMEOUT = 7;
/** A nudged die gets this much longer to fall flat. */
export const NUDGE_TIMEOUT = 3;
export const MAX_NUDGES = 3;

export type Settling = { elapsed: number; stillFor: number; deadline: number; nudges: number };

export const SETTLING: Settling = { elapsed: 0, stillFor: 0, deadline: TIMEOUT, nudges: 0 };

/**
 * One frame of `frame` seconds, given whether every die is still and whether
 * any is cocked. "wait" for another frame, "nudge" the cocked dice, or "done":
 * read the faces.
 */
export function advanceSettle(
  state: Settling,
  frame: number,
  still: boolean,
  cocked: boolean,
): { state: Settling; next: "wait" | "nudge" | "done" } {
  const elapsed = state.elapsed + frame;
  const stillFor = still ? state.stillFor + frame : 0;
  if (stillFor < STILL_FOR && elapsed < state.deadline) return { state: { ...state, elapsed, stillFor }, next: "wait" };
  if (cocked && state.nudges < MAX_NUDGES) {
    return {
      state: { elapsed, stillFor: 0, deadline: elapsed + NUDGE_TIMEOUT, nudges: state.nudges + 1 },
      next: "nudge",
    };
  }
  return { state: { ...state, elapsed, stillFor }, next: "done" };
}
