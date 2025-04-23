import { Metadata } from "next";
import { getTranslations, getMessages } from "next-intl/server";

/**
 * Generate metadata for SEO based on locale and namespace
 * @param locale The locale for translations
 * @param namespace Optional namespace for translations (if different from root)
 * @returns Metadata object with title, description, and keywords
 */
export async function generateCommonMetadata(
  locale: string,
  namespace?: string
): Promise<Metadata> {
  // Get translations for the current locale
  const rootT = await getTranslations({ locale });

  // If namespace is specified, get translations for that namespace
  const t = namespace ? await getTranslations({ locale, namespace }) : rootT;

  // Get all messages for the current locale
  const messages = await getMessages({ locale });

  // Extract keywords based on path
  let keywords: string[] = [];

  try {
    // Try to get keywords from namespace first if provided
    if (namespace && messages[namespace]?.keywords) {
      // Check if keywords is an array or an object
      if (Array.isArray(messages[namespace].keywords)) {
        keywords = messages[namespace].keywords;
      } else {
        // If it's an object with numbered keys, convert to array
        keywords = Object.values(messages[namespace].keywords);
      }
    }
    // If no keywords found in namespace or no namespace provided, try root level
    else if (messages.keywords) {
      if (Array.isArray(messages.keywords)) {
        keywords = messages.keywords;
      } else {
        // If it's an object with numbered keys, convert to array
        keywords = Object.values(messages.keywords);
      }
    }
  } catch (e) {
    // If there's an error getting keywords, use empty array
    keywords = [];
  }

  // Get canonical URL (without locale)
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://whozzie.vercel.app";
  const path = namespace ? `/${namespace}` : "";
  const canonicalUrl = `${baseUrl}${path}`;
  const fullUrl = `${baseUrl}/${locale}${path}`;

  // Set metadata based on translations with enhanced SEO fields
  return {
    title: t("title"),
    description: t("description"),
    keywords: keywords,
    authors: [{ name: "Whozzie" }],
    creator: "Whozzie Team",
    publisher: "Whozzie",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en${path}`,
        ko: `${baseUrl}/ko${path}`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: canonicalUrl,
      siteName: "Whozzie",
      locale: locale,
      type: "website",
      images: [
        {
          url: `https://dogimg.vercel.app/api/og?url=${fullUrl}`,
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [`https://dogimg.vercel.app/api/og?url=${fullUrl}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
