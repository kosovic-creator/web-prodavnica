'use client';
import { useTranslation } from 'react-i18next';
import { FaSignOutAlt } from "react-icons/fa";
import '@/i18n/config';

export default function LogoutPage() {
  const { t } = useTranslation('logout');

  return (
    <div className="p-4 max-w-md mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaSignOutAlt className="text-violet-600" />
        {t('title')}
      </h1>
      <button className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700 transition">
        <FaSignOutAlt />
        {t('logout')}
      </button>
    </div>
  );
}