/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import { useKorpa } from '@/components/KorpaContext';
import '@/i18n/config';

// Define the StavkaKorpe type
type StavkaKorpe = {
  id: string;
  kolicina: number;
  proizvod?: {
    id: string;
    naziv?: string;
    cena: number;
    slika?: string;
  };
};

function KorpaContent() {
  const { data: session } = useSession();
  const { t, i18n } = useTranslation('korpa');
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = searchParams?.get('lang') || 'sr';
  const [stavke, setStavke] = useState<StavkaKorpe[]>([]);
  const [loading, setLoading] = useState(true);
  useKorpa();

  // Set language based on URL parameter
  useEffect(() => {
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  // Funkcija za ažuriranje broja stavki u localStorage
  const updateCartCount = async () => {
    if (session?.user?.id) {
      const res = await fetch(`/api/korpa?korisnikId=${session.user.id}`);
      const data = await res.json();
      const broj = data.stavke.reduce((acc: number, s: { kolicina: number }) => acc + s.kolicina, 0);
      localStorage.setItem('brojUKorpi', broj.toString());
      window.dispatchEvent(new Event('korpaChanged'));

      // Ako je korpa prazna, preusmeri na proizvode
      if (broj === 0) {
        router.push(`/proizvodi?lang=${lang}`);
      }

      return broj;
    }
    return 0;
  };

  // Funkcija za učitavanje korpe
  const fetchKorpa = async () => {
    setLoading(true);
    const korisnikId = session?.user?.id;
    if (!korisnikId) return setLoading(false);

    try {
      const res = await fetch(`/api/korpa?korisnikId=${korisnikId}`);
      const data = await res.json();
      setStavke(data.stavke || []);
    } catch (error) {
      console.error('Greška pri učitavanju korpe:', error);
      setStavke([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchKorpa();
    }
  }, [session?.user?.id]);

  const handleKolicina = async (stavkaId: string, nova: number) => {
    try {
      await fetch(`/api/korpa/${stavkaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kolicina: nova })
      });

      // Refresh korpa data
      await fetchKorpa();

      // Update cart count in navbar
      await updateCartCount();

    } catch (error) {
      console.error('Greška pri ažuriranju količine:', error);
    }
  };



  const handleUkloni = async (stavkaId: string) => {
    try {
      console.log('Uklanjanje stavke ID:', stavkaId);

      const response = await fetch('/api/korpa', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: stavkaId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Greška pri uklanjanju');
      }

      const result = await response.json();
      console.log('Rezultat brisanja:', result);

      // Refresh korpa data
      await fetchKorpa();

      // Update cart count in navbar and check if empty
      await updateCartCount();

    } catch (error) {
      console.error('Greška pri uklanjanju stavke:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">{t('ucitavanje') || 'Učitavanje korpe...'}</div>;
  }

  if (!session?.user) {
    return <div className="p-4 text-center">{t('morate_biti_prijavljeni')}</div>;
  }

  if (!stavke || stavke.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">{t('prazna')}</h2>
        <p className="text-gray-500 mb-6">Dodajte proizvode u korpu da biste ih videli ovde.</p>
        <button
          onClick={() => router.push(`/proizvodi?lang=${lang}`)}
          className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition"
        >
          {t('nastavi_kupovinu')}
        </button>
      </div>
    );
  }

  const ukupno = stavke.reduce((acc, s) => acc + s.kolicina * (s.proizvod?.cena || 0), 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t('naslov')}</h1>

      <div className="space-y-4">
        {stavke.map((stavka) => (
          <div key={stavka.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow border">
            {stavka.proizvod?.slika && (
              <img
                src={stavka.proizvod.slika}
                alt={stavka.proizvod.naziv}
                className="w-16 h-16 object-cover rounded"
              />
            )}

            <div className="flex-1">
              <h3 className="font-semibold">{stavka.proizvod?.naziv}</h3>
              <p className="text-gray-600">{stavka.proizvod?.cena}€</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleKolicina(stavka.id, Math.max(1, stavka.kolicina - 1))}
                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center"
              >
                -
              </button>

              <span className="w-12 text-center">{stavka.kolicina}</span>

              <button
                onClick={() => handleKolicina(stavka.id, stavka.kolicina + 1)}
                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center"
              >
                +
              </button>
            </div>

            <div className="text-right">
              <div className="font-semibold">
                {(stavka.kolicina * (stavka.proizvod?.cena || 0)).toFixed(2)}€
              </div>
              <button
                onClick={() => handleUkloni(stavka.id)}
                className="text-red-600 hover:text-red-800 text-sm mt-1"
              >
                {t('ukloni')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-xl font-bold">
          <span>{t('ukupno')}:</span>
          <span>{ukupno.toFixed(2)}€</span>
        </div>

        <button className="w-full mt-4 bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 transition">
          {t('zavrsi_kupovinu')}
        </button>
      </div>
    </div>
  );
}

export default function KorpaPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Učitavanje korpe...</div>}>
      <KorpaContent />
    </Suspense>
  );
}
