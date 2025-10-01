'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';
import Image from 'next/image';
import { Korisnik } from '@/types';
import { Porudzbina } from '@/types';
import { Proizvod } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminHomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation(['korisnici', 'proizvodi', 'porudzbine']);
  const [tab, setTab] = useState<'korisnici' | 'proizvodi' | 'porudzbine'>('korisnici');
  const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);

  const [proizvodi, setProizvodi] = React.useState<Proizvod[]>([]);
  const [korisnici, setKorisnici] = useState<Korisnik[]>([]);

  const [search] = useState('');  // Čitaj URL parametar 'page' i postavi odgovarajući tab
  useEffect(() => {
    if (searchParams) {
      const pageParam = searchParams.get('page');
      if (pageParam === 'proizvodi' || pageParam === 'porudzbine' || pageParam === 'korisnici') {
        setTab(pageParam);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/korisnici?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => setKorisnici(data.korisnici || []));
  }, []);

  useEffect(() => {
    fetch('/api/porudzbine?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => {
        setPorudzbine(data.porudzbine || []);
      });
  }, []);

  useEffect(() => {
    // Admin panel uvek koristi srpski jezik za proizvode
    fetch(`/api/proizvodi?page=1&pageSize=10&lang=sr`)
      .then(res => res.json())
      .then(data => {
        setProizvodi(data.proizvodi || []);
      });
  }, []);
