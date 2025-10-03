'use client';
import { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import '@/i18n/config';
import Image from 'next/image';
import Link from 'next/link';
import { FaEye, FaCartPlus } from 'react-icons/fa';
import { Proizvod } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

// Inner component that uses useSearchParams
function ProizvodiGrid() {
  const { t, i18n } = useTranslation('proizvodi');
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDodajUKorpu = async (proizvod: Proizvod) => {
    const korisnikId = session?.user?.id;
    if (!korisnikId) {
      toast.error(
        <span>
          Morate biti prijavljeni za dodavanje u korpu!{' '}
          <a href="/auth/prijava" className="underline text-blue-600 ml-2">Prijavi se</a>
        </span>
      );
      return;
    }

    try {
      await fetch('/api/korpa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ korisnikId, proizvodId: proizvod.id, kolicina: 1 })
      });

      // Ažuriraj broj stavki u korpi
      const res = await fetch(`/api/korpa?korisnikId=${korisnikId}`);
      const data = await res.json();
      const broj = data.stavke.reduce((acc: number, s: { kolicina: number }) => acc + s.kolicina, 0);
      localStorage.setItem('brojUKorpi', broj.toString());
      window.dispatchEvent(new Event('korpaChanged'));

      toast.success('Proizvod je dodat u korpu!');
    } catch {
      toast.error('Greška pri dodavanju u korpu.');
    }
  };

  useEffect(() => {
    const currentLang = searchParams?.get('lang') || i18n.language || 'sr';
    fetch(`/api/proizvodi?page=1&pageSize=12&lang=${currentLang}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.proizvodi && Array.isArray(data.proizvodi)) {
          setProizvodi(data.proizvodi);
        } else {
          setError(t('nema_dostupnih_proizvoda'));
        }
      })
      .catch(error => {
        console.error('Error fetching proizvodi:', error);
        setError(t('greska_ucitavanje_proizvoda'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [t, i18n.language, searchParams]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg p-6 h-96"></div>
        ))}
      </div>
    );
  }

  if (error || proizvodi.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{t('nema_proizvoda_prikaz')}</p>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proizvodi.map((proizvod) => (
          <div
            key={proizvod.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
          >
            {/* Ikona ili slika proizvoda */}
            <div className="flex justify-center mb-4">
              {proizvod.slika ? (
                <div className="relative w-24 h-24">
                  <Image
                    src={proizvod.slika}
                    alt={proizvod.naziv}
                    fill
                    className="object-contain"
                    sizes="96px"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">
                    {proizvod.kategorija === 'bicikla' ? '🚴' :
                      proizvod.kategorija === 'patike' ? '👟' : '📦'}
                  </span>
                </div>
              )}
            </div>

            {/* Naziv proizvoda */}
            <h3 className="text-xl font-bold text-center mb-2 text-gray-800">
              {proizvod.naziv}
            </h3>

            {/* Opis */}
            {proizvod.opis && (
              <p className="text-gray-600 text-center mb-3 text-sm">
                {proizvod.opis}
              </p>
            )}

            {/* Karakteristike */}
            {proizvod.karakteristike && (
              <p className="text-gray-500 text-center mb-3 text-sm">
                {proizvod.karakteristike}
              </p>
            )}

            {/* Kategorija */}
            {proizvod.kategorija && (
              <p className="text-center mb-4">
                <span className="inline-block bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm font-medium">
                  {t('kategorija')}: {proizvod.kategorija}
                </span>
              </p>
            )}

            {/* Cijena */}
            <p className="text-center mb-4">
              <span className="text-2xl font-bold text-violet-600">
                {proizvod.cena} €
              </span>
            </p>

            {/* Količina - MODIFICIRANO */}
            {proizvod.kolicina !== undefined && (
              <p className="text-center mb-4 text-sm">
                <span className={`px-2 py-1 rounded ${proizvod.kolicina === 0 ? 'bg-red-100 text-red-600 font-bold' : 'bg-gray-100 text-gray-500'}`}>
                  {t('kolicina')}: {proizvod.kolicina}
                </span>
              </p>
            )}

            {/* Napomena o zalihama - NOVO */}
            {/* {proizvod.kolicina === 0 && (
              <div className="text-red-600 text-sm font-medium text-center bg-red-50 py-1 rounded">
                {t('nema_na_zalihama')}
              </div>
            )} */}

            {/* Dugme za dodavanje u korpu */}
            <div className="flex gap-2">
              <Link
                href={`/proizvodi/${proizvod.id}`}
                className="flex-1 bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FaEye />
                {t('detalji')}
              </Link>

              <button
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white px-3 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={e => { e.stopPropagation(); handleDodajUKorpu(proizvod); }}
                disabled={proizvod.kolicina === 0}
              >
                <FaCartPlus />
                {proizvod.kolicina === 0 ? (t('nema_na_zalihama') || 'Nema na zalihama') : (t('dodaj_u_korpu') || 'Dodaj u korpu')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main component with Suspense
export default function ProizvodiHome() {
  return (
    <Suspense fallback={<div className="text-center p-4">Loading products...</div>}>
      <ProizvodiGrid />
    </Suspense>
  );
}