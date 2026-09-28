"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { MoonIcon, SunIcon } from "@/components/icons";

/** Notebook (light) ↔ chalkboard (dark). Icons and labels swap via CSS, so no hydration flash. */
export function ThemeToggle() {
  const t = useTranslations("site");
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="sketch-sm grid size-10 place-items-center text-ink-soft hover:bg-ink/6 hover:text-ink"
    >
      <MoonIcon className="size-6 dark:hidden" />
      <SunIcon className="hidden size-6 dark:block" />
      <span className="sr-only dark:hidden">{t("toChalkboard")}</span>
      <span className="sr-only hidden dark:inline">{t("toNotebook")}</span>
    </button>
  );
}
