import { useTranslations } from "next-intl";
import { usePersistedState } from "@/lib/use-persisted-state";
import { INITIAL_RESULTS, choose, edit, parseResults, type Preset } from "./results";

/**
 * The results for `count` players: what each slot says, and how the ladder labels
 * it. Remembered across visits, like the names, so a weekly rota isn't retyped.
 */
export function useResults(count: number) {
  const t = useTranslations("ladder.results");
  const [results, setResults] = usePersistedState("whozzie:ladder:results", INITIAL_RESULTS, parseResults);
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
