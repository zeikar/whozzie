// Configuration for sitemap generation
export const sitemapConfig = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://whozzie.vercel.app",
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  generateIndexSitemap: true,
  // Add supported locales from i18n configuration
  locales: ["en", "ko"],
  defaultLocale: "en",
  // Define routes that should be included in the sitemap
  routes: [
    { route: "/", priority: 1.0 },
    { route: "/wheel", priority: 0.8 },
    // Add other routes as you create new features
  ],
};
