import { useTranslations } from "next-intl";
import { useWheel } from "../context/WheelContext";

export default function WheelControls() {
  const t = useTranslations("wheel");
  const { spinWheel, resetWheel, items, spinning } = useWheel();
  const disabled = items.length < 1;
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={spinWheel}
        disabled={disabled || spinning}
        className={`flex-1 px-6 py-4 rounded-lg font-bold text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
          disabled || spinning
            ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg focus:ring-purple-500 transform hover:-translate-y-0.5"
        }`}
      >
        {spinning ? (
          <span className="inline-flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {t("spinning")}
          </span>
        ) : (
          t("spin")
        )}
      </button>
      <button
        onClick={resetWheel}
        className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 shadow-md"
      >
        {t("reset")}
      </button>
    </div>
  );
}
