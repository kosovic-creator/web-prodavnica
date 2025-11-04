/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useTransition, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FaClipboardList, FaCalendarAlt, FaEuroSign, FaChevronDown, FaChevronUp, FaImage, FaBox } from "react-icons/fa";
import Image from 'next/image';
import Link from 'next/link';
import '@/i18n/config';
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { deletePorudzbinu } from '@/lib/actions';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';

interface StavkaPorudzbine {
  id: string;
  kolicina: number;
  cena: number;
  slika?: string | null;
  proizvod?: {
    naziv_sr: string;
    naziv_en: string;
  } | null;
}

interface PorudzbinaWithStavke {
  id: string;
  ukupno: number;
  status: string;
  kreiran: Date;
  stavkePorudzbine?: StavkaPorudzbine[];
}

interface MojePorudzbineClientProps {
  initialPorudzbine: PorudzbinaWithStavke[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
  lang: string;
  session: Session;
}

export default function MojePorudzbineClient({
  initialPorudzbine,
  initialTotal,
  initialPage,
  pageSize,
  lang,
}: MojePorudzbineClientProps) {
  const { t } = useTranslation('porudzbine');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [porudzbine, setPorudzbine] = useState<PorudzbinaWithStavke[]>(initialPorudzbine);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    porudzbinaId: '',
    porudzbinaNaziv: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshPage = useCallback(() => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', page.toString());
    searchParams.set('pageSize', pageSize.toString());
    if (lang !== 'sr') searchParams.set('lang', lang);

    router.push(`/moje-porudzbine?${searchParams.toString()}`);
  }, [page, pageSize, lang, router]);

  const changePage = (newPage: number) => {
    setPage(newPage);
    const searchParams = new URLSearchParams();
    searchParams.set('page', newPage.toString());
    searchParams.set('pageSize', pageSize.toString());
    if (lang !== 'sr') searchParams.set('lang', lang);

    router.push(`/moje-porudzbine?${searchParams.toString()}`);
  };

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const openDeleteModal = (id: string, naziv: string) => {
    setDeleteModal({
      isOpen: true,
      porudzbinaId: id,
      porudzbinaNaziv: naziv
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      porudzbinaId: '',
      porudzbinaNaziv: ''
    });
  };

