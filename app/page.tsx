
'use client';
import { useTranslation } from 'react-i18next';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProizvodiBanner from '@/components/ProizvodiBanner';
import ProizvodiHome from '@/components/ProizvodiGrid';

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
function HomeContent() {
  const { t, ready } = useTranslation('home');
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect admin users to /admin
  useEffect(() => {
    if (session?.user?.uloga === 'admin') {
      router.push('/admin');
    }
  }, [session?.user?.uloga, router]);

  // Show loading while session or translations are loading
  if (!ready || status === 'loading') {
    return <HomeSkeleton />;
  }

  // Don't render anything if user is admin (will redirect)
  if (session?.user?.uloga === 'admin') {
    return <HomeSkeleton />;
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
  return <HomeContent />;
}
