import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SITE_NAME } from "@/lib/site";
import { LocaleSwitch } from "./LocaleSwitch";
import { PickerNav } from "./PickerNav";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const t = useTranslations("site");
  return (
    <header className="flex flex-wrap items-center gap-x-8 gap-y-1 pt-5 pb-3">
      <Link href="/" aria-label={t("home")} className="font-hand text-4xl leading-none font-bold">
        {SITE_NAME}
      </Link>
      <PickerNav className="order-last -mx-1.5 w-full overflow-x-auto sm:order-none sm:w-auto sm:overflow-visible" />
      <div className="ml-auto flex items-center gap-1">
        <LocaleSwitch />
        <ThemeToggle />
      </div>
    </header>
  );
}
