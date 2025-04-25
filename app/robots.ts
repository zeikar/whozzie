import { MetadataRoute } from "next";
import { sitemapConfig } from "../sitemap.config";

export default function robots(): MetadataRoute.Robots {
  const { siteUrl } = sitemapConfig;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
