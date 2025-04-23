import { useTranslations } from "next-intl";
import { Metadata } from "next";
import WheelPageClient from "./components/WheelPageClient";
import Header from "../components/Header";

// This generates metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Whozzie - Random Wheel Picker",
    description:
      "Pick a random person or item with our random wheel spinner. Perfect for making decisions, drawing names, or selecting winners.",
    keywords: [
      "random wheel",
      "wheel spinner",
      "random name picker",
      "decision maker",
      "random selector",
    ],
  };
}

export default function WheelPage() {
  return (
    <>
      <Header namespace={"wheel"} />
      <WheelPageClient />
    </>
  );
}
