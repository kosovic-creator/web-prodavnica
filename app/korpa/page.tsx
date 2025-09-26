'use client';
import { useSession } from 'next-auth/react';
import { FaUser } from "react-icons/fa";
import React, { useState, useEffect } from 'react';
import { StavkaKorpe } from '../../types';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import StripeButton from '@/components/Stripe Checkout';
import { useKorpa } from "@/components/KorpaContext";
import { FaShoppingCart, FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';

export default function KorpaPage() {
  const { t } = useTranslation('korpa');
  const { data: session } = useSession();
  const [stavke, setStavke] = useState<StavkaKorpe[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { resetKorpa } = useKorpa();

  useEffect(() => {
    async function fetchKorpa() {
      setLoading(true);
      const korisnikId = session?.user?.id;
      if (!korisnikId) return setLoading(false);
      const res = await fetch(`/api/korpa?korisnikId=${korisnikId}`);
      const data = await res.json();
      setStavke(data.stavke);
      setLoading(false);
    }
    fetchKorpa();
  }, [session]);

  const handleKolicina = async (id: string, kolicina: number) => {
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
  };

  const handleDelete = async (id: string) => {
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
  };

  const isprazniKorpu = async () => {
    const korisnikId = session?.user?.id;
    if (!korisnikId) return;
    await fetch('/api/korpa/delete-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ korisnikId }),
    });
    setStavke([]);
    localStorage.setItem('brojUKorpi', '0');
    window.dispatchEvent(new Event('korpaChanged'));
    resetKorpa();
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
        await isprazniKorpu();

        toast.success(t('artikal_dod'),{ duration: 3000 });
        return true;
      } else {

        toast.error(t('error'),{ duration: 3000 });
        return false;
      }
    } catch {

      toast.error(t('error'),{ duration: 3000 });
      return false;
    }
  };

  const handleZavrsiKupovinu = async () => {
    const success = await potvrdiPorudzbinu();
    if (success) {
      router.push('/porudzbine');
    }
  };

  if (loading) return <div className="p-4">{t('loading') || "Učitavanje..."}</div>;
  if (!session?.user) {
    return (
      <div className="flex flex-col items-center gap-2 text-red-600 mt-8">
        <div className="flex items-center gap-2">
          <FaUser />
          <span>{t('must_login')}</span>
        </div>
        <a href="/auth/prijava" className="text-blue-600 underline mt-2">{t('login')}</a>
      </div>
    );
  }
  if (!stavke.length) return (
    <div className="p-4 flex flex-col items-center text-gray-500">
      <FaShoppingCart className="text-4xl mb-2 text-violet-600" />
      {t('empty')}
    </div>
  );

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-4 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaShoppingCart className="text-violet-600" />
            {t('naslov')}
          </h1>
          <div className="bg-white rounded shadow p-4 mb-4">
            <table className="w-full mb-2 border border-violet-200 rounded-lg shadow-md text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-8 py-3 text-left align-middle">{t('proizvod')}</th>
                  <th className="px-8 py-3 text-left align-middle">{t('kolicina')}</th>
                  <th className="px-8 py-3 text-left align-middle">{t('cena')}</th>
                  <th className="px-8 py-3 text-left align-middle">{t('akcije')}</th>
                </tr>
              </thead>
              <tbody>
                {stavke.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="px-8 py-3 text-left align-middle flex items-center gap-2">
                      {s.proizvod?.slika && (
                        <Image src={s.proizvod.slika} alt={s.proizvod.naziv || ''} width={48} height={48} className="object-contain rounded" />
                      )}
                      <span className="font-semibold">{s.proizvod?.naziv}</span>
                    </td>
                    <td className="px-8 py-3 text-left align-middle">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-1 border rounded hover:bg-gray-100"
                          onClick={() => handleKolicina(s.id, s.kolicina - 1)}
                          disabled={s.kolicina <= 1}
                          aria-label="Smanji količinu"
                        >
                          <FaMinus />
                        </button>
                        <span className="px-2">{s.kolicina}</span>
                        <button
                          className="px-2 py-1 border rounded hover:bg-gray-100"
                          onClick={() => handleKolicina(s.id, s.kolicina + 1)}
                          aria-label="Povećaj količinu"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-3 text-left align-middle font-bold">{s.proizvod ? (s.proizvod.cena * s.kolicina).toFixed(2) : '0.00'} EUR</td>
                    <td className="px-8 py-3 text-left align-middle">
                      <button
                        className="text-red-600 hover:text-red-800"
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
        </div>
        <div className="w-full md:w-96">
          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-2 flex items-center gap-2">
              <FaShoppingCart className="text-violet-600" />
              {t('naslov')}
            </h2>
            <div className="flex justify-between mb-1">
              <span>{t('kolicina')}:</span>
              <span>{stavke.reduce((acc, s) => acc + s.kolicina, 0)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>{t('ukupno')}:</span>
              <span>{stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0).toFixed(2)} EUR</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>{t('dostava')}:</span>
              <span>0.00 EUR</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2 mb-4">
              <span>{t('ukupno')}:</span>
              <span>{stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0).toFixed(2)} EUR</span>
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 py-2 rounded font-bold mb-2" onClick={() => window.location.href = '/placanje/paypal'}>
              {/* PayPal dugme */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="6" fill="#fff" />
                <path d="M10 22L12 10H18C21 10 22 12 21.5 14.5C21 17 19 18 16.5 18H14.5L14 22H10Z" fill="#003087" />
                <path d="M14 22L14.5 18H16.5C19 18 21 17 21.5 14.5C22 12 21 10 18 10H12L10 22H14Z" fill="#009CDE" fillOpacity={0.7} />
                <path d="M14.5 18L15 14H17C18.5 14 19 15 18.5 16C18 17 17 18 15.5 18H14.5Z" fill="#012169" />
              </svg>
              PayPal
            </button>
            <div className="mt-4">
              <StripeButton amount={stavke.reduce((acc, s) => acc + (s.proizvod ? s.proizvod.cena * s.kolicina : 0), 0)} />
              <button className="w-full bg-green-600 text-white py-2 rounded font-bold" onClick={handleZavrsiKupovinu}>
                {t('zavrsi_kupovinu')}
              </button>
            </div>
          </div>

        </div>
      </div>

    </>
  );
}
