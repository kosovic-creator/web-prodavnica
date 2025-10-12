
'use client';
import { useTranslation } from 'react-i18next';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProizvodiBanner from '@/components/ProizvodiBanner';
import ProizvodiHome from '@/components/ProizvodiGrid';
import Loading from '@/components/Loadning';


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
    return <Loading />;
  }

  // Don't render anything if user is admin (will redirect)
  if (session?.user?.uloga === 'admin') {
    return <Loading />;
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
