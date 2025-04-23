import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="w-full max-w-4xl mx-auto mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
      <p>
        © {new Date().getFullYear()} {t("title")}
      </p>
    </footer>
  );
}
