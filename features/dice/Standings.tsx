import { useTranslations } from "next-intl";
import { NameChip } from "@/components/picker/NameChip";
import { standings, type Round } from "./contest";

/**
 * Everyone's place and rolls, best first. A tie-break roll is written big after
 * the roll that tied, which stays small: it still ranks them above everyone below.
 */
export function Standings({ rounds, names }: { rounds: readonly Round[]; names: readonly string[] }) {
  const t = useTranslations("dice");
  return (
    <ol className="divide-y-2 divide-dashed divide-ink/15">
      {standings(rounds).map(({ place, names: group, rolls }) => (
        <li key={group[0]} className="flex items-center gap-3 py-2">
          {/* Sans, because the handwriting's "1" reads as an I: "Ist". */}
          <span className="w-11 shrink-0 font-sans text-lg text-ink-soft tabular-nums">{t("place", { place })}</span>
          <span className="flex min-w-0 flex-1 flex-wrap gap-2">
            {group.map((name) => (
              <NameChip key={name} name={name} index={names.indexOf(name)} count={names.length} />
            ))}
          </span>
          <span className="sr-only">{t("rolled", { rolls: rolls.join(", ") })}</span>
          <span aria-hidden className="shrink-0 font-hand text-4xl leading-none font-bold">
            {rolls.slice(0, -1).map((roll, i) => (
              <span key={i} className="text-2xl text-ink-faint">
                {roll}
                {" → "}
              </span>
            ))}
            {rolls.at(-1)}
          </span>
        </li>
      ))}
    </ol>
  );
}
