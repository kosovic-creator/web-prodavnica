'use client';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBoxOpen, FaClipboardList, FaUser } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

import '@/i18n/config';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { t, i18n } = useTranslation('sidebar');
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed top-0 left-0 h-screen w-56 bg-white shadow-lg z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b font-bold text-lg">
          {/* <span>{t('sidebar')}</span> */}
          <button onClick={onClose} className="text-xl cursor-pointer" aria-label="Close sidebar">&times;</button>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => {
                  router.push('/proizvodi?lang=sr');
                }}
                className="flex items-center gap-2 py-2 px-4 rounded hover:bg-violet-50 transition"
              >
                <FaBoxOpen className="text-violet-600" /> Crnogorski
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  router.push('/proizvodi?lang=en');
                }}
                className="flex items-center gap-2 py-2 px-4 rounded hover:bg-violet-50 transition"
              >
                <FaBoxOpen className="text-violet-600" /> Engleski
              </button>
            </li>
            {/* Porudzbine */}
            {session?.user && (
              <li>
                <Link
                  href="/porudzbine"
                  className={`flex items-center gap-2 py-2 px-4 rounded hover:bg-violet-50 transition ${pathname === '/porudzbine' ? 'bg-violet-100 font-bold' : ''}`}
                >
                  <FaClipboardList className="text-violet-600" /> {t('orders')}
                </Link>
              </li>
            )}
            {/* Profil */}
            {session?.user && (
              <li>
                <Link
                  href="/profil"
                  className={`flex items-center gap-2 py-2 px-4 rounded hover:bg-violet-50 transition ${pathname === '/profil' ? 'bg-violet-100 font-bold' : ''}`}
                >
                  <FaUser className="text-violet-600" /> {t('profile')}
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="flex gap-2 p-4 border-t mt-auto">
          <button onClick={() => i18n.changeLanguage('en')} className="p-1 rounded hover:bg-gray-100" aria-label="English">
            <span role="img" aria-label="English">🇬🇧</span>
          </button>
          <button onClick={() => i18n.changeLanguage('sr')} className="p-1 rounded hover:bg-gray-100" aria-label="Srpski">
            <span role="img" aria-label="Srpski">🇷🇸</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
