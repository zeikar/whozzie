import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { PickerId } from "@/lib/site";

/**
 * Page frame every picker shares: heading and lede from the picker's messages,
 * the names card and any settings on the left, the picker's stage on the right.
 * On narrow screens it's one column, and settings come after the stage so the
 * game isn't pushed below the fold.
 */
export function PickerLayout({
  picker,
  aside,
  settings,
  children,
}: {
  picker: PickerId;
  /** Usually <NamesCard>. */
  aside: ReactNode;
  /** Picker-specific options, e.g. a <Card> of modes or presets. */
  settings?: ReactNode;
  /** The stage: the wheel, dice table or ladder, and its main action. */
  children: ReactNode;
}) {
  const t = useTranslations(picker);
  return (
    <div
      className={
        "grid grid-cols-[minmax(0,1fr)] gap-x-14 gap-y-8 " +
        "lg:grid-cols-[minmax(19rem,23rem)_minmax(0,1fr)] lg:grid-rows-[auto_auto_1fr]"
      }
    >
      <header className="max-w-2xl lg:col-span-2">
        <h1 className="font-hand text-5xl leading-[0.95] font-bold sm:text-6xl">{t("heading")}</h1>
        <p className="mt-3 max-w-prose text-lg text-ink-soft">{t("lede")}</p>
      </header>
      <div className="lg:col-start-1 lg:row-start-2">{aside}</div>
      <section aria-label={t("name")} className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-2">
        {children}
      </section>
      {settings && <div className="lg:col-start-1 lg:row-start-3">{settings}</div>}
    </div>
  );
}
