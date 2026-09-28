import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { WheelPicker } from "@/features/wheel/WheelPicker";
import { localeFrom } from "@/i18n/locale";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/wheel">): Promise<Metadata> {
  return buildMetadata(await localeFrom(params), "wheel", "/wheel");
}

export default async function WheelPage({ params }: PageProps<"/[locale]/wheel">) {
  setRequestLocale(await localeFrom(params));
  return <WheelPicker />;
}
