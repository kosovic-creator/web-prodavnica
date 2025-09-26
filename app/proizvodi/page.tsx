'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Proizvod } from '@/types';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { FaBoxOpen, FaCartPlus, FaSearch, FaTimes } from "react-icons/fa";
import '@/i18n/config';
import toast, { Toaster } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';



export default function ProizvodiPage() {
  const { t } = useTranslation('proizvodi');
  const { data: session } = useSession();
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedProizvod, setSelectedProizvod] = useState<Proizvod | null>(null);
  const searchParams = useSearchParams();
  const lang = searchParams?.get('lang') || 'sr';


  useEffect(() => {
    // Fetch podataka iz baze na osnovu jezika
    fetch(`/api/proizvodi?lang=${lang}`)
      .then(res => res.json())
      .then(setProizvodi);
  }, [lang]);

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

  // Filterirani proizvodi po imenu
  const filteredProizvodi = Array.isArray(proizvodi)
    ? proizvodi.filter(p => p.naziv.toLowerCase().includes(search.toLowerCase()))
    : [];


  return (
    <div className="p-4">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaBoxOpen className="text-violet-600" />
        {t('proizvodi')}
      </h1>
      <div className="mb-6 flex items-center gap-2 max-w-md">
        <div className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('pronadji_artikal') }
            className="w-full border border-violet-300 rounded-lg p-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 text-lg" />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 focus:outline-none"
              aria-label="Clear search"
            >
              <FaTimes className="text-lg" />
            </button>
          )}
        </div>
      </div>
      {selectedProizvod ? (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          {selectedProizvod.slika && <Image src={selectedProizvod.slika} alt={selectedProizvod.naziv} width={120} height={120} className="object-cover mb-4 rounded" />}
          <div className="font-bold text-xl mb-2">{selectedProizvod.naziv}</div>
          <div className="text-gray-600 mb-2">{selectedProizvod.opis}</div>
          <div className="text-gray-600 mb-2">{selectedProizvod.karakteristike}</div>
          <div className="text-gray-600 mb-2">Kategorija: {selectedProizvod.kategorija}</div>
          <div className="font-bold text-violet-700 mb-2">{selectedProizvod.cena} €</div>
          <div className={`text-xs font-semibold mb-2 ${selectedProizvod.kolicina === 0 ? 'text-red-600' : 'text-gray-400'}`}>{t('kolicina')}: {selectedProizvod.kolicina}</div>
          {selectedProizvod.kolicina === 0 && (
            <div className="text-red-600 text-sm font-bold mb-2">Nema na zalihama</div>
          )}
          <button
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700 transition mb-2"
            onClick={() => handleDodajUKorpu(selectedProizvod)}
          >
            <FaCartPlus />
            {t('dodaj_u_korpu')}
          </button>
          <button
            className="text-violet-600 underline mt-2"
            onClick={() => setSelectedProizvod(null)}
          >
            {t('nazad') || 'Nazad'}
          </button>
        </div>
      ) : (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredProizvodi.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500">{t('empty')}</div>
            ) : (
                filteredProizvodi.map(p => (
                  <div key={p.id} className="border rounded-lg p-4 flex flex-col items-center shadow hover:shadow-lg transition cursor-pointer" onClick={() => setSelectedProizvod(p)}>
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
                    <button
                      className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700 transition mt-2"
                      onClick={e => { e.stopPropagation(); handleDodajUKorpu(p); }}
                    >
                      <FaCartPlus />
                      {t('dodaj_u_korpu')}
                    </button>
                  </div>
                ))
            )}
          </div>
      )}
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



