'use client';
import { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import '@/i18n/config';
import Image from 'next/image';
import Link from 'next/link';
import { FaEye, FaCartPlus } from 'react-icons/fa';
import { Proizvod } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import OmiljeniButton from './OmiljeniButton';

function ProizvodiGrid() {
  const { t, i18n } = useTranslation('proizvodi');
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleDodajUKorpu = async (proizvod: Proizvod) => {
    const korisnikId = session?.user?.id;
    if (!korisnikId) {
      toast.error(t('morate_biti_prijavljeni_za_korpu'), { duration: 4000 });
      router.push('/auth/prijava');
      return;
    }

    // Sprečava duplo klikanje
    if (addingToCart === proizvod.id) return;

    setAddingToCart(proizvod.id);

    // Debug logovi
    console.log('Dodavanje u korpu:', {
      korisnikId,
      proizvodId: proizvod.id,
      proizvod
    });

    try {
      // Dodaj u korpu
      const addResponse = await fetch('/api/korpa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ korisnikId, proizvodId: proizvod.id, kolicina: 1 })
      });

      console.log('Odgovor addResponse:', addResponse);

      if (!addResponse.ok) {
        const errorText = await addResponse.text();
        console.error('Greška pri dodavanju u korpu, odgovor:', errorText);
        throw new Error('Greška pri dodavanju u korpu');
      }

      // Ažuriraj broj stavki u korpi
      const res = await fetch(`/api/korpa?korisnikId=${korisnikId}`);
      if (!res.ok) {
        throw new Error('Greška pri učitavanju korpe');
      }

      const data = await res.json();
      const broj = data.stavke.reduce((acc: number, s: { kolicina: number }) => acc + s.kolicina, 0);
      localStorage.setItem('brojUKorpi', broj.toString());
      window.dispatchEvent(new Event('korpaChanged'));

      toast.success(t('proizvod_dodat_u_korpu'), { duration: 4000 });
    } catch (error) {
      console.error('Greška:', error);
      toast.error('Došlo je do greške pri dodavanju u korpu', { duration: 4000 });
    } finally {
      setAddingToCart(null);
    }
  };

  useEffect(() => {
    const currentLang = searchParams?.get('lang') || i18n.language || 'sr';
    fetch(`/api/proizvodi?lang=${currentLang}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
          if (Array.isArray(data.proizvodi)) {
            setProizvodi(data.proizvodi.slice(0, 12)); // Prikaži prvih 12 proizvoda
          } else {
            setError(t('nema_na_zalihama'));
          }
      })
      .catch(error => {
        console.error('Error fetching proizvodi:', error);
        setError(t('t.greska_ucitavanje_proizvoda'));
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
      <Toaster position="top-center" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proizvodi.map((proizvod) => {
          const currentLang = searchParams?.get('lang') || i18n.language || 'sr';
          return (
            <div
              key={proizvod.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 relative"
            >
              <div className="absolute top-3 right-3 z-10">
                <OmiljeniButton proizvodId={proizvod.id} />
              </div>
              <div className="flex justify-center mb-4">
                {proizvod.slika ? (
                  <div className="relative w-24 h-24">
                    <Image
                      src={getCloudinaryOptimizedUrl(proizvod.slika)}
                      alt={
                        (currentLang === 'en' ? proizvod.naziv_en : proizvod.naziv_sr) || 'Proizvod'
                      }
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 96px"
                      quality={90}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">
                      {currentLang === 'en'
                        ? (proizvod.kategorija_en === 'bike' ? '🚴' : proizvod.kategorija_en === 'shoes' ? '👟' : '📦')
                        : (proizvod.kategorija_sr === 'bicikla' ? '🚴' : proizvod.kategorija_sr === 'patike' ? '👟' : '📦')}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-center mb-2 text-gray-800">
                {currentLang === 'en' ? proizvod.naziv_en : proizvod.naziv_sr}
              </h3>
              {(currentLang === 'en' ? proizvod.opis_en : proizvod.opis_sr) && (
                <p className="text-gray-600 text-center mb-3 text-sm">
                  {currentLang === 'en' ? proizvod.opis_en : proizvod.opis_sr}
                </p>
              )}
              {(currentLang === 'en' ? proizvod.karakteristike_en : proizvod.karakteristike_sr) && (
                <p className="text-gray-500 text-center mb-3 text-sm">
                  {currentLang === 'en' ? proizvod.karakteristike_en : proizvod.karakteristike_sr}
                </p>
              )}
              {(currentLang === 'en' ? proizvod.kategorija_en : proizvod.kategorija_sr) && (
                <p className="text-center mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {t('kategorija')}: {currentLang === 'en' ? proizvod.kategorija_en : proizvod.kategorija_sr}
                  </span>
                </p>
              )}
              <p className="text-center mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  {proizvod.cena} €
                </span>
              </p>
              {proizvod.kolicina !== undefined && (
                <p className="text-center mb-4 text-sm">
                  <span className={`px-2 py-1 rounded ${proizvod.kolicina === 0 ? 'bg-red-100 text-red-600 font-bold' : 'bg-gray-100 text-gray-500'}`}>
                    {t('kolicina')}: {proizvod.kolicina}
                  </span>
                </p>
              )}
              <div className="flex gap-2">
                <Link
                  href={`/proizvodi/${proizvod.id}`}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <FaEye />
                  {t('detalji')}
                </Link>
                <button
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={e => { e.stopPropagation(); handleDodajUKorpu(proizvod); }}
                  disabled={proizvod.kolicina === 0 || addingToCart === proizvod.id}
                >
                  {addingToCart === proizvod.id ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <FaCartPlus />
                  )}
                  {addingToCart === proizvod.id
                    ? 'Dodaje se...'
                    : proizvod.kolicina === 0
                      ? (t('nema_na_zalihama') || 'Nema na zalihama')
                      : (t('dodaj_u_korpu') || 'Dodaj u korpu')
                  }
                </button>
              </div>
            </div>
          );
        })}
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

// Cloudinary optimizacija URL-a
function getCloudinaryOptimizedUrl(url: string) {
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_400,h_400/');
}