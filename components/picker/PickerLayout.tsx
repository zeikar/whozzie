import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { PickerId } from "@/lib/site";

/**
 * Page frame every picker shares: heading and lede from the picker's messages,
 * the names card on the left, the picker's stage on the right.
 */
export function PickerLayout({
  picker,
  aside,
  children,
}: {
  picker: PickerId;
  /** Usually <NamesCard>, plus any picker-specific settings under it. */
  aside: ReactNode;
  /** The stage: the wheel, dice table or ladder, and its main action. */
  children: ReactNode;
}) {
  const t = useTranslations(picker);
  return (
    <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(19rem,23rem)_minmax(0,1fr)]">
      <header className="max-w-2xl lg:col-span-2">
        <h1 className="font-hand text-5xl leading-[0.95] font-bold sm:text-6xl">{t("heading")}</h1>
        <p className="mt-3 max-w-prose text-lg text-ink-soft">{t("lede")}</p>
      </header>
      <aside className="flex flex-col gap-6">{aside}</aside>
      <section aria-label={t("name")} className="min-w-0">
        {children}
      </section>
    </div>
  );
}
