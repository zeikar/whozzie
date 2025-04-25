import { MetadataRoute } from "next";
import { sitemapConfig } from "../sitemap.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();
  const { siteUrl, locales, defaultLocale, routes } = sitemapConfig;

  // Initialize the sitemap entries array
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // For each defined route
  routes.forEach(({ route, priority }) => {
    // Add entry for default locale (root) - only for home page
    if (route === "/" && defaultLocale === "en") {
      sitemapEntries.push({
        url: `${siteUrl}`,
        lastModified: currentDate,
        changeFrequency: "daily",
        priority: priority,
      });
    }

    // Add entries for each locale
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${siteUrl}/${locale}${route === "/" ? "" : route}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: route === "/" ? priority : priority * 0.9,
      });
    });
  });

  return sitemapEntries;
}
