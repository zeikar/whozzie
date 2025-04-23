import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Header() {
  const t = useTranslations("home");

  return (
    <header className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">
          {t("title")}
        </h1>
        <div className="flex space-x-2">
          <Link
            href="/en"
            className="px-3 py-1 rounded-md text-sm bg-white dark:bg-gray-700 shadow hover:shadow-md transition-shadow"
            prefetch={false}
          >
            English
          </Link>
          <Link
            href="/ko"
            className="px-3 py-1 rounded-md text-sm bg-white dark:bg-gray-700 shadow hover:shadow-md transition-shadow"
            prefetch={false}
          >
            한국어
          </Link>
        </div>
      </div>
    </header>
  );
}
