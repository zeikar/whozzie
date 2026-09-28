import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PICKER_DOODLES } from "@/components/icons";
import { NamesCard } from "@/components/picker/NamesCard";
import { Link } from "@/i18n/navigation";
import { localeFrom } from "@/i18n/locale";
import { buildMetadata } from "@/lib/metadata";
import { PICKER_IDS, pickerHref } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  return buildMetadata(await localeFrom(params), "home", "/");
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = await localeFrom(params);
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(19rem,23rem)_minmax(0,1fr)]">
      <header className="lg:col-span-2">
        <h1 className="font-hand text-6xl leading-[0.9] font-bold sm:text-8xl">{t("home.heading")}</h1>
        <p className="mt-4 max-w-prose text-lg text-ink-soft">{t("home.lede")}</p>
      </header>

      <NamesCard className="self-start" />

      <section aria-labelledby="choose">
        <h2 id="choose" className="font-hand text-3xl font-bold text-ink-soft">
          {t("home.choose")}
        </h2>
        <ul className="mt-2 divide-y-2 divide-dashed divide-ink/15">
          {PICKER_IDS.map((id) => {
            const Doodle = PICKER_DOODLES[id];
            return (
              <li key={id}>
                <Link href={pickerHref(id)} className="group flex items-center gap-5 py-5 sm:gap-7">
                  <Doodle className="chalk size-20 shrink-0 transition-transform duration-200 group-hover:-rotate-6 sm:size-24" />
                  <span className="min-w-0">
                    <span className="font-hand text-4xl font-bold group-hover:highlighter sm:text-5xl">
                      {t(`${id}.name`)}
                    </span>
                    <span className="mt-1 block text-ink-soft">{t(`${id}.summary`)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
