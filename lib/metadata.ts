import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL, type PickerId } from "@/lib/site";

/** Open Graph wants language_TERRITORY. */
const OG_LOCALE = { en: "en_US", ko: "ko_KR" } satisfies Record<Locale, string>;

/** Absolute URL of `href` in `locale` (the default locale has no prefix). */
export const localizedUrl = (locale: Locale, href: string) =>
  `${SITE_URL}${getPathname({ locale, href })}`;

/** hreflang alternates for `href`: every locale, plus x-default on the unprefixed English URL. */
export const languageAlternates = (href: string) => ({
  ...Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, href)])),
  "x-default": localizedUrl(routing.defaultLocale, href),
});

/** Title, description, canonical and hreflang alternates for a page, from its `meta` messages. */
export async function buildMetadata(
  locale: Locale,
  namespace: "home" | PickerId,
  href: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });
  const title = t("meta.title");
  const description = t("meta.description");
  const url = localizedUrl(locale, href);
  const image = `https://dogimg.vercel.app/api/og?url=${encodeURIComponent(url)}`;

  return {
    title,
    description,
    keywords: t.raw("meta.keywords") as string[],
    alternates: { canonical: url, languages: languageAlternates(href) },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
