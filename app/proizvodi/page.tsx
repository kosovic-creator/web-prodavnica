'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { Proizvod } from '@/types';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { FaBoxOpen, FaCartPlus, FaEye } from "react-icons/fa";
import '@/i18n/config';
import toast, { Toaster } from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSearch } from '@/components/SearchContext';
import Link from 'next/link';

function ProizvodiContent() {
  const { t } = useTranslation('proizvodi');
  const { data: session } = useSession();
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const { searchTerm } = useSearch(); // Dodaj ovo
  const searchParams = useSearchParams();
  const router = useRouter();
  const lang = searchParams?.get('lang') || 'sr';


  useEffect(() => {
    fetch(`/api/proizvod?lang=${lang}`, {
      cache: 'no-store'
    })
      .then(res => res.json())
      .then(data => {
        setProizvodi(Array.isArray(data) ? data : data.proizvodi || []);
        setTotal(data.total || (Array.isArray(data) ? data.length : 0));
      });
  }, [lang, page, pageSize]); // Dodaj lang kao dependency

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
    await fetch('/api/korpa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ korisnikId, proizvodId: proizvod.id, kolicina: 1 })
    });
    // Dohvati broj stavki iz korpe
    const res = await fetch(`/api/korpa?korisnikId=${korisnikId}`);
    const data = await res.json();
    const broj = data.stavke.reduce((acc: number, s: { kolicina: number }) => acc + s.kolicina, 0);
    localStorage.setItem('brojUKorpi', broj.toString());
    window.dispatchEvent(new Event('korpaChanged'));
  };

  // Filteriraj proizvode na osnovu search terma
  const filteredProizvodi = Array.isArray(proizvodi)
    ? proizvodi.filter(p =>
      searchTerm === '' ||
      p.naziv.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.opis ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kategorija.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const handleProizvodClick = (proizvodId: string) => {
    router.push(`/proizvodi/${proizvodId}?lang=${lang}`);
  };

  return (
    <div className="p-4">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaBoxOpen className="text-violet-600" />
        {t('proizvodi')}
      </h1>

      {/* Prikaži search info */}
      {searchTerm && (
        <div className="mb-4 p-3 bg-violet-100 border-l-4 border-violet-500 rounded">
          <p className="text-violet-700">
            Rezultati pretrage za: <strong>&quot;{searchTerm}&quot;</strong>
            <span className="ml-2 text-sm">({filteredProizvodi.length} proizvoda)</span>
          </p>
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredProizvodi.length === 0 ? (
          <div className="col-span-3 text-center text-gray-500 py-8">
            {searchTerm ? `Nema proizvoda za pretragu "${searchTerm}"` : t('empty')}
          </div>
        ) : (
          filteredProizvodi.map(p => (
            <div key={p.id} className="border rounded-lg p-4 flex flex-col items-center shadow hover:shadow-lg transition cursor-pointer" onClick={() => handleProizvodClick(p.id)}>
              {p.slika && <Image src={p.slika} alt={p.naziv} width={80} height={80} className="object-cover mb-2 rounded" />}
              <div className="font-semibold text-lg mb-1">{p.naziv}</div>
              <div className="text-gray-600 mb-1">{p.opis}</div>
              <div className="text-gray-600 mb-1">{p.karakteristike}</div>
              <div className="text-gray-600 mb-1">{t('kategorija')}: {p.kategorija}</div>
              <div className="mt-2 font-bold text-violet-700">{p.cena} €</div>
              <div className={`text-xs font-semibold mt-1 ${p.kolicina === 0 ? 'text-red-600' : 'text-gray-400'}`}>{t('kolicina')}: {p.kolicina}</div>
              {p.kolicina === 0 && (
                <div className="text-red-600 text-sm font-bold mb-2">{t('nema_na_zalihama')}</div>
              )}
              <div className="flex gap-2 mt-2 w-full">
                <Link
                  href={`/proizvodi/${p.id}?lang=${lang}`}
                  className="flex-1 bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <FaEye />
                  {t('detalji')}
                </Link>

                <button
                  className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700 transition"
                  onClick={e => { e.stopPropagation(); handleDodajUKorpu(p); }}
                >
                  <FaCartPlus />
                  {t('dodaj_u_korpu')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {total > 10 && (
        <div className="flex justify-center items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-200 text-gray-400' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
          >
            {t('prethodna')}
          </button>
          <span>
            {page} / {Math.ceil(total / pageSize)}
          </span>
          <button
            disabled={page >= Math.ceil(total / pageSize)}
            onClick={() => setPage(page + 1)}
            className={`px-3 py-1 rounded ${page >= Math.ceil(total / pageSize) ? 'bg-gray-200 text-gray-400' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
          >
            {t('sljedeca')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProizvodiPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Učitavanje proizvoda...</div>}>
      <ProizvodiContent />
    </Suspense>
  );
}