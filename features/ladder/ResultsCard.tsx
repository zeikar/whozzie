"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TextInput } from "@/components/ui/TextInput";
import { MAX_PLAYERS, isPlayable } from "./ladder";
import { MAX_RESULT_LENGTH, PRESETS, type Preset } from "./results";

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
  /** Freeze editing once a line is traced: from then on a changed result could steer the round. */
  locked: boolean;
}) {
  const t = useTranslations("ladder.results");
  const playable = isPlayable(count);

  return (
    <Card title={t("title")}>
      {playable ? (
        <>
          <SegmentedControl
            label={t("fillWith")}
            value={preset}
            options={PRESETS.map((value) => ({ value, label: t(value) }))}
            onChange={onPreset}
            disabled={locked}
            className="mt-4"
          />
          <ol className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
            {values.map((value, index) => (
              <li key={index} className="flex min-w-0 items-center gap-1.5">
                <span aria-hidden className="w-5 shrink-0 text-right text-sm text-ink-faint tabular-nums">
                  {index + 1}
                </span>
                <TextInput
                  value={value}
                  onChange={(event) => onEdit(index, event.target.value)}
                  disabled={locked}
                  maxLength={MAX_RESULT_LENGTH}
                  placeholder={t("slot", { number: index + 1 })}
                  aria-label={t("slot", { number: index + 1 })}
                  className="h-10 w-full px-2.5"
                />
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-ink-soft">{locked ? t("locked") : t("hint")}</p>
        </>
      ) : (
        <p className="mt-3 text-ink-soft">
          {count > MAX_PLAYERS ? t("tooMany", { max: MAX_PLAYERS }) : t("waiting")}
        </p>
      )}
    </Card>
  );
}
