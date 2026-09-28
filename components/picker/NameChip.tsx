import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { markerVar } from "@/lib/markers";

const SIZES = {
  md: { box: "h-10 px-3", wrapped: "min-h-10 px-3 py-1.5", text: "text-xl" },
  sm: { box: "h-7 px-2", wrapped: "min-h-7 px-2 py-1", text: "text-base" },
};

/**
 * A person's name on a sticker in their marker color. `index`/`count` are the
 * name's position in the names list, so the color matches every other picker.
 */
export function NameChip({
  name,
  index,
  count,
  size = "md",
  wrap = false,
  children,
  className,
}: {
  name: string;
  index: number;
  count: number;
  size?: keyof typeof SIZES;
  /** Wrap a long name instead of cutting it, where this is the only place to read it in full. */
  wrap?: boolean;
  /** Trailing content, e.g. a remove button or a rolled value. */
  children?: ReactNode;
  className?: string;
}) {
  const sizing = SIZES[size];
  return (
    <span
      className={cx(
        "sketch-sm flex max-w-full items-center gap-1 border-[1.5px] border-ink/80 text-on-marker",
        wrap ? sizing.wrapped : sizing.box,
        className,
      )}
      style={{ backgroundColor: markerVar(index, count) }}
    >
      <span
        className={cx(
          "min-w-0 font-hand font-bold",
          sizing.text,
          wrap ? "leading-tight wrap-break-word" : "truncate leading-none",
        )}
      >
        {name}
      </span>
      {children}
    </span>
  );
}
