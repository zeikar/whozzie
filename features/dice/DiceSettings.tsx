import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

export type DiceMode = "everyone" | "justRoll";

const DICE_COUNTS = ["1", "2", "3", "4", "5", "6"] as const;

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
          className="mt-4"
        />
      )}
    </Card>
  );
}
