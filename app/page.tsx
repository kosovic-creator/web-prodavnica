'use client';
import { useTranslation } from 'react-i18next';
import { useSession } from "next-auth/react";
import AdminHome from './admin/page';
import { FaHome, FaUserShield, FaSpinner } from "react-icons/fa";
import { Suspense } from 'react';
import Link from 'next/link';
import DiagnosticInfo from '@/components/DiagnosticInfo';

function HomeContent() {
  const { t, ready } = useTranslation('home');
  const { data: session, status } = useSession();

  // Show loading while translations or session are loading
  if (!ready || status === 'loading') {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-violet-600 mb-4" />
        <p className="text-gray-600">Učitavanje...</p>
      </div>
    );
  }

  // Add error boundary for missing translations
  const welcomeText = session?.user?.ime
    ? (t('welcome_user', { ime: session.user.ime }) || `Dobro došao, ${session.user.ime}!`)
    : (t('welcome') || 'Dobrodošli u našu prodavnicu!');

  const adminPanelText = t('admin_panel') || 'Admin Panel'; return (
    <>
      <DiagnosticInfo />
      {session?.user?.uloga === 'admin' ? (
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-violet-700">
            <FaUserShield className="text-violet-600" />
            {adminPanelText}
          </h1>
          <AdminHome />
        </div>
      ) : (
          <div className="p-8 max-w-2xl mx-auto flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-violet-700">
              <FaHome className="text-violet-600" />
              {welcomeText}
            </h1>          {/* Banner koji se pomjera sa novim proizvodima */}
            {!session?.user && (
              <div className="w-full text-center">
                <div className="bg-violet-100 p-8 rounded-lg mb-6">
                  <h2 className="text-xl font-semibold text-violet-800 mb-4">Dobrodošli u našu web trgovinu!</h2>
                  <p className="text-violet-600 mb-4">Pronađite najbolje proizvode po najpovoljnijim cijenama.</p>
                  <Link href="/proizvodi" className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition inline-block">
                    Pregledaj proizvode
                  </Link>
                </div>
              </div>
            )}
            {session?.user && (
              <div className="text-center mt-8">
                <p className="text-gray-600 mb-4">Dobrodošli nazad! Možete pregledati naše proizvode.</p>
                <Link href="/proizvodi" className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition">
                  Pogledaj proizvode
                </Link>
              </div>
            )}
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-violet-600 mb-4" />
        <p className="text-gray-600">Učitavanje stranice...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
