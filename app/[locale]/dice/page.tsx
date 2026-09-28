import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { DicePicker } from "@/features/dice/DicePicker";
import { localeFrom } from "@/i18n/locale";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/dice">): Promise<Metadata> {
  return buildMetadata(await localeFrom(params), "dice", "/dice");
}

export default async function DicePage({ params }: PageProps<"/[locale]/dice">) {
  setRequestLocale(await localeFrom(params));
  return <DicePicker />;
}