const handleProizvodDelete = async (id: number): Promise<void> => {
    await fetch('/api/proizvodi', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  // Ponovo učitaj proizvode - admin uvek koristi srpski
  fetch(`/api/proizvodi?page=1&pageSize=10&lang=sr`)
      .then((res: Response) => res.json())
      .then((data: { proizvodi: Proizvod[] }) => setProizvodi(data.proizvodi || []));
  };

// Delete korisnika
  const handleKorisnikDelete = async (id: string) => {
    await fetch('/api/korisnici', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    // Ponovo učitaj korisnike
    fetch('/api/korisnici?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => setKorisnici(data.korisnici || []));
  };

  const handleTabChange = (newTab: 'korisnici' | 'proizvodi' | 'porudzbine') => {
    setTab(newTab);
    router.push(`/admin?page=${newTab}`);
  };

  return (
    <div className="admin-container w-full max-w-screen-2xl mx-auto">
      <div className="px-2 bg-gray-50 min-h-screen w-full">

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => handleTabChange('korisnici')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-sm ${tab === 'korisnici'
              ? 'bg-violet-600 text-white'
              : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
              }`}
          >
            {t('korisnici', { ns: 'korisnici' })}
          </button>
          <button
            onClick={() => handleTabChange('proizvodi')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-sm ${tab === 'proizvodi'
              ? 'bg-violet-600 text-white'
              : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
              }`}
          >
            {t('proizvodi', { ns: 'proizvodi' })}
          </button>
          <button
            onClick={() => handleTabChange('porudzbine')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-sm ${tab === 'porudzbine'
              ? 'bg-violet-600 text-white'
              : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
              }`}
          >
            {t('porudzbine', { ns: 'porudzbine' })}
          </button>
        </div>
        {tab === 'korisnici' && (
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 w-full">
              <button
                onClick={() => router.push('/admin/korisnici/dodaj')}
                className="bg-violet-600 text-white px-6 py-2 rounded-lg mb-4"
              >
                {t('dodaj_korisnika', { ns: 'korisnici' })}
              </button>

              <div className="overflow-x-auto w-full">
                <div className="table-responsive">
                  <table className="min-w-[600px] w-full border border-violet-200 rounded-lg  text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-violet-100 text-violet-700">
                        <th className="px-8 py-3 text-left align-middle">{t('ime', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('prezime', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('email', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('telefon', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('drzava', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('grad', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('postanskiBroj', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('adresa', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('uloga', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {korisnici.map((k) => (
                        <tr key={k.id} className="hover:bg-violet-50 transition">
                          <td className="px-8 py-3 text-left align-middle">{k.ime}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.prezime}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.email}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.telefon || '-'}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.drzava || '-'}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.grad || '-'}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.postanskiBroj || '-'}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.adresa || '-'}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.uloga}</td>
                          <td className="px-8 py-3 text-left align-middle flex gap-2">
                            <button
                              className="text-blue-600 hover:underline"
                              onClick={() => router.push(`/admin/korisnici/${k.id}`)}
                            >
                              {t('uredi', { ns: 'korisnici' })}
                            </button>
                            <button
                              className="text-red-600 hover:underline"
                              onClick={() => handleKorisnikDelete(k.id)}
                            >
                              {t('obrisi', { ns: 'korisnici' })}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === 'proizvodi' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <button
              onClick={() => router.push('/admin/proizvodi/dodaj')}
              className="bg-violet-600 text-white px-6 py-2 rounded-lg mb-4"
            >
              {t('dodaj_artikal', { ns: 'proizvodi' })}
            </button>

            <div className="overflow-x-auto">
              <div className="table-responsive">
                <table className="min-w-[800px] w-full border border-violet-200 rounded-lg shadow-md text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-violet-100 text-violet-700">
                      <th className="px-8 py-3 text-left align-middle">{t('slika', { ns: 'proizvodi' })}</th>
                      <th className="px-8 py-3 text-left align-middle">{t('naziv', { ns: 'proizvodi' })}</th>
                      <th className="px-8 py-3 text-left align-middle">{t('cena', { ns: 'proizvodi' })}</th>
                      <th className="px-8 py-3 text-left align-middle">{t('karakteristike', { ns: 'proizvodi' })}</th>
                      <th className="px-8 py-3 text-left align-middle">{t('kategorija', { ns: 'proizvodi' })}</th>
                      <th className="px-8 py-3 text-left align-middle">{t('kolicina', { ns: 'proizvodi' })}</th>
                      <th className="px-8 py-3 text-left align-middle">{t('kreiran', { ns: 'proizvodi' })}</th>
                      <th className="px-8 py-3 text-left align-middle"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {proizvodi.filter(p => p.naziv.toLowerCase().includes(search?.toLowerCase() || ""))
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-violet-50 transition">
                          <td className="px-8 py-3 text-left align-middle">{p.slika ? <Image src={p.slika} alt={p.naziv} width={48} height={48} className="object-cover rounded-lg" /> : '-'}</td>
                          <td className="px-8 py-3 text-left align-middle">{p.naziv}</td>
                          <td className="px-8 py-3 text-left align-middle">{p.cena} EUR</td>
                          <td className="px-8 py-3 text-left align-middle">{p.karakteristike}</td>
                          <td className="px-8 py-3 text-left align-middle">{p.kategorija}</td>
                          <td className="px-8 py-3 text-left align-middle">{p.kolicina}</td>
                          <td className="px-8 py-3 text-left align-middle">{p.kreiran ? new Date(p.kreiran).toLocaleDateString() : '-'}</td>
                          <td className="px-8 py-3 text-left align-middle flex gap-2">
                            <button className="text-blue-600 hover:underline" onClick={() => router.push(`/admin/proizvodi/${p.id}`)}>{t('uredi', { ns: 'proizvodi' })}</button>
                            <button className="text-red-600 hover:underline" onClick={() => handleProizvodDelete(Number(p.id))}>{t('obrisi', { ns: 'proizvodi' })}</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {tab === 'porudzbine' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="font-semibold mb-6 text-xl text-violet-700">{t('order_list', { ns: 'porudzbine' })}</h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-violet-200 rounded-lg shadow-md text-sm">
                <thead>
                  <tr className="bg-violet-100 text-violet-700">
                    <th className="px-8 py-3 text-left align-middle">{t('id', { ns: 'porudzbine' })}</th>
                    <th className="px-8 py-3 text-left align-middle">{t('user', { ns: 'porudzbine' })}</th>
                    <th className="px-8 py-3 text-left align-middle">{t('total', { ns: 'porudzbine' })}</th>
                    <th className="px-8 py-3 text-left align-middle">{t('status', { ns: 'porudzbine' })}</th>
                    <th className="px-8 py-3 text-left align-middle">{t('created', { ns: 'porudzbine' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {porudzbine.map((p) => (
                    <tr key={p.id} className="hover:bg-violet-50 transition">
                      <td className="px-8 py-3 text-left align-middle">{p.id}</td>
                      <td className="px-8 py-3 text-left align-middle">{p.korisnikId}</td>
                      <td className="px-8 py-3 text-left align-middle">{p.ukupno} EUR</td>
                      <td className="px-8 py-3 text-left align-middle">{p.status}</td>
                      <td className="px-8 py-3 text-left align-middle">{new Date(p.kreiran).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
