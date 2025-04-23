import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ClientPage from "./ClientPage";


export default function HomePage() {
  const t = useTranslations("home");
  return <ClientPage />;
}
