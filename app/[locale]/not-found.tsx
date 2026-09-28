import { useTranslations } from "next-intl";
import { buttonClass } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="max-w-xl">
      <h1 className="font-hand text-5xl leading-none font-bold sm:text-6xl">{t("title")}</h1>
      <p className="mt-4 text-lg text-ink-soft">{t("body")}</p>
      <Link href="/" className={`${buttonClass("primary")} mt-8`}>
        {t("back")}
      </Link>
    </div>
  );
}
