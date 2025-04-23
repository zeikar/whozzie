import { Metadata } from "next";
import { generateCommonMetadata } from "@/app/[locale]/utils/metadata";
import ClientPage from "./HomePageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateCommonMetadata(locale);
}

export default function HomePage() {
  return <ClientPage />;
}
