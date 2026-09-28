"use client";

import { useTranslations } from "next-intl";
import { PICKER_DOODLES } from "@/components/icons";
import { Link, usePathname } from "@/i18n/navigation";
import { cx } from "@/lib/cx";
import { PICKER_IDS, pickerHref } from "@/lib/site";

export function PickerNav({ className }: { className?: string }) {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <nav aria-label={t("site.pickers")} className={className}>
      <ul className="flex gap-2 sm:gap-3">
        {PICKER_IDS.map((id) => {
          const href = pickerHref(id);
          const active = pathname === href;
          const Doodle = PICKER_DOODLES[id];
          return (
            <li key={id}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="group flex h-11 items-center gap-1.5 px-1.5 whitespace-nowrap"
              >
                <Doodle className="chalk size-6 shrink-0 sm:size-7 transition-transform group-hover:-rotate-8" />
                <span
                  className={cx(
                    "font-hand text-xl font-bold sm:text-2xl",
                    active ? "highlighter text-ink" : "text-ink-soft group-hover:text-ink",
                  )}
                >
                  {t(`${id}.name`)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
