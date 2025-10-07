/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { Proizvod } from '@/types';
import { FaCartPlus, FaArrowLeft } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import '@/i18n/config';
import OmiljeniButton from '@/components/OmiljeniButton';

export default function ProizvodPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { t } = useTranslation('proizvodi');
  const lang = searchParams?.get('lang') || 'sr';

  const id = params && typeof params.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : undefined;
  const [proizvod, setProizvod] = useState<Proizvod | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProizvod() {
      setLoading(true);
      const res = await fetch(`/api/proizvodi/${id}`);
      const data = await res.json();
      setProizvod(data.error ? null : data);
      setLoading(false);
    }
    if (id) fetchProizvod();
  }, [id]);

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
    } catch (error) {
      toast.error('Greška pri dodavanju u korpu.');
    }
  };

  const handleNazad = () => {
    router.push(`/proizvodi?lang=${lang}`);
  };



  if (loading) return <div className="p-4 text-center">Učitavanje proizvoda...</div>;
  if (!proizvod) return <div className="p-4 text-red-600 text-center">Proizvod nije pronađen.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto p-4">
        {/* Dugme za nazad */}
        <button
          onClick={handleNazad}
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-700 transition"
        >
          <FaArrowLeft />
          {t('nazad') || 'Nazad na proizvode'}
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
          {/* Omiljeni dugme u gornjem desnom uglu */}
          <div className="absolute top-3 right-3 z-10">
            <OmiljeniButton proizvodId={proizvod.id} />
          </div>
          <div className="md:flex">
            {/* Slika proizvoda */}
            <div className="md:w-1/2 p-8">
              {proizvod.slika ? (
                <Image
                  src={proizvod.slika}
                  alt={proizvod.naziv || 'Slika proizvoda'}
                  width={500}
                  height={400}
                  className="w-full h-auto object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Nema slike</span>
                </div>
              )}
            </div>

            {/* Detalji proizvoda */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{proizvod.naziv}</h1>

              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-700 mb-2">{proizvod.cena} €</div>
                <div className={`text-sm font-semibold ${proizvod.kolicina === 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {proizvod.kolicina === 0 ? t('nema_na_zalihama') : `${t('kolicina')}: ${proizvod.kolicina}`}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('opis') || 'Opis'}:</h3>
                  <p className="text-gray-600">{proizvod.opis}</p>
                </div>

                {proizvod.karakteristike && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('karakteristike') || 'Karakteristike'}:</h3>
                    <p className="text-gray-600">{proizvod.karakteristike}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('kategorija') || 'Kategorija'}:</h3>
                  <p className="text-gray-600">{proizvod.kategorija}</p>
                </div>
              </div>

              {/* Dugme za dodavanje u korpu */}
              <button
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${proizvod.kolicina === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
                onClick={() => handleDodajUKorpu(proizvod)}
                disabled={proizvod.kolicina === 0}
              >
                <FaCartPlus />
                {proizvod.kolicina === 0 ? (t('nema_na_zalihama') || 'Nema na zalihama') : (t('dodaj_u_korpu') || 'Dodaj u korpu')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
