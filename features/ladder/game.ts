/**
 * Play state for one round: which lines have been followed to the bottom, and
 * which are being traced now. Every function returns a new Game (or the same one
 * when the move isn't allowed), so the picker can hold it in plain React state.
 */

import { dealRound, isPlayable, type Round } from "./ladder";

export type Game = {
  /** The names list this round was dealt for; a different list needs a new round. */
  names: readonly string[];
  round: Round | null;
  /** Columns whose results are uncovered, in the order they landed. */
  revealed: readonly number[];
  /**
   * The lines of the latest pick or "Reveal all", in the order they're traced. The
   * first one still covered is being traced now; once none is, the run is over.
   */
  run: readonly number[];
};

export function newGame(names: readonly string[]): Game {
  return { names, round: isPlayable(names.length) ? dealRound(names.length) : null, revealed: [], run: [] };
}

/** The line being traced now, if any. */
export const tracing = (game: Game): number | null =>
  game.run.find((column) => !game.revealed.includes(column)) ?? null;

/** Columns whose results are still covered, left to right. */
export function covered(game: Game): number[] {
  if (!game.round) return [];
  return game.round.lanes.map((_, column) => column).filter((column) => !game.revealed.includes(column));
}

export const isComplete = (game: Game) =>
  game.round !== null && game.revealed.length === game.round.lanes.length;

/** Starts tracing one line, unless another trace is running or it's already uncovered. */
export function follow(game: Game, column: number): Game {
  if (tracing(game) !== null || !covered(game).includes(column)) return game;
  return { ...game, run: [column] };
}

/** Starts tracing every covered line, one after another. */
export function followAll(game: Game): Game {
  const run = covered(game);
  if (tracing(game) !== null || run.length === 0) return game;
  return { ...game, run };
}

/** The trace running on `column` reached the bottom: uncover it, which moves the run on. */
export function land(game: Game, column: number): Game {
  if (tracing(game) !== column) return game;
  return { ...game, revealed: [...game.revealed, column] };
}

/** Uncovers lines at once, without tracing (reduced motion). */
export function uncover(game: Game, columns: readonly number[]): Game {
  const fresh = columns.filter((column) => covered(game).includes(column));
  if (tracing(game) !== null || fresh.length === 0) return game;
  return { ...game, revealed: [...game.revealed, ...fresh], run: fresh };
}
