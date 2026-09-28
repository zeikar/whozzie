import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import { routing } from "./routing";

/**
 * The `[locale]` route param as a supported Locale. The layout's static params
 * already turn anything else away (see dynamicParams there); this narrows the type.
 */
export async function localeFrom(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return locale;
}
