import { useState } from "react";
import { useTranslations } from "next-intl";
import { INITIAL_RESULTS, choose, edit, type Preset } from "./results";

/** The results for `count` players: what each slot says, and how the ladder labels it. */
export function useResults(count: number) {
  const t = useTranslations("ladder.results");
  const [results, setResults] = useState(INITIAL_RESULTS);
  const { preset, custom } = results;

  const values = Array.from({ length: count }, (_, i) => {
    if (preset === "custom") return custom[i] ?? "";
    if (preset === "order") return t("place", { place: i + 1 });
    return i === 0 ? t("winnerResult") : t("blankResult");
  });
  /** What the ladder shows for each result; a blank one reads as its slot. */
  const labels = values.map((value, i) => value.trim() || t("slot", { number: i + 1 }));

  return {
    preset,
    values,
    labels,
    choose: (next: Preset) => setResults(choose(results, next, values)),
    edit: (index: number, text: string) => setResults(edit(results, values, index, text)),
  };
}
