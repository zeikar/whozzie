import "./globals.css";
import { getLocale } from "next-intl/server";
import LocaleLayout from "./[locale]/layout";
import LocaleNotFound from "./[locale]/not-found";

// Every URL that matches no route lands here. That's the only kind of 404 Next
// renders on the server (a notFound() thrown by a page comes back as an empty shell
// that JavaScript fills in), so unknown paths aren't routed into [locale] at all:
// this page puts the in-locale 404 in the site's layout itself, in the locale the
// proxy picked for the URL (English when the proxy skipped it, e.g. a missing file).
export default async function GlobalNotFound() {
  const locale = await getLocale();
  return (
    <LocaleLayout params={Promise.resolve({ locale })}>
      <LocaleNotFound />
    </LocaleLayout>
  );
}
