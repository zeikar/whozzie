import { useTranslations } from "next-intl";
import { useWheel } from "../context/WheelContext";

export default function RouletteControls() {
  const t = useTranslations("wheel");
  const { spinWheel, resetWheel, items, spinning } = useWheel();
  const disabled = items.length < 1;

  return (
    <div className="flex space-x-2">
      <button
        onClick={spinWheel}
        disabled={disabled || spinning}
        className={`flex-1 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
          disabled || spinning
            ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
        }`}
      >
        {spinning ? t("spinning") : t("spin")}
      </button>
      <button
        onClick={resetWheel}
        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
      >
        {t("reset")}
      </button>
    </div>
  );
}
