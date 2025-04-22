import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRoulette } from '../context/RouletteContext';

export default function PersonInput() {
  const t = useTranslations('home');
  const { addPerson } = useRoulette();
  const [newPerson, setNewPerson] = useState('');

  const handleAddPerson = () => {
    if (newPerson.trim()) {
      addPerson(newPerson.trim());
      setNewPerson('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPerson();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex space-x-2">
        <input
          type="text"
          value={newPerson}
          onChange={(e) => setNewPerson(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('placeholder')}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={handleAddPerson}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
        >
          {t('addPerson')}
        </button>
      </div>
    </div>
  );
}
