"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { NamesCard } from "@/components/picker/NamesCard";
import { PickerLayout } from "@/components/picker/PickerLayout";
import { ResultDialog, Verdict } from "@/components/picker/ResultDialog";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { cx } from "@/lib/cx";
import { removeName, useNames } from "@/lib/names";
import { pickerHref } from "@/lib/site";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { covered, follow, followAll, isComplete, land, newGame, tracing, uncover, type Game } from "./game";
import { MAX_PLAYERS } from "./ladder";
import { LadderBoard } from "./LadderBoard";
import { ResultList } from "./ResultList";
import { ResultsCard } from "./ResultsCard";
import { useResults } from "./use-results";

type DialogKind = "winner" | "everyone";

// While a line is traced the buttons are aria-disabled rather than disabled, so a
// keyboard user's focus stays on the button they pressed instead of dropping to the page.
const SOFT_DISABLED =
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-45 " +
  "aria-disabled:hover:rotate-0 aria-disabled:active:translate-y-0";

export function LadderPicker() {
  const t = useTranslations("ladder");
  const tResult = useTranslations("result");
  const names = useNames();
  const reducedMotion = useReducedMotion();
  const results = useResults(names.length);
  const summaryId = useId();
  const revealRef = useRef<HTMLButtonElement>(null);
  const newLadderRef = useRef<HTMLButtonElement>(null);

  const [game, setGame] = useState(() => newGame(names));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKind, setDialogKind] = useState<DialogKind>("winner");

  // Seats point into the names list, so a changed list needs a fresh ladder.
  if (game.names !== names) {
    setGame(newGame(names));
    setDialogOpen(false);
  }

  const { round } = game;
  const lanes = round?.lanes ?? [];
  const current = tracing(game);
  const busy = current !== null;
  const complete = isComplete(game);
  const nameAt = (column: number) => names[lanes[column].player];
  const resultAt = (column: number) => results.labels[lanes[column].result];

  // With the One winner preset, result 0 is the winner.
  const isWinner = (next: Game, column: number) =>
    results.preset === "winner" && next.round?.lanes[column].result === 0;
  const winnerColumn = game.revealed.find((column) => isWinner(game, column)) ?? null;
  const winner = winnerColumn === null ? null : nameAt(winnerColumn);

  function openDialog(kind: DialogKind) {
    setDialogKind(kind);
    setDialogOpen(true);
  }

  function settle(next: Game) {
    if (next === game) return;
    setGame(next);
    // Hold the verdict until the whole run has landed, so "Reveal all" isn't cut off halfway.
    if (tracing(next) !== null) return;
    // "Reveal all" has nothing left to do; move focus on before a dialog remembers it.
    if (isComplete(next) && document.activeElement === revealRef.current) newLadderRef.current?.focus();
    if (next.run.some((column) => isWinner(next, column))) openDialog("winner");
    else if (results.preset !== "winner" && isComplete(next)) openDialog("everyone");
  }

  function deal() {
    setGame(newGame(names));
    setDialogOpen(false);
  }

  function pick(column: number) {
    if (reducedMotion) settle(uncover(game, [column]));
    else setGame(follow(game, column));
  }

  function revealAll() {
    if (reducedMotion) settle(uncover(game, covered(game)));
    else setGame(followAll(game));
  }

  // Once a path is known, changing results could steer it, so they get a new ladder.
  // Before that every result is still taped over on a shuffled slot, so a new ladder
  // would only redraw the board on every keystroke.
  function changeResults(apply: () => void) {
    apply();
    if (game.revealed.length > 0) deal();
  }

  // Announces each result as it lands; during "Reveal all" the next trace follows right after.
  const last = game.revealed.at(-1);
  const landed = last === undefined ? null : t("landed", { name: nameAt(last), result: resultAt(last) });
  const following = current === null ? null : t("following", { name: nameAt(current) });
  const status = [landed, following].filter(Boolean).join(" ") || t("hint");

  return (
    <PickerLayout
      picker="ladder"
      aside={
        <>
          <NamesCard highlight={winner} locked={busy} />
          <ResultsCard
            count={names.length}
            preset={results.preset}
            values={results.values}
            onPreset={(preset) => changeResults(() => results.choose(preset))}
            onEdit={(index, value) => changeResults(() => results.edit(index, value))}
            locked={busy}
          />
        </>
      }
    >
      {round ? (
        <div className="flex flex-col gap-5">
          <p aria-live="polite" className="min-h-7 text-lg text-ink-soft">
            {status}
          </p>
          <LadderBoard
            names={names}
            round={round}
            labels={results.labels}
            revealed={game.revealed}
            tracing={current}
            runLength={game.run.length}
            winner={winnerColumn}
            onPick={pick}
            onLanded={(column) => settle(land(game, column))}
          />
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <Button
              ref={revealRef}
              variant="primary"
              size="lg"
              onClick={revealAll}
              aria-disabled={busy || complete}
              className={cx("min-w-52", SOFT_DISABLED)}
            >
              {t("revealAll")}
            </Button>
            <Button
              ref={newLadderRef}
              size="lg"
              onClick={() => !busy && deal()}
              aria-disabled={busy}
              className={cx("min-w-52", SOFT_DISABLED)}
            >
              {t("newLadder")}
            </Button>
          </div>
          {complete && (
            <section aria-labelledby={summaryId} className="mt-4 border-t-2 border-dashed border-ink/20 pt-5">
              <h2 id={summaryId} className="font-hand text-3xl font-bold">
                {t("everyone")}
              </h2>
              <ResultList
                names={names}
                lanes={round.lanes}
                labels={results.labels}
                className="mt-4 sm:grid-cols-2"
              />
            </section>
          )}
        </div>
      ) : (
        <EmptyLadder>
          {names.length > MAX_PLAYERS
            ? t.rich("tooMany", {
                max: MAX_PLAYERS,
                wheel: (chunks) => (
                  <Link href={pickerHref("wheel")} className="font-bold text-ink underline underline-offset-4">
                    {chunks}
                  </Link>
                ),
              })
            : t("needNames")}
        </EmptyLadder>
      )}

      <ResultDialog
        open={dialogOpen && (dialogKind === "winner" ? winner !== null : complete)}
        onClose={() => setDialogOpen(false)}
        heading={dialogKind === "winner" ? t("picked") : t("everyone")}
        actions={
          <>
            <Button variant="primary" onClick={deal} className="flex-1">
              {t("playAgain")}
            </Button>
            {dialogKind === "winner" && winner && (
              <Button
                onClick={() => {
                  removeName(winner);
                  setDialogOpen(false);
                }}
                className="flex-1"
              >
                {tResult("removeName", { name: winner })}
              </Button>
            )}
          </>
        }
      >
        {dialogKind === "winner"
          ? winner && <Verdict name={winner} />
          : round &&
            complete && (
              <ResultList
                names={names}
                lanes={round.lanes}
                labels={results.labels}
                className="mt-5 max-h-[55dvh] overflow-y-auto p-1"
              />
            )}
      </ResultDialog>
    </PickerLayout>
  );
}

/** Stand-in for the ladder until it can be played: a faint pencil sketch and what to do. */
function EmptyLadder({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <svg viewBox="0 0 240 200" className="w-full max-w-60 text-ink-faint" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeDasharray="9 11">
          <path d="M30 10v180M90 10v180M150 10v180M210 10v180" />
          <path d="M30 48h60M150 62h60M90 96h60M30 128h60M150 150h60" />
        </g>
      </svg>
      <p className="max-w-sm text-lg text-ink-soft">{children}</p>
    </div>
  );
}
