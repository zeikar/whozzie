export type DiceMode = "everyone" | "justRoll";

/** How the dice page rolls; remembered across visits. */
type RollSettings = { mode: DiceMode; count: number };

/** Most plain dice "Just roll" throws at once. */
export const MAX_DICE = 6;

export const DEFAULT_SETTINGS: RollSettings = { mode: "everyone", count: 2 };

/** A saved value back as settings, or undefined if it isn't a valid one (hand-edited, or from another version). */
export function parseSettings(value: unknown): RollSettings | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const { mode, count } = value as Record<string, unknown>;
  if (mode !== "everyone" && mode !== "justRoll") return undefined;
  if (typeof count !== "number" || !Number.isInteger(count) || count < 1 || count > MAX_DICE) return undefined;
  return { mode, count };
}
