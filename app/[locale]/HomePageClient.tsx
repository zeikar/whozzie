import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";

export default function ClientPage() {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {t("title") || "Random Selectors"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Wheel Random Selector Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <Link href="./wheel" className="block">
            <div className="relative h-48 w-full">
              <Image
                src="/thumbs/wheel.png"
                alt="Wheel Random Selector"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">
                {t("wheel.title") || "Wheel Random Selector"}
              </h2>
              <p className="text-gray-600">
                {t("wheel.description") ||
                  "Spin the wheel to randomly select a person or an item."}
              </p>
            </div>
          </Link>
        </div>

        {/* Placeholder for more selector cards in the future */}
      </div>
    </div>
  );
}
