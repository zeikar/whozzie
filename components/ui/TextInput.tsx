import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

/** A single-line field written on the page: inked outline, paper fill. */
export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      autoComplete="off"
      className={cx(
        "sketch-sm h-11 min-w-0 border-2 border-ink/70 bg-paper px-3 text-base placeholder:text-ink-faint " +
          "focus:border-ink focus-visible:outline-offset-2 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
