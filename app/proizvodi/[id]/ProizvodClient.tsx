'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { ProizvodServerAction } from '@/types';
import { FaCartPlus, FaArrowLeft } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import '@/i18n/config';
import OmiljeniButton from '@/components/OmiljeniButton';
import { dodajUKorpu, getKorpa } from '@/lib/actions';

interface ProizvodClientProps {
  proizvod: ProizvodServerAction;
  lang: string;
}

export default function ProizvodClient({ proizvod, lang }: ProizvodClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation('proizvodi');
  const [isPending, startTransition] = useTransition();
  const [addingToCart, setAddingToCart] = useState(false);

  const naziv = lang === 'en' ? proizvod.naziv_en : proizvod.naziv_sr;
  const opis = lang === 'en' ? proizvod.opis_en : proizvod.opis_sr;
  const karakteristike = lang === 'en' ? proizvod.karakteristike_en : proizvod.karakteristike_sr;
  const kategorija = lang === 'en' ? proizvod.kategorija_en : proizvod.kategorija_sr;

  const handleDodajUKorpu = async () => {
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

    if (addingToCart) return;

    setAddingToCart(true);

    startTransition(async () => {
      try {
        // Dodaj u korpu koristeći Server Action
        const result = await dodajUKorpu({
          korisnikId,
          proizvodId: proizvod.id,
          kolicina: 1
        });

        if (!result.success) {
          toast.error(result.error || t('greska_pri_dodavanju_u_korpu'));
          return;
        }

        // Ažuriraj broj stavki u korpi koristeći Server Action
        const korpaResult = await getKorpa(korisnikId);

        if (korpaResult.success && korpaResult.data) {
          const broj = korpaResult.data.stavke.reduce((acc: number, s: { kolicina: number }) => acc + s.kolicina, 0);
          localStorage.setItem('brojUKorpi', broj.toString());
          window.dispatchEvent(new Event('korpaChanged'));
        }

        toast.success(t('dodato_u_korpu'));
      } catch (error) {
        console.error('Greška:', error);
        toast.error(t('greska_pri_dodavanju_u_korpu'));
      } finally {
        setAddingToCart(false);
      }
    });
  };

  const handleNazad = () => {
    router.push(`/proizvodi?lang=${lang}`);
  };



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
                <div>
                  <Link href={`/proizvodi/slika/${proizvod.id}`} className="block">
                    <div className="relative group cursor-pointer">
                      <Image
                        src={proizvod.slika}
                        alt={naziv || 'Slika proizvoda'}
                        width={500}
                        height={400}
                        className="w-full h-auto object-cover rounded-lg shadow-md border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                        unoptimized
                        priority
                      />
                      {/* Jednostavan hover efekat samo sa ikonom */}
                      <div className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                  {/* Mala ikonica ispod slike */}
                  <Link href={`/proizvodi/slika/${proizvod.id}`}>
                    <div className="flex items-center justify-center mt-3 text-blue-600 text-sm bg-blue-50 border border-blue-200 rounded-lg py-2 px-3 hover:bg-blue-100 transition-colors cursor-pointer">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="font-medium">Kliknite za povećanje slike</span>
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Nema slike</span>
                </div>
              )}
            </div>

            {/* Detalji proizvoda */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{naziv}</h1>

              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-700 mb-2">{proizvod.cena} €</div>
                <div className={`text-sm font-semibold ${proizvod.kolicina === 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {proizvod.kolicina === 0 ? t('nema_na_zalihama') : `${t('kolicina')}: ${proizvod.kolicina}`}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('opis') || 'Opis'}:</h3>
                  <p className="text-gray-600">{opis}</p>
                </div>

                {karakteristike && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('karakteristike') || 'Karakteristike'}:</h3>
                    <p className="text-gray-600">{karakteristike}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('kategorija') || 'Kategorija'}:</h3>
                  <p className="text-gray-600">{kategorija || t('nema_kategorije') || 'Nema kategorije'}</p>
                </div>
              </div>

              {/* Dugme za dodavanje u korpu */}
              <button
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  proizvod.kolicina === 0 || addingToCart || isPending
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
                onClick={handleDodajUKorpu}
                disabled={proizvod.kolicina === 0 || addingToCart || isPending}
              >
                {addingToCart ? (
                  <div className="animate-spin w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full" />
                ) : (
                  <FaCartPlus />
                )}
                {addingToCart
                  ? 'Dodaje se...'
                  : proizvod.kolicina === 0
                    ? (t('nema_na_zalihama') || 'Nema na zalihama')
                    : (t('dodaj_u_korpu') || 'Dodaj u korpu')
                }
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}