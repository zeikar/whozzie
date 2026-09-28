import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { markerVar } from "@/lib/markers";

/**
 * A person's name on a sticker in their marker color. `index`/`count` are the
 * name's position in the names list, so the color matches every other picker.
 */
export function NameChip({
  name,
  index,
  count,
  children,
  className,
}: {
  name: string;
  index: number;
  count: number;
  /** Trailing controls, e.g. a remove button. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "sketch-sm flex h-10 max-w-full items-center gap-1 border-[1.5px] border-ink/80 px-3 text-on-marker",
        children ? "pr-1" : null,
        className,
      )}
      style={{ backgroundColor: markerVar(index, count) }}
    >
      <span className="truncate font-hand text-xl leading-none font-bold">{name}</span>
      {children}
    </span>
  );
}
