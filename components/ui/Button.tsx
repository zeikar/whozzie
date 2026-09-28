import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-hand font-bold leading-none whitespace-nowrap " +
  "transition-[transform,background-color,color] duration-150 active:translate-y-px " +
  "disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0";

const variants: Record<Variant, string> = {
  primary: "sketch border-2 border-ink bg-ink text-paper enabled:hover:-rotate-1",
  secondary: "sketch border-2 border-ink bg-card text-ink enabled:hover:-rotate-1",
  ghost: "sketch-sm text-ink-soft enabled:hover:text-ink enabled:hover:bg-ink/6",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-xl",
  lg: "h-14 px-8 text-[1.75rem]",
};

export type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function buttonClass(variant: Variant = "secondary", size: Size = "md") {
  return cx(base, variants[variant], sizes[size]);
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cx(buttonClass(variant, size), className)} {...props} />;
}