  const handleDeletePorudzbina = async () => {
    setIsDeleting(true);

    startTransition(async () => {
      try {
        const result = await deletePorudzbinu(deleteModal.porudzbinaId);

        if (!result.success) {
          toast.error(result.error || t('greska_pri_brisanju') || 'Greška pri brisanju porudžbine');
          return;
        }

        toast.success('Porudžbina je uspešno obrisana!');
        closeDeleteModal();
        refreshPage(); // Refresh the current page
      } catch (error) {
        console.error('Error deleting porudzbina:', error);
        toast.error(t('greska_pri_brisanju') || 'Došlo je do greške prilikom brisanja porudžbine');
      } finally {
        setIsDeleting(false);
      }
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'završeno':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'na čekanju':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'otkazano':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocalizedStatus = (status: string) => t(status.toLowerCase());

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4 lg:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FaClipboardList className="text-2xl text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('moje_porudzbine')}</h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            {t('pregledajte_istoriju')}
          </p>
        </div>

        {/* Orders List */}
        {porudzbine.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FaBox className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('nemate_porudzbine')}</h3>
            <p className="text-gray-500 mb-6">{t('prva_kupovina')}</p>
            <Link
              href="/proizvodi"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {t('pocnite_kupovinu')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {porudzbine.map((porudzbina) => (
              <div key={porudzbina.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div
                  className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => toggleExpandOrder(porudzbina.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {t('porudzbina')} #{porudzbina.id.slice(-8)}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(porudzbina.status)}`}>
                          {getLocalizedStatus(porudzbina.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-blue-600" />
                          <span>{formatDate(porudzbina.kreiran)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaEuroSign className="text-blue-600" />
                          <span className="font-semibold">{porudzbina.ukupno.toFixed(2)} €</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaBox className="text-blue-600" />
                          <span>{porudzbina.stavkePorudzbine?.length || 0} {t('artikala')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandOrder(porudzbina.id);
                        }}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition font-medium"
                      >
                        {expandedOrder === porudzbina.id ? (
                          <>
                            <span className="text-sm">{t('sakrij_detalje')}</span>
                            <FaChevronUp />
                          </>
                        ) : (
                          <>
                            <span className="text-sm">{t('prikazi_detalje')}</span>
                            <FaChevronDown />
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(
                            porudzbina.id,
                            `#${porudzbina.id.slice(0, 8)}... (${porudzbina.ukupno.toFixed(2)} €)`
                          );
                        }}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 transition font-medium"
                        title={t('obrisi_porudzbinu') || 'Obriši porudžbinu'}
                        disabled={isPending}
                      >
                        <span className="text-sm">{t('obrisi_porudzbinu') || 'Obriši'}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Details - Expanded */}
                {expandedOrder === porudzbina.id && (
                  <div className="border-t bg-gray-50 p-4 sm:p-6">
                    <h4 className="font-semibold text-gray-800 mb-4">{t('stavke_porudzbine')}:</h4>

                    {porudzbina.stavkePorudzbine && porudzbina.stavkePorudzbine.length > 0 ? (
                      <div className="space-y-3">
                        {porudzbina.stavkePorudzbine.map((stavka) => (
                          <div key={stavka.id} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex gap-4">
                              {/* Product Image */}
                              <div className="flex-shrink-0">
                                {stavka.slika ? (
                                  <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                                    <Image
                                      src={stavka.slika}
                                      alt="Slika proizvoda"
                                      fill
                                      className="object-cover rounded-lg"
                                      sizes="(max-width: 640px) 64px, 80px"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <FaImage className="text-gray-400 text-xl" />
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-800 truncate">
                                      {lang === 'en' ? stavka.proizvod?.naziv_en : stavka.proizvod?.naziv_sr || t('naziv_proizvoda')}
                                    </h5>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {lang === 'en'
                                        ? `Purchased ${formatDate(porudzbina.kreiran)}`
                                        : `Kupljeno ${formatDate(porudzbina.kreiran)}`
                                      }
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">
                                      {stavka.kolicina} x {stavka.cena.toFixed(2)} €
                                    </div>
                                    <div className="font-semibold text-gray-800">
                                      {(stavka.kolicina * stavka.cena).toFixed(2)} €
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">{t('nema_dostupnih_stavki')}</p>
                    )}

                    {/* Order Total */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">{t('ukupno')}:</span>
                        <span className="text-xl font-bold text-blue-600">{porudzbina.ukupno.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
            <div className="flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
                className={`px-4 py-2 rounded-lg font-medium transition ${page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {t('prethodna')}
              </button>

              <span className="text-gray-600">
                {t('stranica')} {page} {t('od')} {Math.ceil(total / pageSize)}
              </span>

              <button
                disabled={page >= Math.ceil(total / pageSize)}
                onClick={() => changePage(page + 1)}
                className={`px-4 py-2 rounded-lg font-medium transition ${page >= Math.ceil(total / pageSize)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {t('sledeca')}
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeletePorudzbina}
          title={t('potvrda_brisanja') || 'Potvrda brisanja'}
          message={`${t('potvrda_brisanja_porudzbine') || 'Da li ste sigurni da želite da obrišete porudžbinu'} "${deleteModal.porudzbinaNaziv}"? ${t('akcija_se_ne_moze_ponistiti') || 'Ova akcija se ne može poništiti.'}`}
          confirmText={t('obrisi') || 'Obriši'}
          cancelText={t('otkazi') || 'Otkaži'}
          isDestructive={true}
          isLoading={isDeleting || isPending}
        />
      </div>
    </div>
  );
}