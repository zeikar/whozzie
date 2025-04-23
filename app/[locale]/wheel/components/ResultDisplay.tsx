import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useWheel } from "../context/WheelContext";

export default function ResultDisplay() {
  const t = useTranslations("home");
  const { resultIndex, items, showResult, closeResult, removeSelectedItem } =
    useWheel();

  const resultItem =
    resultIndex !== null && items[resultIndex] ? items[resultIndex] : null;

  return (
    <AnimatePresence>
      {showResult && resultItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-11/12 border-2 border-purple-500"
          >
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t("result")}
            </h3>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 my-4">
              {resultItem}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={closeResult}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors"
              >
                {t("confirm")}
              </button>
              <button
                onClick={removeSelectedItem}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
              >
                {t("removeFromRoulette")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
