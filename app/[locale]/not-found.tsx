import { useTranslations } from "next-intl";
import { buttonClass } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { SITE_NAME } from "@/lib/site";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="max-w-xl">
      {/* not-found can't export metadata; React hoists this into <head>. */}
      <title>{`${t("title")} | ${SITE_NAME}`}</title>
      <h1 className="font-hand text-5xl leading-none font-bold sm:text-6xl">{t("title")}</h1>
      <p className="mt-4 text-lg text-ink-soft">{t("body")}</p>
      <Link href="/" className={`${buttonClass("primary")} mt-8`}>
        {t("back")}
      </Link>
    </div>
  );
}
