import { useTranslations } from "next-intl";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useWheel } from "../context/WheelContext";

export default function ResultDisplay() {
  const t = useTranslations("wheel");
  const { resultIndex, items, showResult, closeResult, removeSelectedItem } =
    useWheel();

  const resultItem =
    resultIndex !== null && items[resultIndex] ? items[resultIndex] : null;

  return (
    <Transition appear show={showResult && resultItem !== null} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeResult}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-8 shadow-2xl border-4 border-purple-500 dark:border-purple-600 transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2 text-center"
                >
                  {t("result")}
                </Dialog.Title>
                <div className="my-6 py-6 px-4 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                  <p className="text-4xl font-bold text-purple-700 dark:text-purple-300 text-center break-words">
                    {resultItem}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={closeResult}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md"
                  >
                    {t("confirm")}
                  </button>
                  <button
                    onClick={removeSelectedItem}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md"
                  >
                    {t("removeFromRoulette")}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
