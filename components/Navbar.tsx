/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaHome, FaUser, FaSignInAlt, FaSignOutAlt, FaUserPlus, FaUserShield } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n/config';
import { useKorpa } from "@/components/KorpaContext";


export default function Navbar({ setSidebarOpen }: { setSidebarOpen?: (open: boolean) => void }) {
  const { t } = useTranslation('navbar');
  const { data: session } = useSession();
  const [brojUKorpi, setBrojUKorpi] = useState(0);
  const { brojStavki } = useKorpa();
  const isAdmin = session?.user?.uloga === 'admin';

  useEffect(() => {
    const broj = Number(localStorage.getItem('brojUKorpi') || 0);
    setBrojUKorpi(broj);
    const handler = () => {
      const broj = Number(localStorage.getItem('brojUKorpi') || 0);
      setBrojUKorpi(broj);
    };
    window.addEventListener('korpaChanged', handler);
    return () => window.removeEventListener('korpaChanged', handler);
  }, []);

  return (
    <nav className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white shadow-sm">
      {!isAdmin && (
        <>
          {/* Hamburger */}
          <button
            className="p-2 focus:outline-none rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen?.(true)}
            aria-label="Open sidebar"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Home */}
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-violet-50 transition">
            <FaHome className="text-violet-600" />
            <span>{t('home')}</span>
          </Link>
          {/* Korpa */}
          {session?.user && (
            <Link href="/korpa" className="relative flex items-center gap-2 px-3 py-2 rounded hover:bg-violet-50 transition">
              <FaShoppingCart className="text-violet-600" size={20} />
              <span>{t('cart') || ''}</span>
              {brojStavki > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 text-xs">
                  {brojStavki}
                </span>
              )}
            </Link>
          )}
          {/* Prijava/Registracija ili Odjava */}
          {!session?.user ? (
            <>
              <Link href="/auth/prijava" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-violet-50 transition">
                <FaSignInAlt className="text-violet-600" />
                <span>{t('login')}</span>
              </Link>
              <Link href="/auth/registracija" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-violet-50 transition">
                <FaUserPlus className="text-violet-600" />
                <span>{t('register')}</span>
              </Link>
            </>
          ) : (
              <button
                onClick={() => signOut({ callbackUrl: "/auth/prijava" })}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-violet-50 transition"
              >
                <FaSignOutAlt className="text-violet-600" />
                <span>{t('logout')}</span>
              </button>
          )}
        </>
      )}

      {isAdmin && (
        <>
          {/* <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-violet-50 transition">
            <FaUserShield className="text-violet-600" />
            <span>{t('admin')}</span>
          </Link> */}
          <button
            onClick={() => signOut({ callbackUrl: "/auth/prijava" })}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-violet-50 transition"
          >
            <FaSignOutAlt className="text-violet-600" />
            <span>{t('logout')}</span>
          </button>
        </>
      )}
      {/* Jezik */}
      <div className="flex gap-4 ml-auto items-center">
        <button
          onClick={() => i18n.changeLanguage('en')}
          aria-label="English"
          className="p-0 rounded focus:outline-none hover:scale-110 transition-transform"
        >
          <span role="img" aria-label="English" className="text-3xl md:text-4xl">🇬🇧</span>
        </button>
        <button
          onClick={() => i18n.changeLanguage('sr')}
          aria-label="Crnogorski"
          className="p-0 rounded focus:outline-none hover:scale-110 transition-transform"
        >
          <span role="img" aria-label="Crnogorski" className="text-3xl md:text-4xl">🇲🇪</span>
        </button>
      </div>
    </nav>
  );
}


import { SessionProvider } from "next-auth/react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const korisnikId = session?.user?.id ?? ""; // prilagodi prema svom modelu

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SessionProvider session={session}>
      <div>
        <Navbar setSidebarOpen={setSidebarOpen} />
        {/* ...ostali kod... */}
        {children}
      </div>
    </SessionProvider>
  );
}
