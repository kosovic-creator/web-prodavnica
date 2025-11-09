/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Toaster, toast } from 'react-hot-toast';
import { FaCartPlus, FaArrowLeft } from 'react-icons/fa';
import OmiljeniButton from '@/components/OmiljeniButton';
import Link from 'next/link';
import Image from 'next/image';
import { dodajUKorpu, getKorpa } from '@/lib/actions';

export default function ProizvodClient({ proizvod, lang }: { proizvod: any, lang: string }) {
  const router = useRouter();
  const { data: session } = useSession();
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
        const result = await dodajUKorpu({ korisnikId, proizvodId: proizvod.id, kolicina: 1 });
        if (!result.success) {
          toast.error(result.error || 'Greška pri dodavanju u korpu');
          return;
        }
        const korpaResult = await getKorpa(korisnikId);
        if (korpaResult.success && korpaResult.data) {
          const broj = korpaResult.data.stavke.reduce((acc: number, s: { kolicina: number }) => acc + s.kolicina, 0);
          localStorage.setItem('brojUKorpi', broj.toString());
          window.dispatchEvent(new Event('korpaChanged'));
        }
        toast.success('Dodato u korpu');
      } catch {
        toast.error('Greška pri dodavanju u korpu');
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
          Nazad na proizvode
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
                      <div className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </Link>
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
                  {proizvod.kolicina === 0 ? 'Nema na zalihama' : `Količina: ${proizvod.kolicina}`}
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Opis:</h3>
                  <p className="text-gray-600">{opis}</p>
                </div>
                {karakteristike && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Karakteristike:</h3>
                    <p className="text-gray-600">{karakteristike}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Kategorija:</h3>
                  <p className="text-gray-600">{kategorija || 'Nema kategorije'}</p>
                </div>
              </div>
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
                    ? 'Nema na zalihama'
                    : 'Dodaj u korpu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}