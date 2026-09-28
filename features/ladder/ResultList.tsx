import { NameChip } from "@/components/picker/NameChip";
import { cx } from "@/lib/cx";
import type { Lane } from "./ladder";

/** Everyone's outcome, player chip → result, in the order the results were written. */
export function ResultList({
  names,
  lanes,
  labels,
  className,
}: {
  names: readonly string[];
  lanes: readonly Lane[];
  /** Result text by result index. */
  labels: readonly string[];
  className?: string;
}) {
  const rows = [...lanes].sort((a, b) => a.result - b.result);
  return (
    <ol className={cx("grid gap-x-8 gap-y-3", className)}>
      {rows.map((lane) => (
        // This is the one place to read every result in full, so nothing is cut: a long
        // name takes the whole row and its result moves under it, and a long result wraps.
        <li key={lane.player} className="flex flex-wrap items-start gap-x-2 gap-y-1">
          <NameChip name={names[lane.player]} index={lane.player} count={names.length} />
          <span className="flex min-w-0 grow basis-36 items-start gap-2">
            <svg viewBox="0 0 30 16" className="mt-3 h-4 w-8 shrink-0 text-ink-soft" aria-hidden>
              <path
                d="M2.2 8.6c7.4-.5 15-.4 23.6-.3M20.1 3.4c2.1 1.8 4.2 3.4 6.2 4.9-2 1.7-4 3.4-6 5.3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="min-w-0 py-1 font-hand text-2xl leading-8 font-bold wrap-break-word">
              {labels[lane.result]}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
