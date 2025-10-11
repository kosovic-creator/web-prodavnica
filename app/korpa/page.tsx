'use client';
import { useSession } from 'next-auth/react';

import React, { useState, useEffect } from 'react';
import { StavkaKorpe } from '../../types';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PaymentSelector from '@/components/PaymentSelector';
import { useKorpa } from "@/components/KorpaContext";
import { FaShoppingCart, FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';




export default function KorpaPage() {
  const { t } = useTranslation('korpa');
  const { data: session } = useSession();
  const [stavke, setStavke] = useState<StavkaKorpe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { resetKorpa } = useKorpa();


  useEffect(() => {
    fetchKorpa();
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle toast message and redirect for unauthenticated users
  useEffect(() => {
    if (!loading && session === null) {
      toast.error(t('must_login') || "Morate biti prijavljeni da vidite korpu.", { duration: 3000 });
      const timeoutId = setTimeout(() => {
        router.push('/auth/prijava');
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [session, loading, router, t]);

  const fetchKorpa = async () => {
    setLoading(true);
    const korisnikId = session?.user?.id;
    if (!korisnikId) return setLoading(false);
    const res = await fetch(`/api/korpa?korisnikId=${korisnikId}`);
    const data = await res.json();
    setStavke(data.stavke);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchKorpa();
    setIsRefreshing(false);
  };

  const handleKolicina = async (id: string, kolicina: number) => {
    try {


      await fetch('/api/korpa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, kolicina })
      });

      const korisnikId = session?.user?.id;
      if (!korisnikId) return;

      const res = await fetch(`/api/korpa?korisnikId=${korisnikId}`);
      const data = await res.json();
      setStavke(data.stavke);

      // Ažuriraj broj u navbar-u
      const broj = data.stavke.reduce((acc: number, s: StavkaKorpe) => acc + s.kolicina, 0);
      localStorage.setItem('brojUKorpi', broj.toString());
      window.dispatchEvent(new Event('korpaChanged'));
    } catch (error) {
      console.error('Greška pri promeni količine:', error);
    }
  }; const handleDelete = async (id: string) => {
    try {


      await fetch('/api/korpa', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const korisnikId = session?.user?.id;
      if (!korisnikId) return;
      const res = await fetch(`/api/korpa?korisnikId=${korisnikId}`);
      const data = await res.json();
      setStavke(data.stavke);

      // Ažuriraj broj u navbar-u
      const broj = data.stavke.reduce((acc: number, s: StavkaKorpe) => acc + s.kolicina, 0);
      localStorage.setItem('brojUKorpi', broj.toString());
      window.dispatchEvent(new Event('korpaChanged'));
      toast.success(t('artikal_izbrisan'), { duration: 3000 });
    } catch (error) {
      console.error('Greška pri brisanju stavke:', error);
      toast.error(t('error'), { duration: 3000 });
    }
  };

  const isprazniKorpu = async () => {
    const korisnikId = session?.user?.id;
    if (!korisnikId) return;

    try {
      const response = await fetch('/api/korpa/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ korisnikId }),
      });

      if (response.ok) {
        setStavke([]);
        resetKorpa();
        localStorage.setItem('brojUKorpi', '0');
        window.dispatchEvent(new Event('korpaChanged'));
        console.log('Korpa je uspešno obrisana');
        toast.success(t('cart_emptied'), { duration: 3000 });
      } else {
        console.error('Greška pri brisanju korpe');
      }
    } catch (error) {
      console.error('Greška pri brisanju korpe:', error);
      toast.error(t('error'), { duration: 3000 });
    }
  };

  const potvrdiPorudzbinu = async () => {
    try {
      const response = await fetch('/api/porudzbine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          korisnikId: session?.user?.id,
          ukupno: stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0),
          status: 'Na čekanju',
          email: session?.user?.email,
          idPlacanja: crypto.randomUUID(),
          stavke: stavke.map(s => ({ proizvodId: s.proizvod?.id, kolicina: s.kolicina })),
        }),
      });
      if (response.ok) {
        toast.success(t('artikal_dod'), { duration: 3000 });
        await isprazniKorpu();

        return true;
      } else {
        toast.error(t('error'), { duration: 3000 });
        return false;
      }
    } catch {
      toast.error(t('error'), { duration: 3000 });
      return false;
    }
  };

  const handleZavrsiKupovinu = async () => {
    const success = await potvrdiPorudzbinu();
    if (success) {
      router.push('/proizvodi');
    }
  };

  if (loading) return <div className="p-4">{t('loading') || "Učitavanje..."}</div>;

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">{t('preusmjeravanje') || "Preusmjeravamo vas na stranicu za prijavu..."}</p>
      </div>
    );
  }
  if (!stavke.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="text-gray-300 mb-4">
          <FaShoppingCart size={80} />
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('prazna_korpa') || 'Vaša korpa je prazna'}</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          {t('nema_proizvoda') || 'Trenutno nemate proizvoda u korpi. Dodajte nešto iz naše ponude!'}
        </p>
        <button
          onClick={() => router.push('/proizvodi')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaShoppingCart />
          {t('nastavi_kupovinu') || 'Nastavite kupovinu'}
        </button>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-2 sm:p-4 flex flex-col lg:flex-row gap-4 lg:gap-8 min-h-screen cart-container">
        <div className="flex-1 cart-mobile-container">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <FaShoppingCart className="text-blue-600" />
              {t('naslov')}
            </h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
              aria-label="Refresh cart"
            >
              <div className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}>
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded shadow p-4 mb-4">
            <table className="w-full mb-2 border border-blue-200 rounded-lg shadow-md text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 lg:px-8 py-3 text-left align-middle">{t('proizvod')}</th>
                  <th className="px-4 lg:px-8 py-3 text-left align-middle">{t('kolicina')}</th>
                  <th className="px-4 lg:px-8 py-3 text-left align-middle">{t('cena')}</th>
                  <th className="px-4 lg:px-8 py-3 text-left align-middle">{t('akcije')}</th>
                </tr>
              </thead>
              <tbody>
                {stavke.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="px-4 lg:px-8 py-3 text-left align-middle flex items-center gap-2">
                      {s.proizvod?.slika && (
                        <Image src={s.proizvod.slika} alt={s.proizvod.naziv_sr || ''} width={48} height={48} className="object-contain rounded" />
                      )}
                      <span className="font-semibold">{s.proizvod?.naziv_sr}</span>
                    </td>
                    <td className="px-4 lg:px-8 py-3 text-left align-middle">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-2 border rounded hover:bg-gray-100 active:bg-gray-200 transition-colors cart-btn"
                          onClick={() => handleKolicina(s.id, s.kolicina - 1)}
                          disabled={s.kolicina <= 1}
                          aria-label="Smanji količinu"
                        >
                          <FaMinus />
                        </button>
                        <span className="px-3 font-medium">{s.kolicina}</span>
                        <button
                          className="px-3 py-2 border rounded hover:bg-gray-100 active:bg-gray-200 transition-colors cart-btn"
                          onClick={() => handleKolicina(s.id, s.kolicina + 1)}
                          aria-label="Povećaj količinu"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 lg:px-8 py-3 text-left align-middle font-bold">{s.proizvod ? (s.proizvod.cena * s.kolicina).toFixed(2) : '0.00'} EUR</td>
                    <td className="px-4 lg:px-8 py-3 text-left align-middle">
                      <button
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-all cart-btn"
                        onClick={() => handleDelete(s.id)}
                        aria-label="Ukloni iz korpe"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 pb-32">
            {stavke.map((s) => {
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-lg shadow-md border border-blue-200 cart-card"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {s.proizvod?.slika && (
                          <Image
                            src={s.proizvod.slika}
                            alt={s.proizvod.naziv_sr || ''}
                            width={80}
                            height={80}
                            className="object-contain rounded-lg cart-image"
                            priority
                          />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate mb-2">
                          {s.proizvod?.naziv_sr || 'Nema naziva'}
                        </h3>

                        {/* Price */}
                        <div className="text-lg font-bold text-blue-600 mb-3">
                          {s.proizvod ? (s.proizvod.cena * s.kolicina).toFixed(2) : '0.00'} EUR
                        </div>

                        {/* Quantity Controls and Delete Button */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">{t('kolicina')}:</span>
                            <div className="flex items-center gap-2">
                              <button
                                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors cart-quantity-btn cart-btn"
                                onClick={() => handleKolicina(s.id, s.kolicina - 1)}
                                disabled={s.kolicina <= 1}
                                aria-label="Smanji količinu"
                              >
                                <FaMinus className="text-xs" />
                              </button>
                              <span className="w-8 text-center font-medium">{s.kolicina}</span>
                              <button
                                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors cart-quantity-btn cart-btn"
                                onClick={() => handleKolicina(s.id, s.kolicina + 1)}
                                aria-label="Povećaj količinu"
                              >
                                <FaPlus className="text-xs" />
                              </button>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            className="w-12 h-12 flex items-center justify-center text-red-600 hover:text-white hover:bg-red-600 rounded-full border border-red-300 hover:border-red-600 transition-all active:bg-red-700 cart-delete-btn cart-btn"
                            onClick={() => handleDelete(s.id)}
                            aria-label="Ukloni iz korpe"
                          >
                            <FaTrashAlt className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary - Mobile Sticky Bottom / Desktop Sidebar */}
        <div className="w-full lg:w-96">
          {/* Mobile: Fixed bottom summary */}
          <div className="lg:hidden cart-fixed-bottom p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaShoppingCart className="text-blue-600" />
                <span className="font-semibold">
                  {stavke.reduce((acc, s) => acc + s.kolicina, 0)} {t('kolicina')}
                </span>
              </div>
              <div className="text-xl font-bold text-blue-600">
                {stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0).toFixed(2)} EUR
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 py-3 rounded-lg font-bold text-sm hover:bg-yellow-500 active:bg-yellow-600 transition-colors cart-btn"
                onClick={() => window.location.href = '/placanje/paypal'}
              >
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="6" fill="#fff" />
                  <path d="M10 22L12 10H18C21 10 22 12 21.5 14.5C21 17 19 18 16.5 18H14.5L14 22H10Z" fill="#003087" />
                  <path d="M14 22L14.5 18H16.5C19 18 21 17 21.5 14.5C22 12 21 10 18 10H12L10 22H14Z" fill="#009CDE" fillOpacity={0.7} />
                  <path d="M14.5 18L15 14H17C18.5 14 19 15 18.5 16C18 17 17 18 15.5 18H14.5Z" fill="#012169" />
                </svg>
                PayPal
              </button>
              <button
                className="bg-green-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-green-700 active:bg-green-800 transition-colors cart-btn"
                onClick={handleZavrsiKupovinu}
              >
                {t('zavrsi_kupovinu')}
              </button>
            </div>
            <div className="mt-4">
              <PaymentSelector amount={stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0)} />
            </div>
          </div>

          {/* Desktop: Regular sidebar */}
          <div className="hidden lg:block bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FaShoppingCart className="text-blue-600" />
              {t('naslov')}
            </h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('kolicina')}:</span>
                <span className="font-medium">{stavke.reduce((acc, s) => acc + s.kolicina, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('ukupno')}:</span>
                <span className="font-medium">{stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0).toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('dostava')}:</span>
                <span className="font-medium text-green-600">0.00 EUR</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-lg">
                <span>{t('ukupno')}:</span>
                <span className="text-blue-600">{stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0).toFixed(2)} EUR</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
                onClick={() => window.location.href = '/placanje/paypal'}
              >
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="6" fill="#fff" />
                  <path d="M10 22L12 10H18C21 10 22 12 21.5 14.5C21 17 19 18 16.5 18H14.5L14 22H10Z" fill="#003087" />
                  <path d="M14 22L14.5 18H16.5C19 18 21 17 21.5 14.5C22 12 21 10 18 10H12L10 22H14Z" fill="#009CDE" fillOpacity={0.7} />
                  <path d="M14.5 18L15 14H17C18.5 14 19 15 18.5 16C18 17 17 18 15.5 18H14.5Z" fill="#012169" />
                </svg>
                PayPal
              </button>

              <PaymentSelector amount={stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0)} />

              <button
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                onClick={handleZavrsiKupovinu}
              >
                {t('zavrsi_kupovinu')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
