import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localizedUrl } from "@/lib/metadata";
import { PICKER_IDS, pickerHref } from "@/lib/site";

const pages = [
  { href: "/", priority: 1 },
  ...PICKER_IDS.map((id) => ({ href: pickerHref(id), priority: 0.8 })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return pages.flatMap(({ href, priority }) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, href),
      lastModified,
      changeFrequency: "weekly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, href)])),
      },
    })),
  );
}
