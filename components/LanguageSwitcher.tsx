'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const languages = [
  {
    code: 'sr',
    name: 'Srpski',
    flag: '🇷🇸'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧'
  },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Uzmi trenutni jezik iz URL-a
  const currentLangFromUrl = searchParams ? searchParams.get('lang') || 'sr' : 'sr';
  const [currentLang, setCurrentLang] = useState(currentLangFromUrl);
  const [isOpen, setIsOpen] = useState(false);

  // Ažuriraj state kad se promeni URL
  useEffect(() => {
    setCurrentLang(currentLangFromUrl);
  }, [currentLangFromUrl]);

  const handleLanguageChange = (langCode: string) => {
    console.log('Changing language to:', langCode);
    setCurrentLang(langCode);
    setIsOpen(false);

    // Kreiraj nove URL parametre
    const newSearchParams = new URLSearchParams(searchParams?.toString() || '');
    newSearchParams.set('lang', langCode);

    // Navigiraj na istu stranicu sa novim lang parametrom
    const newUrl = `${pathname}?${newSearchParams.toString()}`;
    router.push(newUrl);

    // Refresh stranicu da se učitaju novi podaci iz baze
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-violet-600 transition-colors p-2 rounded hover:bg-violet-50"
      >
        <span className="text-3xl">{currentLanguage?.flag}</span>
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-violet-50 flex items-center space-x-3 transition-colors cursor-pointer ${
                currentLang === language.code ? 'bg-violet-50 text-violet-600 font-medium' : 'text-gray-700'
              }`}
              type="button"
            >
              <span className="text-2xl">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
              {currentLang === language.code && (
                <span className="ml-auto text-violet-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}