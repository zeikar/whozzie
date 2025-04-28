import { useTranslations } from "next-intl";
import { useWheel } from "../context/WheelContext";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLocale } from "next-intl";

export default function ItemList() {
  const t = useTranslations("wheel");
  const { items, removeItem } = useWheel();
  const locale = useLocale();
  return (
    <div className="mb-8 w-full">
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
      <ul className="space-y-2 max-h-72 overflow-y-auto pr-2 rounded-lg border-2 border-purple-100 dark:border-purple-900 p-2 bg-white dark:bg-gray-800 shadow-inner w-full">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex-1 overflow-hidden min-w-0 max-w-[calc(100%-40px)]">
              <span className="font-medium truncate block" title={item}>
                {item}
              </span>
            </div>
            <button
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-white bg-white hover:bg-red-500 rounded-full w-7 h-7 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-400 transition-all flex-shrink-0 border border-red-300 shadow-sm dark:bg-gray-600 dark:border-red-500 dark:hover:bg-red-600 ml-3"
              title={
                locale === "ko"
                  ? `${item} ${t("remove")}`
                  : `${t("remove")} ${item}`
              }
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
