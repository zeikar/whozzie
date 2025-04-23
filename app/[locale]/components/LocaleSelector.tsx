"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LocaleSelector() {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => switchLocale("en")}
        className={`px-3 py-1 rounded-md text-sm ${
          locale === "en"
            ? "bg-purple-500 text-white"
            : "bg-white dark:bg-gray-700"
        } shadow hover:shadow-md transition-shadow`}
      >
        English
      </button>
      <button
        onClick={() => switchLocale("ko")}
        className={`px-3 py-1 rounded-md text-sm ${
          locale === "ko"
            ? "bg-purple-500 text-white"
            : "bg-white dark:bg-gray-700"
        } shadow hover:shadow-md transition-shadow`}
      >
        한국어
      </button>
    </div>
  );
}
