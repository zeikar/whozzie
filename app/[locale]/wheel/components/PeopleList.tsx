import { useTranslations } from "next-intl";
import { useWheel } from "../context/WheelContext";

export default function PeopleList() {
  const t = useTranslations("home");
  const { items, removeItem } = useWheel();

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
        {items.length > 0 ? `${items.length} ${t("items")}` : t("noItemAdded")}
      </h2>
      <ul className="space-y-2 max-h-60 overflow-y-auto">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md"
          >
            <span>{item}</span>
            <button
              onClick={() => removeItem(index)}
              className="text-red-500 hover:text-red-700 focus:outline-none"
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
