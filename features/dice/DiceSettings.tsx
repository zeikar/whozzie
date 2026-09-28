import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { MAX_DICE, type DiceMode } from "./settings";

const DICE_COUNTS = Array.from({ length: MAX_DICE }, (_, i) => String(i + 1));

/** How to roll, and for plain dice, how many. */
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
  return (
    <Card title={t("howTo")}>
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
          // Bare numbers in sans: the handwriting's "1" reads as an I. The control
          // only takes text labels, so this styles its option spans from outside.
          className="mt-4 [&_label>span]:font-sans [&_label>span]:tabular-nums"
        />
      )}
    </Card>
  );
}
