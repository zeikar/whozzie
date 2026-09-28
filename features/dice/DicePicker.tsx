"use client";

import { useId, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { PICKER_DOODLES } from "@/components/icons";
import { NamesCard } from "@/components/picker/NamesCard";
import { PickerLayout } from "@/components/picker/PickerLayout";
import { ResultDialog, Verdict, VerdictActions } from "@/components/picker/ResultDialog";
import { StickyActions } from "@/components/picker/StickyActions";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { cx } from "@/lib/cx";
import { markerIndex } from "@/lib/markers";
import { useNames } from "@/lib/names";
import { pickerHref } from "@/lib/site";
import { usePersistedState } from "@/lib/use-persisted-state";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useThemeColors } from "@/lib/use-theme-colors";
import { leaders, playOff, type Round } from "./contest";
import { DiceSettings } from "./DiceSettings";
import type { DiceTableApi, DieSpec, DieSpot } from "./DiceTable";
import { rollDie, type DieValue } from "./faces";
import { NameTags, type NameTag } from "./NameTags";
import { DEFAULT_SETTINGS, parseSettings, type DiceMode } from "./settings";
import { Standings } from "./Standings";
import { TableBoundary } from "./TableBoundary";

// three.js and Rapier load only here, and only after the page is up.
const DiceTable = dynamic(() => import("./DiceTable").then((module) => module.DiceTable), { ssr: false });

/** Everyone rolls needs a contest, and one die per name fits the table up to MAX_PLAYERS. */
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 12;
/** Long enough to read the tie before the tied dice go again. */
const TIE_PAUSE_MS = 1600;

/** Rolls with no table to show them on: the same fair draw reduced motion uses. */
const NUMBERS_ONLY: DiceTableApi = { roll: async (ids) => ids.map(() => rollDie()) };

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const DiceDoodle = PICKER_DOODLES.dice;

