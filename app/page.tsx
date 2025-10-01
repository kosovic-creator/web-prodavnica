/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useTranslation } from 'react-i18next';
import { useSession } from "next-auth/react";
import AdminHome from './admin/page';
import { FaHome, FaUserShield, FaSpinner } from "react-icons/fa";
import { Suspense } from 'react';
import Link from 'next/link';
import ProizvodiBanner from '@/components/ProizvodiBanner';
import ProizvodiHome from '@/components/ProizvodiGrid';

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

  const adminPanelText = t('admin_panel') || 'Admin Panel';

  return (
    <>
      {session?.user?.uloga === 'admin' ? (
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-violet-700">
            <FaUserShield className="text-violet-600" />
            {adminPanelText}
          </h1>
          <AdminHome />
        </div>
      ) : (
          <div className="flex flex-col">
            {/* Banner za proizvode */}
            <ProizvodiBanner />

            {/* Sekcija proizvoda */}
            <div className="container mx-auto px-4 py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {t('our_products')}
              </h2>
              <ProizvodiHome />
            </div>
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
