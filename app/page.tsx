/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useTranslation } from 'react-i18next';
import { useSession } from "next-auth/react";
import AdminHome from './admin/page';
import { FaUserShield, FaSpinner } from "react-icons/fa";
import { Suspense, useEffect, useState } from 'react';
import ProizvodiBanner from '@/components/ProizvodiBanner';
import ProizvodiHome from '@/components/ProizvodiGrid';


// Skeleton komponenta za Home stranicu
function HomeSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      {/* Banner skeleton */}
      <div className="w-full h-64 sm:h-80 bg-gray-200 rounded-lg mx-4 my-6"></div>

      {/* Products section skeleton */}
      <div className="container mx-auto px-4 py-8">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-6"></div>

        {/* Products grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm">
              {/* Image skeleton */}
              <div className="mb-3 flex justify-center">
                <div className="w-[100px] h-[100px] bg-gray-200 rounded-md"></div>
              </div>

              <div className="flex-1 space-y-2">
                {/* Title skeleton */}
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>

                {/* Description skeleton */}
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>

                {/* Category skeleton */}
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>

                {/* Price skeleton */}
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>

              {/* Buttons skeleton */}
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Admin skeleton
function AdminSkeleton() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-blue-200 rounded flex items-center justify-center">
          <FaUserShield className="text-blue-400 text-sm" />
        </div>
        <div className="w-40 h-8 bg-blue-100 rounded"></div>
      </div>

      {/* Admin content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4"></div>
            <div className="h-6 bg-blue-100 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeContent() {
  const { t, ready } = useTranslation('home');
  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [previousUserRole, setPreviousUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (ready && status !== 'loading') {
      // Small delay to prevent flickering when data is available quickly
      const timer = setTimeout(() => {
        setIsInitialized(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [ready, status]);

  useEffect(() => {
    if (session?.user?.uloga && session.user.uloga !== previousUserRole) {
      setPreviousUserRole(session.user.uloga);
    }
  }, [session?.user?.uloga, previousUserRole]);

  // Show loading while translations or session are loading
  if (!isInitialized) {
    // Show appropriate skeleton based on known user role
    if (session?.user?.uloga === 'admin' || previousUserRole === 'admin') {
      return <AdminSkeleton />;
    }
    // Otherwise show home skeleton
    return <HomeSkeleton />;
  }

  const adminPanelText = t('admin_panel') || 'Admin Panel';

  // Only render admin content if we're sure the user is admin
  if (session?.user?.uloga === 'admin') {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-blue-700">
          <FaUserShield className="text-blue-600" />
          {adminPanelText}
        </h1>
        <AdminHome />
      </div>
    );
  }

  // Regular user content
  return (
    <>
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
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
        </div>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
