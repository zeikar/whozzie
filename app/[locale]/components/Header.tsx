import { useTranslations } from "next-intl";
import LocaleSelector from "./LocaleSelector";

interface HeaderProps {
  namespace: string;
}

export default function Header({ namespace }: HeaderProps) {
  const t = useTranslations(namespace);

  return (
    <header className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">
          {t("title")}
        </h1>
        <LocaleSelector />
      </div>
    </header>
  );
}
