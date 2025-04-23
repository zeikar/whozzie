import { Metadata } from "next";
import WheelPageClient from "./components/WheelPageClient";
import Header from "../components/Header";
import { generateCommonMetadata } from "../utils/metadata";

// This generates metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateCommonMetadata(locale, "wheel");
}

export default function WheelPage() {
  return (
    <>
      <Header namespace={"wheel"} />
      <WheelPageClient />
    </>
  );
}
