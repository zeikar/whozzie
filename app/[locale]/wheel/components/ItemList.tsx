import { useTranslations } from "next-intl";
import { useWheel } from "../context/WheelContext";

export default function ItemList() {
  const t = useTranslations("wheel");
  const { items, removeItem } = useWheel();
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200 flex items-center">
        {items.length > 0 ? (
          <>
            <span className="inline-flex items-center justify-center bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full w-8 h-8 mr-2">
              {items.length}
            </span>
            <span>{t("items")}</span>
          </>
        ) : (
          t("noItemAdded")
        )}
      </h2>
      <ul className="space-y-2 max-h-72 overflow-y-auto pr-2 rounded-lg border-2 border-purple-100 dark:border-purple-900 p-2 bg-white dark:bg-gray-800 shadow-inner">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="font-medium">{item}</span>
            <button
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900 rounded-full w-6 h-6 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
