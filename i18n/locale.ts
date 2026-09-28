import { hasLocale, type Locale } from "next-intl";
import { routing } from "./routing";

/** The `[locale]` route param as a supported Locale (the layout 404s on anything else). */
export async function localeFrom(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}
