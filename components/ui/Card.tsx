import { useId, type ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * An index card on the page: a handwritten title over a red rule. Holds the
 * names list and each picker's settings.
 */
export function Card({
  title,
  extra,
  children,
  className,
}: {
  title: ReactNode;
  /** Sits on the title line after the title, e.g. a count or a small action. */
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={cx("sketch border-2 border-ink bg-card px-5 pt-4 pb-5", className)}>
      <header className="flex items-baseline gap-3 border-b-2 border-rule pb-2">
        <h2 id={titleId} className="font-hand text-3xl font-bold">
          {title}
        </h2>
        {extra}
      </header>
      {children}
    </section>
  );
}
