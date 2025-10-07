'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { Omiljeni } from '@/types';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { FaCartPlus, FaEye, FaHeart, FaMinus } from "react-icons/fa";
import '@/i18n/config';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

function OmiljeniContent() {
  const { t } = useTranslation('proizvodi');
  const { data: session } = useSession(); // Use session from useSession hook
  const [omiljeni, setOmiljeni] = useState<Omiljeni[]>([]);
  const [loading, setLoading] = useState(true); // Dodaj loading state
  const searchParams = useSearchParams();
  const lang = searchParams?.get('lang') || 'sr';
  const router = useRouter();

  function OmiljeniSkeleton() {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-6 py-1">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
          <div className="h-4 bg-gray-300 rounded w-2/3" />
        </div>
      </div>
    );
  }

  useEffect(() => {
    setLoading(true);
    fetch(`/api/omiljeni?lang=${lang}`, {
      cache: 'no-store'
    })
      .then(res => res.json())
      .then(data => {
        setOmiljeni(Array.isArray(data) ? data : data.omiljeni || []);
      })
      .finally(() => {
        setLoading(false); // Postavi loading na false kada se završi
      });
  }, [lang]);

  const handleProizvodClick = (proizvodId: string) => {
    router.push(`/proizvodi/${proizvodId}?lang=${lang}`);
  };

  const handleDodajUKorpu = async (omiljeni: Omiljeni) => {
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
    await fetch('/api/korpa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ korisnikId, proizvodId: omiljeni.proizvodId, kolicina: 1 })
    });
    const res = await fetch(`/api/korpa?korisnikId=${korisnikId}`);
    const data = await res.json();
    const broj = data.stavke.reduce((acc: number, s: { kolicina: number }) => acc + s.kolicina, 0);
    localStorage.setItem('brojUKorpi', broj.toString());
    window.dispatchEvent(new Event('korpaChanged'));
  };

  const handleUkloniOmiljeni = async (omiljeni: Omiljeni) => {
    const korisnikId = session?.user?.id;
    if (!korisnikId) {
      toast.error(
        <span>
          Morate biti prijavljeni za uklanjanje iz omiljenih!{' '}
          <a href="/auth/prijava" className="underline text-blue-600 ml-2">Prijavi se</a>
        </span>
      );
      return;
    }

    try {
      const response = await fetch(`/api/omiljeni/${omiljeni.proizvodId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setOmiljeni(prevOmiljeni => prevOmiljeni.filter(o => o.id !== omiljeni.id));
        toast.success('Artikal je uklonjen iz omiljenih.');
      } else {
        const errorData = await response.json();
        toast.error(`Greška: ${errorData.error || 'Neuspešno uklanjanje'}`);
      }
    } catch (error) {
      console.error('Error removing from omiljeni:', error);
      toast.error('Greška prilikom uklanjanja iz omiljenih.');
    }
  };

  return (
    loading ? (
      <div className="space-y-4">
        <OmiljeniSkeleton />
      </div>
    ) : (
      <> <Toaster position="top-center" />
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaHeart className="text-red-600" />
          {t('omiljeni_proizvodi')}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ml-4">
          {omiljeni.map(o => (
            <div
              key={o.id}
              className="bg-white border border-gray-200 rounded-lg flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer relative p-3 pl-4"
              onClick={() => handleProizvodClick(o.proizvodId)}
            >
              {/* Dugme je pozicionirano apsolutno u odnosu na parent div koji ima 'relative' */}
              <div className="absolute top-3 right-3 z-10">
              <button
                onClick={e => { e.stopPropagation(); handleUkloniOmiljeni(o); }}
                className="w-8 h-8 rounded-full bg-red-100 text-black hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center"
                title='Ukloni iz omiljenih'
              >
                <FaMinus />
              </button>
            </div>
              {o.proizvod.slika && (
                <div className="mb-3 flex justify-center">
                  <Image src={o.proizvod.slika} alt={'o.proizvod.prevodi.naziv'} width={100} height={100} className="object-cover rounded-md" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{o.proizvod.prevodi[0]?.naziv}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{o.proizvod.prevodi[0]?.opis}</p>
                <p className="text-gray-500 text-xs line-clamp-1">{o.proizvod.prevodi[0]?.karakteristike}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('kategorija')}: {o.proizvod.prevodi[0]?.kategorija}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-violet-700">{o.proizvod.cena} €</div>
                  <div className={`text-xs font-medium px-2 py-1 rounded ${o.proizvod.kolicina === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {t('kolicina')}: {o.proizvod.kolicina}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Link
                    href={`/proizvodi/${o.id}?lang=${lang}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <FaEye />
                    {t('detalji')}
                  </Link>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white px-3 py-2 rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={e => { e.stopPropagation(); handleDodajUKorpu(o); }}
                    disabled={o.proizvod.kolicina === 0}
                  >
                    <FaCartPlus />
                    {o.proizvod.kolicina === 0 ? (t('nema_na_zalihama') || 'Nema na zalihama') : (t('dodaj_u_korpu') || 'Dodai u korpu')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  );
}
export default function ProizvodiPage() {
  return (
    <Suspense fallback={<div className="o-4 text-center">Učitavanje omiljenih proizvoda...</div>}>
      <OmiljeniContent />
    </Suspense>
  );
}