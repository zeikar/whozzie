/**
 * The results written along the bottom of the ladder, one per player. A preset
 * fills them in; typing into any of them switches to custom and keeps the text.
 */

export type Preset = "winner" | "order" | "custom";

export const PRESETS: readonly Preset[] = ["winner", "order", "custom"];

export type Results = {
  preset: Preset;
  /** What the user wrote. Kept when the count shrinks, so taking a name off and back doesn't lose text. */
  custom: readonly string[];
};

export const INITIAL_RESULTS: Results = { preset: "winner", custom: [] };

/** Switches preset. `showing` is what the slots say now. */
export function choose(results: Results, preset: Preset, showing: readonly string[]): Results {
  // Custom starts from what's showing, unless there's earlier custom text to return to.
  if (preset === "custom" && !results.custom.some((text) => text.trim())) return { preset, custom: showing };
  return { ...results, preset };
}

/** Writes `text` into slot `index`, switching to custom and keeping what the other slots say. */
export function edit(results: Results, showing: readonly string[], index: number, text: string): Results {
  const custom = [...showing, ...(results.preset === "custom" ? results.custom.slice(showing.length) : [])];
  custom[index] = text;
  return { preset: "custom", custom };
}