export function DicePicker() {
  const t = useTranslations("dice");
  const names = useNames();
  const statusId = useId();
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();

  const rollButton = useRef<HTMLButtonElement>(null);

  const [settings, setSettings] = usePersistedState("whozzie:dice:settings", DEFAULT_SETTINGS, parseSettings);
  const { mode, count: diceCount } = settings;
  const [table, setTable] = useState<DiceTableApi | null>(null);
  // This browser couldn't start the 3D table; the dice still roll, just unseen.
  const [tableFailed, setTableFailed] = useState(false);
  const [spots, setSpots] = useState<readonly DieSpot[] | null>(null);
  const [rolling, setRolling] = useState(false);
  // A contest belongs to the names it was rolled for; editing the list clears it.
  const [contest, setContest] = useState<{ names: readonly string[]; rounds: readonly Round[] } | null>(null);
  const [values, setValues] = useState<DieValue[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const api = tableFailed ? NUMBERS_ONLY : table;
  const rounds = contest?.names === names ? contest.rounds : [];
  const lastRound = rounds.at(-1);
  const top = lastRound ? leaders(lastRound) : [];
  const winner = !rolling && top.length === 1 ? top[0] : null;
  // Dice already thrown stay on the table if the list changes in another tab
  // mid-roll; their result is dropped afterwards, as it's for the old list.
  const players = rolling && contest ? contest.names : names;
  const enoughNames = players.length >= MIN_PLAYERS && players.length <= MAX_PLAYERS;

  let dice: DieSpec[] = [];
  if (colors && mode === "justRoll") {
    dice = Array.from({ length: diceCount }, (_, i) => ({ id: String(i), body: colors.card, pips: colors.ink }));
  } else if (colors && players.length <= MAX_PLAYERS) {
    dice = players.map((name, i) => ({
      id: name,
      body: colors.markers[markerIndex(i, players.length)],
      pips: colors.onMarker,
    }));
  }

  // Before this list has been rolled for, the faces showing aren't anyone's result.
  const showValues = rounds.length > 0;
  const tags = useMemo(() => {
    const tags: NameTag[] = [];
    if (mode !== "everyone" || tableFailed || !spots) return tags;
    for (const spot of spots) {
      const index = players.indexOf(spot.id);
      const value = showValues ? spot.value : undefined;
      if (index >= 0) tags.push({ name: spot.id, index, count: players.length, x: spot.x, y: spot.y, value });
    }
    return tags;
  }, [mode, tableFailed, spots, players, showValues]);

  async function roll() {
    if (!api || rolling) return;
    setRolling(true);
    setDialogOpen(false);

    if (mode === "justRoll") {
      setValues(null);
      setValues(await api.roll(dice.map((die) => die.id)));
    } else {
      setContest({ names: players, rounds: [] });
      await playOff(
        players,
        async (who) => {
          const rolled = await api.roll(who);
          return who.map((name, i) => ({ name, value: rolled[i] }));
        },
        async (played) => {
          setContest({ names: players, rounds: [...played] });
          if (!reducedMotion && leaders(played[played.length - 1]).length > 1) await pause(TIE_PAUSE_MS);
        },
      );
      setDialogOpen(true);
    }
    setRolling(false);
  }

  function changeMode(next: DiceMode) {
    setSettings({ ...settings, mode: next });
    setContest(null);
    setValues(null);
  }

  let status = null;
  if (mode === "everyone") {
    if (lastRound && top.length > 1) {
      status = t("tie", { value: Math.max(...lastRound.map((roll) => roll.value)), count: top.length });
    } else if (winner) status = t("highest", { name: winner });
    else if (!rolling && names.length < MIN_PLAYERS) {
      status = t.rich("needTwo", {
        just: (chunks) => (
          <button
            type="button"
            onClick={() => {
              changeMode("justRoll");
              // This button goes away with the switch; Roll is what comes next.
              rollButton.current?.focus();
            }}
            className="text-ink underline underline-offset-4"
          >
            {chunks}
          </button>
        ),
      });
    } else if (!rolling && names.length > MAX_PLAYERS) {
      status = t.rich("tooMany", {
        max: MAX_PLAYERS,
        wheel: (chunks) => (
          <Link href={pickerHref("wheel")} className="text-ink underline underline-offset-4">
            {chunks}
          </Link>
        ),
      });
    }
  }

  // The stage is one labelled image, so its label has to carry the no-3D message too.
  let tableLabel = tableFailed ? t("noTable") : t("tableLabel", { count: dice.length });
  if (!rolling && mode === "everyone" && lastRound) {
    tableLabel = t("tableShowing", { values: lastRound.map((roll) => `${roll.name} ${roll.value}`).join(", ") });
  } else if (!rolling && mode === "justRoll" && values) {
    tableLabel = t("tableShowing", { values: values.join(", ") });
  }

  return (
    <PickerLayout
      picker="dice"
      aside={<NamesCard highlight={winner} locked={rolling} />}
      settings={
        <DiceSettings
          mode={mode}
          onModeChange={changeMode}
          diceCount={diceCount}
          onDiceCountChange={(count) => {
            setSettings({ ...settings, count });
            setValues(null);
          }}
          disabled={rolling}
        />
      }
    >
      <div className="flex flex-col items-center gap-6">
        {/* The table and what it shows, kept together above the action row so a result never lands under it. */}
        <div className="flex w-full flex-col items-center gap-4">
          <div
            role="img"
            aria-label={tableLabel}
            className={cx("relative w-full", tableFailed ? "h-56" : "h-[clamp(300px,80vw,520px)]")}
          >
            {/* A faint doodle holds the table's place while it loads, while it has no dice, or if it can't run. */}
            {(tableFailed || !table || dice.length === 0) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-ink-faint">
                <DiceDoodle className="chalk size-20 opacity-50" />
                {tableFailed ? (
                  <p className="max-w-xs text-ink-soft">{t("noTable")}</p>
                ) : (
                  !table && <p className="text-sm">{t("loading")}</p>
                )}
              </div>
            )}
            {!tableFailed && (
              <TableBoundary onFail={() => setTableFailed(true)}>
                <DiceTable dice={dice} onReady={setTable} onRest={setSpots} />
              </TableBoundary>
            )}
            {tags.length > 0 && <NameTags tags={tags} winner={winner} />}
          </div>
          {mode === "everyone" ? (
            <p id={statusId} aria-live="polite" className="min-h-6 max-w-md text-center text-ink-soft">
              {status}
            </p>
          ) : (
            <p
              aria-live="polite"
              className="flex min-h-16 flex-wrap items-baseline justify-center gap-x-3 font-hand font-bold"
            >
              {values ? (
                <Sum values={values} />
              ) : (
                !rolling && <span className="font-sans text-base font-normal text-ink-soft">{t("justRollIdle")}</span>
              )}
            </p>
          )}
        </div>

        <StickyActions sticky={mode === "justRoll" || enoughNames}>
          <Button
            ref={rollButton}
            variant="primary"
            size="lg"
            onClick={roll}
            // Unavailable only says so: truly disabling it would drop keyboard focus,
            // and the result dialog would have nothing to hand focus back to.
            aria-disabled={rolling || !api || (mode === "everyone" && !enoughNames)}
            aria-describedby={mode === "everyone" && !enoughNames ? statusId : undefined}
            // Fits "Rolling…" (and the longer Korean) too, so the button doesn't grow under the finger.
            className="min-w-56"
          >
            {rolling ? t("rolling") : t("roll")}
          </Button>
        </StickyActions>

        {mode === "everyone" && rounds.length > 0 && (
          <section className="w-full max-w-lg" aria-label={t("standings")}>
            <Standings rounds={rounds} names={names} />
          </section>
        )}
      </div>

      <ResultDialog
        open={dialogOpen && winner !== null}
        onClose={() => setDialogOpen(false)}
        heading={t("winner")}
        actions={
          winner && (
            <VerdictActions
              again={t("rollAgain")}
              onAgain={roll}
              remove={winner}
              onRemoved={() => setDialogOpen(false)}
            />
          )
        }
      >
        {winner && (
          <>
            <Verdict name={winner} />
            {rounds.length > 1 && (
              <p className="mt-1 mb-4 text-center text-sm text-ink-soft">{t("tieBreaks", { count: rounds.length - 1 })}</p>
            )}
            {/* Focusable so the keyboard can scroll it where the browser won't (Safari). */}
            <div
              role="region"
              aria-label={t("standings")}
              tabIndex={0}
              className="max-h-[min(20rem,40vh)] overflow-y-auto border-y-2 border-rule"
            >
              <Standings rounds={rounds} names={names} />
            </div>
          </>
        )}
      </ResultDialog>
    </PickerLayout>
  );
}

/** "4 + 2 + 6 = 12", written big; wraps between terms, never inside one. */
function Sum({ values }: { values: readonly DieValue[] }) {
  const sign = "text-2xl text-ink-faint sm:text-3xl";
  return (
    <>
      {values.map((value, i) => (
        <span key={i} className="flex items-baseline gap-x-3 whitespace-nowrap">
          {i > 0 && <span className={sign}>+</span>}
          <span className="text-5xl sm:text-6xl">{value}</span>
        </span>
      ))}
      {values.length > 1 && (
        <span className="flex items-baseline gap-x-3 whitespace-nowrap">
          <span className={sign}>=</span>
          <span className="highlighter px-1 text-6xl sm:text-7xl">{values.reduce((sum, value) => sum + value, 0)}</span>
        </span>
      )}
    </>
  );
}
