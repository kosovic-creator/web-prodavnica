'use client';
import { useState, useEffect, useCallback } from 'react';
import { Porudzbina, StavkaPorudzbine } from '@/types';
import { useTranslation } from 'react-i18next';
import { FaClipboardList, FaUser, FaCalendarAlt, FaEuroSign, FaChevronDown, FaChevronUp, FaImage, FaBox } from "react-icons/fa";
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import '@/i18n/config';

interface PorudzbinaWithStavke extends Porudzbina {
  stavkePorudzbine?: StavkaPorudzbine[];
}

// Skeleton komponenta za porudžbine
function OrdersSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4 lg:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="w-40 h-8 bg-gray-200 rounded"></div>
          </div>
          <div className="w-80 h-5 bg-gray-200 rounded"></div>
        </div>

        {/* Orders skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-2">
                      <div className="w-32 h-6 bg-gray-200 rounded"></div>
                      <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end">
                    <div className="w-28 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MojePorudzbinePage() {
  const { t } = useTranslation('porudzbine');
  const { data: session } = useSession();
  const [porudzbine, setPorudzbine] = useState<PorudzbinaWithStavke[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchMojePorudzbine = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/porudzbine?page=${page}&pageSize=${pageSize}&korisnikId=${session?.user?.id}`);
      const data = await res.json();

      if (res.ok) {
        setPorudzbine(data.porudzbine || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Greška pri dohvatanju porudžbina:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMojePorudzbine();
    }
  }, [session?.user?.id, fetchMojePorudzbine]);

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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

  if (!session?.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <FaUser className="mx-auto text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('must_login')}</h2>
          <p className="text-gray-500 mb-6">{t('pregledajte_istoriju')}</p>
          <Link
            href="/auth/prijava"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {t('login')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <OrdersSkeleton />;
  }

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
                          {porudzbina.status}
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

                    <div className="flex items-center justify-between sm:justify-end">
                      <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition font-medium">
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
                                      {stavka.proizvod?.naziv || t('naziv_proizvoda')}
                                    </h5>
                                    {stavka.opis && (
                                      <p className="text-sm text-gray-600 mt-1">{stavka.opis}</p>
                                    )}
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
                onClick={() => setPage(page - 1)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  page === 1
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
                onClick={() => setPage(page + 1)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  page >= Math.ceil(total / pageSize)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {t('sledeca')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
