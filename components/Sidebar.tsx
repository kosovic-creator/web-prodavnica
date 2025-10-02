'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FaBoxOpen, FaUser, FaTimes, FaHome, FaShoppingBag, FaChartBar, FaCog, FaPhone, FaInfoCircle, FaHeart, FaHistory } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import i18n from '@/i18n/config';
import '@/i18n/config';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

// Izvuci logiku koja koristi useSearchParams u zasebnu komponentu
function SidebarContent({ open, onClose }: SidebarProps) {
  const { t } = useTranslation('sidebar');
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams(); // Sada je u Suspense boundary-u
  const [currentLanguage, setCurrentLanguage] = useState('sr');

  const isAdmin = session?.user?.uloga === 'admin';

  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  // Initialize language based on URL params
  useEffect(() => {
    const currentLang = searchParams?.get('lang') || 'sr';
    console.log('Sidebar - Current language from URL:', currentLang);
    console.log('Sidebar - i18n.language:', i18n.language);
    console.log('Sidebar - test translation "menu":', t('menu'));

    setCurrentLanguage(currentLang);

    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [searchParams, t]);



  // Funkcija za navigaciju koja zadržava trenutni jezik
  const navigateWithLang = (path: string) => {
    const currentLang = searchParams?.get('lang') || 'sr';
    router.push(`${path}?lang=${currentLang}`);
    onClose();
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Admin menu items - recreated when language changes
  const adminMenuItems = React.useMemo(() => [
    { path: '/admin', icon: FaChartBar, label: t('dashboard'), emoji: '📊' },
    { path: '/admin/proizvodi', icon: FaBoxOpen, label: t('proizvodi'), emoji: '📦' },
    { path: '/admin/korisnici', icon: FaUser, label: t('korisnici'), emoji: '👥' },
    { path: '/admin/narudzbine', icon: FaShoppingBag, label: t('narudzbine'), emoji: '🛍️' },
    { path: '/admin/postavke', icon: FaCog, label: t('postavke'), emoji: '⚙️' },
  ], [t]);

  // User menu items - recreated when language changes
  const userMenuItems = React.useMemo(() => [
    { path: '/', icon: FaHome, label: t('pocetna'), emoji: '🏠' },
    { path: '/proizvodi', icon: FaShoppingBag, label: t('proizvodi'), emoji: '🛍️' },
    ...(session?.user ? [
      { path: '/porudzbine', icon: FaHistory, label: t('moje_narudzbine'), emoji: '📋' },
      { path: '/omiljeni', icon: FaHeart, label: t('omiljeni'), emoji: '❤️' },
    ] : []),
    { path: '/profil', icon: FaUser, label: t('profile'), emoji: '👤' },
    { path: '/o-nama', icon: FaInfoCircle, label: t('o_nama'), emoji: 'ℹ️' },
    { path: '/kontakt', icon: FaPhone, label: t('kontakt'), emoji: '📞' },
  ], [t, session?.user]);

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  if (!open) return null;

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        w-64 lg:w-64
        lg:${open ? 'relative translate-x-0' : 'hidden'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <h2 className="font-bold text-violet-700 text-lg">
              {isAdmin ? t('admin_panel') : t('menu')} ({currentLanguage})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation lg:hidden"
            aria-label={t('close_sidebar')}
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* User Info */}
        {session?.user && (
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold">
                {session.user.ime?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 truncate text-sm">
                  {session.user.ime} {session.user.prezime}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>
                {isAdmin && (
                  <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full mt-1">
                    {t('admin')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 sidebar-nav">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigateWithLang(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 touch-manipulation
                      ${active
                        ? 'bg-violet-100 text-violet-700 border-r-4 border-violet-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-violet-600'
                      }
                    `}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    {/* <Icon className={`w-4 h-4 ${active ? 'text-violet-600' : 'text-gray-500'}`} /> */}
                    <span className="font-medium text-sm truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">{t('web_trgovina')}</p>
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}

// Glavna Sidebar komponenta sa Suspense
export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading sidebar...</div>}>
      <SidebarContent open={open} onClose={onClose} />
    </Suspense>
  );
}
