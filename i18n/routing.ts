import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ko"],
  defaultLocale: "en",
  // English lives at the bare URLs; Korean under /ko.
  localePrefix: "as-needed",
});
