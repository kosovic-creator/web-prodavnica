/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useSession, signOut } from "next-auth/react";
import React, { useEffect, useState, Suspense } from "react";
import { FaShoppingCart, FaHome, FaUser, FaSignInAlt, FaSignOutAlt, FaUserShield, FaChevronDown, FaSearch, FaTimes, FaBars } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/config';
import { useKorpa } from "@/components/KorpaContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSearch } from '@/components/SearchContext';

interface NavbarProps {
  setSidebarOpen?: (open: boolean) => void;
}

// Komponenta koja koristi useSearchParams - mora biti u Suspense
function NavbarContent({ setSidebarOpen }: NavbarProps) {
  const { t } = useTranslation('navbar');
  const { data: session } = useSession();
  const [brojUKorpi, setBrojUKorpi] = useState(0);
  const { brojStavki, setBrojStavki } = useKorpa();
  const isAdmin = session?.user?.uloga === 'admin';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Sada je u Suspense boundary
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('sr');
  const [localSearch, setLocalSearch] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { setSearchTerm } = useSearch();
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Safely get current language
  useEffect(() => {
    if (isMounted) {
      try {
        const langFromUrl = searchParams?.get('lang') || i18n.language || 'sr';
        setCurrentLanguage(langFromUrl);
      } catch (error) {
        setCurrentLanguage('sr');
      }
    }
  }, [searchParams, isMounted]);

  useEffect(() => {
    const broj = Number(localStorage.getItem('brojUKorpi') || 0);
    setBrojUKorpi(broj);
    setBrojStavki(broj);

    const handler = () => {
      const broj = Number(localStorage.getItem('brojUKorpi') || 0);
      setBrojUKorpi(broj);
      setBrojStavki(broj);
    };

    window.addEventListener('korpaChanged', handler);
    return () => window.removeEventListener('korpaChanged', handler);
  }, [setBrojStavki]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    setLanguageDropdownOpen(false);

    try {
      const urlSearchParams = new URLSearchParams(window.location.search);
      urlSearchParams.set('lang', lang);
      router.push(`${pathname}?${urlSearchParams.toString()}`);
    } catch (error) {
      router.push(`${pathname}?lang=${lang}`);
    }
  };

  const navigateWithLang = (path: string) => {
    try {
      const currentLang = searchParams?.get('lang') || 'sr';
      router.push(`${path}?lang=${currentLang}`);
    } catch (error) {
      router.push(`${path}?lang=sr`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchTerm(localSearch.trim());
      navigateWithLang('/proizvodi');
      setShowMobileSearch(false);
    }
  };

  const getLanguageFlag = (lang: string) => {
    return lang === 'en' ? '🇬🇧' : '🇲🇪';
  };

  const getLanguageName = (lang: string) => {
    return lang === 'en' ? 'English' : 'Crnogorski';
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border-b border-gray-200 bg-white shadow-sm">
        {!isAdmin && (
          <>
            {/* Left Section - Hamburger + Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Hamburger - larger touch target */}
              <button
                className="p-2 sm:p-3 focus:outline-none rounded-lg hover:bg-gray-100 touch-manipulation"
                onClick={() => setSidebarOpen?.(true)}
                aria-label="Open sidebar"
              >
                <FaBars className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>

              {/* App Logo - responsive */}
              <button
                onClick={() => navigateWithLang('/')}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50 transition touch-manipulation min-w-0"
              >
                <span className="text-xl sm:text-2xl">🛒</span>
                <span className="font-bold text-violet-700 text-sm sm:text-base truncate">
                  <span className="hidden xs:inline">
                    {isMounted ? t('title') : (currentLanguage === 'en' ? 'WebShop' : 'WebTrgovina')}
                  </span>
                  <span className="xs:hidden">Trgovina</span>
                </span>
              </button>
            </div>

            {/* Center Section - Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder={isMounted ? t('search') + '...' : (currentLanguage === 'en' ? 'Search...' : 'Pretraga...')}
                    className="border border-violet-300 rounded-lg p-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-400 w-full text-base"
                  />
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" />
                  {localSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSearch('');
                        setSearchTerm('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 p-1"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-violet-600 text-white px-4 py-3 rounded-lg hover:bg-violet-700 transition touch-manipulation"
                >
                  <FaSearch />
                </button>
              </form>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="lg:hidden p-2 sm:p-3 focus:outline-none rounded-lg hover:bg-violet-50 transition touch-manipulation"
              >
                <FaSearch className="text-violet-600 w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Korpa */}
              {session?.user && (
                <button
                  onClick={() => navigateWithLang('/korpa')}
                  className="relative flex items-center justify-center p-2 sm:p-3 rounded-lg hover:bg-violet-50 transition touch-manipulation min-w-[44px] min-h-[44px]"
                >
                  <FaShoppingCart className="text-violet-600 w-4 h-4 sm:w-5 sm:h-5" />
                  {brojUKorpi > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full px-1.5 py-0.5 text-xs min-w-[18px] text-center leading-none">
                      {brojUKorpi > 99 ? '99+' : brojUKorpi}
                    </span>
                  )}
                </button>
              )}

              {/* Login/Logout */}
              {!session?.user ? (
                <button
                  onClick={() => navigateWithLang('/auth/prijava')}
                  className="flex items-center justify-center p-2 sm:p-3 rounded-lg hover:bg-violet-50 transition touch-manipulation min-w-[44px] min-h-[44px]"
                >
                  <FaSignInAlt className="text-violet-600 w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              ) : (
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/prijava" })}
                  className="flex items-center justify-center p-2 sm:p-3 rounded-lg hover:bg-violet-50 transition touch-manipulation min-w-[44px] min-h-[44px]"
                >
                  <FaSignOutAlt className="text-violet-600 w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Language Dropdown - Hide in admin section */}
              {!pathname?.startsWith('/admin') && (
                <div className="relative">
                  <button
                    onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                    className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none touch-manipulation min-w-[44px] min-h-[44px]"
                  >
                    <span className="text-lg sm:text-xl">{getLanguageFlag(currentLanguage)}</span>
                    <span className="hidden md:inline text-xs sm:text-sm font-medium">{getLanguageName(currentLanguage)}</span>
                    <FaChevronDown className={`text-gray-500 text-xs transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {languageDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => changeLanguage('sr')}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-colors touch-manipulation ${currentLanguage === 'sr' ? 'bg-violet-50 text-violet-700' : 'text-gray-700'
                          }`}
                      >
                        <span className="text-lg sm:text-xl">🇲🇪</span>
                        <span className="text-xs sm:text-sm">Crnogorski</span>
                      </button>
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-colors touch-manipulation ${currentLanguage === 'en' ? 'bg-violet-50 text-violet-700' : 'text-gray-700'
                          }`}
                      >
                        <span className="text-lg sm:text-xl">🇬🇧</span>
                        <span className="text-xs sm:text-sm">English</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => signOut({ callbackUrl: "/auth/prijava" })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-violet-50 transition touch-manipulation"
            >
              <FaSignOutAlt className="text-violet-600" />
              <span className="hidden sm:inline">
                {isMounted ? t('logout') : (currentLanguage === 'en' ? 'Logout' : 'Odjava')}
              </span>
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Search Bar */}
      {showMobileSearch && !isAdmin && (
        <div className="lg:hidden bg-white border-b border-gray-200 p-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Pretraži proizvode..."
                className="border border-violet-300 rounded-lg p-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-400 w-full text-base"
                autoFocus
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    setSearchTerm('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 p-1"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-violet-600 text-white px-4 py-3 rounded-lg hover:bg-violet-700 transition touch-manipulation"
            >
              <FaSearch />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// Glavna Navbar komponenta sa Suspense
export default function Navbar({ setSidebarOpen }: NavbarProps) {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <NavbarContent setSidebarOpen={setSidebarOpen} />
    </Suspense>
  );
}


