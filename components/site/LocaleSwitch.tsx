"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cx } from "@/lib/cx";

const LABELS = {
  en: { short: "EN", full: "English" },
  ko: { short: "한", full: "한국어" },
} satisfies Record<(typeof routing.locales)[number], { short: string; full: string }>;

export function LocaleSwitch() {
  const t = useTranslations("site");
  const current = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("language")} className="flex items-center">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          lang={locale}
          hrefLang={locale}
          aria-label={LABELS[locale].full}
          aria-current={locale === current ? "true" : undefined}
          className={cx(
            "grid h-10 min-w-10 place-items-center px-1.5 font-hand text-xl font-bold",
            locale === current ? "highlighter current-mark text-ink" : "text-ink-soft hover:text-ink",
          )}
        >
          {LABELS[locale].short}
        </Link>
      ))}
    </nav>
  );
}
