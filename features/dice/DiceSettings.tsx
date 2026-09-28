import { useId } from "react";
import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

export type DiceMode = "everyone" | "justRoll";

const DICE_COUNTS = ["1", "2", "3", "4", "5", "6"] as const;

/** The card under the names: how to roll, and for plain dice, how many. */
export function DiceSettings({
  mode,
  onModeChange,
  diceCount,
  onDiceCountChange,
  disabled,
}: {
  mode: DiceMode;
  onModeChange: (mode: DiceMode) => void;
  diceCount: number;
  onDiceCountChange: (count: number) => void;
  disabled: boolean;
}) {
  const t = useTranslations("dice");
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="sketch border-2 border-ink bg-card px-5 pt-4 pb-5">
      <h2 id={titleId} className="border-b-2 border-rule pb-2 font-hand text-3xl font-bold">
        {t("howTo")}
      </h2>
      <SegmentedControl
        label={t("mode")}
        value={mode}
        options={[
          { value: "everyone", label: t("everyone") },
          { value: "justRoll", label: t("justRoll") },
        ]}
        onChange={onModeChange}
        disabled={disabled}
        className="mt-4"
      />
      <p className="mt-2 text-sm text-ink-soft">{mode === "everyone" ? t("everyoneHint") : t("justRollHint")}</p>
      {mode === "justRoll" && (
        <SegmentedControl
          label={t("diceCount")}
          value={String(diceCount)}
          options={DICE_COUNTS.map((count) => ({ value: count, label: count }))}
          onChange={(count) => onDiceCountChange(Number(count))}
          disabled={disabled}
          className="mt-4"
        />
      )}
    </section>
  );
}
