'use client';

import { useTranslation } from 'react-i18next';
import '@/i18n/config';
import ProizvodiBanner from '@/components/ProizvodiBanner';
import ProizvodiGridHome from '@/components/ProizvodiGridHome';
import Loading from '@/components/Loadning';
import { Session } from 'next-auth';

interface ProizvodServerAction {
  id: string;
  cena: number;
  slika: string | null;
  kolicina: number;
  kreiran: Date;
  azuriran: Date;
  naziv_en: string;
  naziv_sr: string;
  opis_en: string | null;
  opis_sr: string | null;
  karakteristike_en: string | null;
  karakteristike_sr: string | null;
  kategorija_en: string;
  kategorija_sr: string;
}

interface HomeClientProps {
  initialProizvodi: ProizvodServerAction[];
  session: Session | null;
}

export default function HomeClient({ initialProizvodi, session }: HomeClientProps) {
  const { t, ready } = useTranslation('home');

  // Show loading while translations are loading
  if (!ready) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex flex-col">
        {/* Banner za proizvode */}
        <ProizvodiBanner initialProizvodi={initialProizvodi} />

        {/* Sekcija proizvoda */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {t('our_products')}
          </h2>
          <ProizvodiGridHome initialProizvodi={initialProizvodi} session={session} />
        </div>
      </div>
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
        </div>
      </div>
    </>
  );
}