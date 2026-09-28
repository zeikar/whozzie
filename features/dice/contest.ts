import type { DieValue } from "./faces";

/** What each player still in the running threw in one round. */
export type Round = ReadonlyArray<{ name: string; value: DieValue }>;

/** A place in the final standings; everyone with the same rolls shares it. */
export type Place = { place: number; names: string[]; rolls: DieValue[] };

/** Everyone sharing the highest value in a round. */
export function leaders(round: Round): string[] {
  const top = Math.max(...round.map((roll) => roll.value));
  return round.filter((roll) => roll.value === top).map((roll) => roll.name);
}

/**
 * Everyone rolls; while the top is shared, only those tied roll again.
 * Resolves with every round played; the last one has a single leader, the pick.
 */
export async function playOff(
  players: readonly string[],
  roll: (players: readonly string[]) => Promise<Round>,
  onRound: (rounds: readonly Round[]) => Promise<void> | void,
): Promise<Round[]> {
  const rounds: Round[] = [];
  let remaining = players;
  for (;;) {
    const round = await roll(remaining);
    rounds.push(round);
    await onRound(rounds);
    remaining = leaders(round);
    if (remaining.length === 1) return rounds;
  }
}

// Higher first roll wins; among players tied on it, the tie-break rolls decide.
function compareRolls(a: readonly number[], b: readonly number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const difference = (a[i] ?? 0) - (b[i] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

/** The standings after `rounds`, best first, in "1, 2, 2, 4" style places. */
export function standings(rounds: readonly Round[]): Place[] {
  const rolls = new Map<string, DieValue[]>();
  for (const round of rounds) {
    for (const { name, value } of round) rolls.set(name, [...(rolls.get(name) ?? []), value]);
  }
  const places: Place[] = [];
  [...rolls]
    .sort(([, a], [, b]) => compareRolls(b, a))
    .forEach(([name, record], index) => {
      const previous = places.at(-1);
      if (previous && compareRolls(previous.rolls, record) === 0) previous.names.push(name);
      else places.push({ place: index + 1, names: [name], rolls: record });
    });
  return places;
}
