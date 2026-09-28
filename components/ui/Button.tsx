import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-hand font-bold leading-none whitespace-nowrap " +
  "transition-[transform,background-color,color] duration-150 pressable:active:translate-y-px " +
  "disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary: "sketch border-2 border-ink bg-ink text-paper pressable:hover:-rotate-1",
  secondary: "sketch border-2 border-ink bg-card text-ink pressable:hover:-rotate-1",
  ghost: "sketch-sm text-ink-soft pressable:hover:bg-ink/6 pressable:hover:text-ink",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-xl",
  lg: "h-14 px-8 text-[1.75rem]",
};

export type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function buttonClass(variant: Variant = "secondary", size: Size = "md") {
  return cx(base, variants[variant], sizes[size]);
}

/**
 * For a button that is only unavailable while something plays out (a spin, a
 * roll), pass `aria-disabled` instead of `disabled`: it looks and acts disabled
 * but keeps keyboard focus, which `disabled` would drop to the page.
 */
export function Button({ variant, size, className, type = "button", onClick, ...props }: ButtonProps) {
  const unavailable = props["aria-disabled"] === true || props["aria-disabled"] === "true";
  return (
    <button
      type={type}
      onClick={unavailable ? undefined : onClick}
      className={cx(buttonClass(variant, size), className)}
      {...props}
    />
  );
}
