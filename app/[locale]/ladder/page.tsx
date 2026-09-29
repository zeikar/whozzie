import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PickerNotes } from "@/components/picker/PickerNotes";
import { LadderPicker } from "@/features/ladder/LadderPicker";
import { localeFrom } from "@/i18n/locale";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/ladder">): Promise<Metadata> {
  return buildMetadata(await localeFrom(params), "ladder", "/ladder");
}

export default async function LadderPage({ params }: PageProps<"/[locale]/ladder">) {
  setRequestLocale(await localeFrom(params));
  return (
    <>
      <LadderPicker />
      <PickerNotes picker="ladder" />
    </>
  );
}
