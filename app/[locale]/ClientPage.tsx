'use client';

import { useTranslations } from 'next-intl';
import { RouletteProvider } from './context/RouletteContext';

// Import Components
import Header from './components/Header';
import PersonInput from './components/PersonInput';
import PeopleList from './components/PeopleList';
import RouletteControls from './components/RouletteControls';
import RouletteWheel from './components/RouletteWheel';
import ResultDisplay from './components/ResultDisplay';

export default function ClientPage() {
  const t = useTranslations('home');

  return (
    <RouletteProvider>
      <div className="min-h-screen flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Header />

        <main className="w-full max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-full flex flex-col sm:flex-row gap-6">
            <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <PersonInput />
              <PeopleList />
              <RouletteControls />
            </div>

            <div className="flex-1 flex flex-col items-center">
              <RouletteWheel />
              <ResultDisplay />
            </div>
          </div>
        </main>

        <footer className="w-full max-w-4xl mx-auto mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Whozit - {t('title')}</p>
        </footer>
      </div>
    </RouletteProvider>
  );
}
