import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("home");
  
  return (
    <footer className="w-full max-w-4xl mx-auto mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
      <p>
        © {new Date().getFullYear()} Whozzie - {t("title")}
      </p>
    </footer>
  );
}
