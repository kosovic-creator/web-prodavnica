/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { Omiljeni } from '@/types';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import {  FaEye,FaHeart } from "react-icons/fa";
import '@/i18n/config';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';


function OmiljeniContent() {
  const { t } = useTranslation('proizvodi');
  const [omiljeni, setOmiljeni] = useState<Omiljeni[]>([]);
  const [loading, setLoading] = useState(true); // Dodaj loading state
  const searchParams = useSearchParams();
  const lang = searchParams?.get('lang') || 'sr';

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

  // const handleDodajUKorpu = async (omiljeni: Omiljeni) => {
  //   const korisnikId = session?.user?.id;
  //   if (!korisnikId) {
  //     toast.error(
  //       <span>
  //         Morate biti prijavljeni za dodavanje u korpu!{' '}
  //         <a href="/auth/prijava" className="underline text-blue-600 ml-2">Prijavi se</a>
  //       </span>
  //     );
  //     return;
  //   }
    // await fetch('/api/korpa', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ korisnikId, proizvodId: proizvod.id, kolicina: 1 })
    // });
  //   const res = await fetch(`/api/korpa?korisnikId=${korisnikId}`);
  //   const data = await res.json();
  //   const broj = data.stavke.reduce((acc: number, s: { kolicina: number }) => acc + s.kolicina, 0);
  //   localStorage.setItem('brojUKorpi', broj.toString());
  //   window.dispatchEvent(new Event('korpaChanged'));
  // };


  // const handleProizvodClick = (proizvodId: string) => {
  //   router.push(`/proizvodi/${proizvodId}?lang=${lang}`);
  // };

return (
  <>
    <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
      <FaHeart className="text-violet-600" />
      {t('omiljeni_proizvodi')}
    </h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {omiljeni.map(p => (
        <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer relative" /* onClick={() => handleProizvodClick(p.id)} */>
          {p.proizvod.slika && (
            <div className="mb-3 flex justify-center">
              <Image src={p.proizvod.slika} alt={'p.proizvod.prevodi.naziv'} width={100} height={100} className="object-cover rounded-md" />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{p.proizvod.cena}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{p.proizvod.kolicina}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Link
              href={`/proizvodi/${p.id}?lang=${lang}`}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <FaEye />
              {t('detalji')}
            </Link>
          </div>
        </div>
      ))}
    </div>
  </>
);
}
export default function ProizvodiPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Učitavanje omiljenih proizvoda...</div>}>
      <OmiljeniContent />
    </Suspense>
  );
}