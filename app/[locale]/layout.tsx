import type { Metadata } from "next";
import { Gaegu, Gowun_Dodum } from "next/font/google";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SketchDefs } from "@/components/site/SketchDefs";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

// Handwriting for anything written on the page (headings, names, buttons);
// a rounded sans for reading and typing.
const hand = Gaegu({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-gaegu" });
const sans = Gowun_Dodum({ weight: "400", subsets: ["latin"], variable: "--font-gowun" });

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${hand.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <SketchDefs />
        <NextIntlClientProvider>
          <ThemeProvider>
            <div className="relative isolate">
              {/* The notebook's red margin rule. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-[max(0.5rem,calc((100%-72rem)/2-1.5rem))] -z-10 hidden w-1.5 border-x-[1.5px] border-rule sm:block"
              />
              <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-8">
                <SiteHeader />
                <main className="pt-6 sm:pt-10">{children}</main>
                <SiteFooter />
              </div>
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
