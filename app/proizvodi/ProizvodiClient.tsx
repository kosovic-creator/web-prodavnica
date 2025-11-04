'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { ProizvodServerAction } from '@/types';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { FaBoxOpen, FaCartPlus, FaEye } from "react-icons/fa";
import '@/i18n/config';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/components/SearchContext';
import Link from 'next/link';
import OmiljeniButton from '@/components/OmiljeniButton';
import { dodajUKorpu, getKorpa } from '@/lib/actions';

interface ProizvodiClientProps {
  initialProizvodi: ProizvodServerAction[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
  lang: string;
}

export default function ProizvodiClient({
  initialProizvodi,
  initialTotal,
  initialPage,
  pageSize,
  lang
}: ProizvodiClientProps) {
  const { t } = useTranslation('proizvodi');
  const { data: session } = useSession();
  const [page, setPage] = useState(initialPage);
  const [isPending, startTransition] = useTransition();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { searchTerm } = useSearch();
  const router = useRouter();

  // Filtriranje proizvoda na osnovu pretrage
  const filteredProizvodi = Array.isArray(initialProizvodi)
    ? initialProizvodi.filter(p => {
        const naziv = lang === 'en' ? p.naziv_en : p.naziv_sr;
        const opis = lang === 'en' ? p.opis_en : p.opis_sr;
        const kategorija = lang === 'en' ? p.kategorija_en : p.kategorija_sr;
        return (
          searchTerm === '' ||
          (naziv ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (opis ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (kategorija ?? '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  const handleDodajUKorpu = async (proizvod: ProizvodServerAction) => {
    const korisnikId = session?.user?.id;
    if (!korisnikId) {
      toast.error(t('morate_biti_prijavljeni_za_korpu'), { duration: 4000 });
      router.push('/auth/prijava');
      return;
    }

    // Sprečava duplo klikanje
    if (addingToCart === proizvod.id) return;

    setAddingToCart(proizvod.id);

    startTransition(async () => {
      try {
        // Dodaj u korpu koristeći Server Action
        const result = await dodajUKorpu({
          korisnikId,
          proizvodId: proizvod.id,
          kolicina: 1
        });

        if (!result.success) {
          toast.error(result.error || 'Greška pri dodavanju u korpu', { duration: 4000 });
          return;
        }

        // Ažuriraj broj stavki u korpi koristeći Server Action
        const korpaResult = await getKorpa(korisnikId);

        if (korpaResult.success && korpaResult.data) {
          const broj = korpaResult.data.stavke.reduce((acc: number, s: { kolicina: number }) => acc + s.kolicina, 0);
          localStorage.setItem('brojUKorpi', broj.toString());
          window.dispatchEvent(new Event('korpaChanged'));
        }

        // Prikaži success toast
        toast.success(t('proizvod_dodat_u_korpu'), { duration: 4000 });
      } catch (error) {
        console.error('Greška:', error);
        toast.error('Došlo je do greške pri dodavanju u korpu', { duration: 4000 });
      } finally {
        setAddingToCart(null);
      }
    });
  };

  const handleProizvodClick = (proizvodId: string) => {
    router.push(`/proizvodi/${proizvodId}?lang=${lang}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/proizvodi?page=${newPage}&pageSize=${pageSize}&lang=${lang}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Toaster position="top-center" />
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaBoxOpen className="text-blue-600" />
          {t('artikli')}
        </h1>

        {/* Search results info */}
        {searchTerm && (
          <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 rounded-lg">
            <p className="text-blue-700 text-sm md:text-base">
              {t("rezultati_pretrage_za")}: <strong>&quot;{searchTerm}&quot;</strong>
              <span className="ml-2 text-xs md:text-sm">({filteredProizvodi.length} {t("artikli")})</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProizvodi.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              <FaBoxOpen className="text-4xl mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                {searchTerm ? `Nema proizvoda za pretragu "${searchTerm}"` : t('empty')}
              </p>
            </div>
          ) : (
            filteredProizvodi.map(p => {
              const naziv = lang === 'en' ? p.naziv_en : p.naziv_sr;
              const opis = lang === 'en' ? p.opis_en : p.opis_sr;
              const karakteristike = lang === 'en' ? p.karakteristike_en : p.karakteristike_sr;
              const kategorija = lang === 'en' ? p.kategorija_en : p.kategorija_sr;

              return (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                  onClick={() => handleProizvodClick(p.id)}
                >
                  {/* Omiljeni dugme u gornjem desnom uglu */}
                  <div className="absolute top-3 right-3 z-10">
                    <OmiljeniButton proizvodId={p.id} />
                  </div>

                  {p.slika && (
                    <div className="mb-3 flex justify-center">
                      <Image
                        src={p.slika}
                        alt={naziv ?? ''}
                        width={100}
                        height={100}
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{naziv}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{opis}</p>
                    <p className="text-gray-500 text-xs line-clamp-1">{karakteristike}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {t('kategorija')}: {kategorija ? kategorija : t('nema_kategorije') || 'Nema kategorije'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-blue-700">{p.cena} €</div>
                      <div className={`text-xs font-medium px-2 py-1 rounded ${
                        p.kolicina === 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {t('kolicina')}: {p.kolicina}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Link
                      href={`/proizvodi/${p.id}?lang=${lang}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <FaEye />
                      {t('detalji')}
                    </Link>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={e => {
                        e.stopPropagation();
                        handleDodajUKorpu(p);
                      }}
                      disabled={p.kolicina === 0 || addingToCart === p.id || isPending}
                    >
                      {addingToCart === p.id ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <FaCartPlus />
                      )}
                      {addingToCart === p.id
                        ? 'Dodaje se...'
                        : p.kolicina === 0
                          ? (t('nema_na_zalihama') || 'Nema na zalihama')
                          : (t('dodaj_u_korpu') || 'Dodaj u korpu')
                      }
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {initialTotal > pageSize && (
          <div className="mt-8 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-center items-center gap-3">
              <button
                disabled={page === 1 || isPending}
                onClick={() => handlePageChange(page - 1)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === 1 || isPending
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {t('prethodna')}
              </button>
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                <span className="hidden sm:inline">{page} od {Math.ceil(initialTotal / pageSize)}</span>
                <span className="sm:hidden">{page}/{Math.ceil(initialTotal / pageSize)}</span>
              </div>
              <button
                disabled={page >= Math.ceil(initialTotal / pageSize) || isPending}
                onClick={() => handlePageChange(page + 1)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page >= Math.ceil(initialTotal / pageSize) || isPending
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {t('sljedeca')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}