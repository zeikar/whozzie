"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cx } from "@/lib/cx";
import { MAX_PLAYERS, isPlayable } from "./ladder";
import { PRESETS, type Preset } from "./results";

const MAX_RESULT_LENGTH = 24;

/** The results to hide along the bottom of the ladder: one input per name, plus presets. */
export function ResultsCard({
  count,
  preset,
  values,
  onPreset,
  onEdit,
  locked,
}: {
  count: number;
  preset: Preset;
  values: readonly string[];
  onPreset: (preset: Preset) => void;
  onEdit: (index: number, value: string) => void;
  /** Freeze editing while a line is being traced. */
  locked: boolean;
}) {
  const t = useTranslations("ladder.results");
  const titleId = useId();
  const listId = useId();
  // Below lg the card sits above the ladder, so the inputs fold away until asked
  // for; a preset needs no typing.
  const [editing, setEditing] = useState(false);
  const playable = isPlayable(count);

  return (
    <section aria-labelledby={titleId} className="sketch border-2 border-ink bg-card px-5 pt-4 pb-5">
      <h2 id={titleId} className="border-b-2 border-rule pb-2 font-hand text-3xl font-bold">
        {t("title")}
      </h2>

      {playable ? (
        <>
          <SegmentedControl
            label={t("fillWith")}
            value={preset}
            options={PRESETS.map((value) => ({ value, label: t(value) }))}
            onChange={(next) => {
              onPreset(next);
              if (next === "custom") setEditing(true);
            }}
            disabled={locked}
            className="mt-4"
          />
          <button
            type="button"
            aria-expanded={editing}
            aria-controls={listId}
            onClick={() => setEditing(!editing)}
            className="sketch-sm -ml-2 mt-3 flex h-10 items-center gap-1.5 px-2 font-hand text-xl font-bold text-ink-soft hover:text-ink lg:hidden"
          >
            {t("edit")}
            <svg viewBox="0 0 16 16" className={cx("size-4 transition-transform", editing && "rotate-180")} aria-hidden>
              <path
                d="M3.2 5.9c1.7 1.5 3.2 3.1 4.9 4.6 1.5-1.6 3.1-3.1 4.7-4.7"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <ol id={listId} className={cx("mt-4 grid grid-cols-2 gap-x-3 gap-y-2", !editing && "max-lg:hidden")}>
            {values.map((value, index) => (
              <li key={index} className="flex min-w-0 items-center gap-1.5">
                <span aria-hidden className="w-5 shrink-0 text-right font-hand text-lg text-ink-faint">
                  {index + 1}
                </span>
                <input
                  value={value}
                  onChange={(event) => onEdit(index, event.target.value)}
                  disabled={locked}
                  maxLength={MAX_RESULT_LENGTH}
                  placeholder={t("slot", { number: index + 1 })}
                  aria-label={t("slot", { number: index + 1 })}
                  autoComplete="off"
                  className={
                    "sketch-sm h-10 w-full min-w-0 border-2 border-ink/70 bg-paper px-2.5 text-base " +
                    "placeholder:text-ink-faint focus:border-ink focus-visible:outline-offset-2 disabled:opacity-50"
                  }
                />
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-ink-faint">{t("hint")}</p>
        </>
      ) : (
        <p className="mt-3 text-ink-soft">
          {count > MAX_PLAYERS ? t("tooMany", { max: MAX_PLAYERS }) : t("waiting")}
        </p>
      )}
    </section>
  );
}
