"use client";

import { useId } from "react";
import { cx } from "@/lib/cx";

type SegmentOption<T extends string> = { value: T; label: string };

/**
 * A row of mutually exclusive options (native radios underneath, so arrow keys
 * and screen readers work as a radio group).
 */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  className,
}: {
  /** Accessible name of the group; shown as a small caption. */
  label: string;
  value: T;
  options: readonly SegmentOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}) {
  const name = useId();
  return (
    <fieldset disabled={disabled} className={cx("min-w-0 disabled:opacity-50", className)}>
      <legend className="mb-1.5 text-sm text-ink-soft">{label}</legend>
      <div className="sketch-sm inline-flex max-w-full flex-wrap gap-1 border-2 border-ink bg-card p-1">
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="peer absolute inset-0 appearance-none rounded-md focus-visible:outline-offset-1"
            />
            <span
              className={cx(
                "pointer-events-none relative flex h-9 items-center rounded-md px-3 font-hand text-lg leading-none font-bold whitespace-nowrap",
                option.value === value ? "bg-ink text-paper" : "text-ink-soft peer-hover:text-ink",
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
