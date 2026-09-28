/**
 * The results written along the bottom of the ladder, one per player. A preset
 * fills them in; typing into any of them switches to custom and keeps the text.
 */

import { MAX_PLAYERS } from "./ladder";

export type Preset = "winner" | "order" | "custom";

export const PRESETS: readonly Preset[] = ["winner", "order", "custom"];

export const MAX_RESULT_LENGTH = 24;

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

/** Results saved on an earlier visit, or undefined if they aren't ones the card could have written. */
export function parseResults(value: unknown): Results | undefined {
  if (typeof value !== "object" || value === null || !("preset" in value) || !("custom" in value)) return undefined;
  const { preset, custom } = value;
  const known = PRESETS.find((option) => option === preset);
  if (known === undefined || !Array.isArray(custom) || custom.length > MAX_PLAYERS) return undefined;
  const texts = custom.filter((text): text is string => typeof text === "string" && text.length <= MAX_RESULT_LENGTH);
  return texts.length === custom.length ? { preset: known, custom: texts } : undefined;
}
