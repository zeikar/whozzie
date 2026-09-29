import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { languageAlternates, localizedUrl } from "@/lib/metadata";
import { PICKER_IDS, pickerHref } from "@/lib/site";

const pages = ["/", ...PICKER_IDS.map(pickerHref)];

// No lastmod: stamping every URL with the build time on each deploy teaches
// crawlers to ignore it. changefreq and priority are ignored by Google.
export default function sitemap(): MetadataRoute.Sitemap {
  return pages.flatMap((href) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, href),
      alternates: { languages: languageAlternates(href) },
    })),
  );
}
