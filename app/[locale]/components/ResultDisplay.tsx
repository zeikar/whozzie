import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoulette } from '../context/RouletteContext';

export default function ResultDisplay() {
  const t = useTranslations('home');
  const { result } = useRoulette();

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center border-2 border-purple-500"
        >
          <h3 className="text-sm uppercase text-gray-500 dark:text-gray-400 mb-1">{t('result')}</h3>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{result}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
