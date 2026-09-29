import type { Metadata, Viewport } from "next";
import { Gaegu, Gowun_Dodum } from "next/font/google";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SketchDefs } from "@/components/site/SketchDefs";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

// Handwriting for anything written on the page (headings, names, buttons);
// a rounded sans for reading and typing. Gaegu takes one call per weight: asked
// for both at once, next/font preloads all ~90 Korean slices of the bold face.
// Both calls declare the same family, so --font-gaegu covers either weight.
const hand = Gaegu({ weight: "400", subsets: ["latin"], variable: "--font-gaegu" });
const handBold = Gaegu({ weight: "700", subsets: ["latin"], variable: "--font-gaegu" });
const sans = Gowun_Dodum({ weight: "400", subsets: ["latin"], variable: "--font-gowun" });

// The one place metadataBase is set: every page's URLs resolve against it.
export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

// The paper (--paper), so the mobile address bar reads as part of the notebook
// or the chalkboard rather than a band the page never draws. It follows the OS
// scheme: a theme picked with the site's own switch doesn't reach it.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#213831" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Anything else (e.g. /missing.png, which the proxy skips) matches no route, so
// app/global-not-found.tsx serves it, rendered on the server and not cached as a page.
export const dynamicParams = false;

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // Each picker's `about` notes render on the server only (PickerNotes), so keep
  // them out of the messages the provider ships to the browser on every page.
  const messages = Object.fromEntries(
    Object.entries(await getMessages()).map(([namespace, keys]) => [
      namespace,
      Object.fromEntries(Object.entries(keys).filter(([key]) => key !== "about")),
    ]),
  );

  return (
    <html lang={locale} className={`${hand.variable} ${handBold.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <SketchDefs />
        <NextIntlClientProvider messages={messages}>
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
