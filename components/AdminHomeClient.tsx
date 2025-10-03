'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';
import Image from 'next/image';
import { Korisnik } from '@/types';
import { Porudzbina } from '@/types';
import { Proizvod } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaTrash, FaEdit } from "react-icons/fa";
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';

type PorudzbinaWithKorisnik = Porudzbina & {
  korisnik: {
    id: string;
    ime: string | null;
    prezime: string | null;
    email: string;
  };
};

export default function AdminHomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation(['korisnici', 'proizvodi', 'porudzbine']);
  const [tab, setTab] = useState<'korisnici' | 'proizvodi' | 'porudzbine'>('korisnici');
  const [porudzbine, setPorudzbine] = useState<PorudzbinaWithKorisnik[]>([]);

  // Porudžbine state
  const [totalPorudzbine, setTotalPorudzbine] = useState(0);
  const [pagePorudzbine, setPagePorudzbine] = useState(1);
  const [pageSizePorudzbine] = useState(10);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ korisnikId: '', ukupno: '', status: '', email: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const [proizvodi, setProizvodi] = React.useState<Proizvod[]>([]);
  const [korisnici, setKorisnici] = useState<Korisnik[]>([]);

  // Čitaj URL parametar 'page' i postavi odgovarajući tab
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

  // Zod shema za porudžbine
  const schema = z.object({
    korisnikId: z.string().min(1, { message: t('required', { ns: 'porudzbine' }) }),
    ukupno: z.string().min(1, { message: t('required', { ns: 'porudzbine' }) }),
    status: z.string().min(1, { message: t('required', { ns: 'porudzbine' }) }),
    email: z.string().email({ message: t('invalid_email', { ns: 'porudzbine' }) }).optional().or(z.literal('')),
  });

  const fetchPorudzbine = useCallback(() => {
    fetch(`/api/porudzbine?page=${pagePorudzbine}&pageSize=${pageSizePorudzbine}`)
      .then(res => res.json())
      .then(data => {
        setPorudzbine(data.porudzbine || []);
        setTotalPorudzbine(data.total || 0);
      });
  }, [pagePorudzbine, pageSizePorudzbine]);

  useEffect(() => {
    fetchPorudzbine();
  }, [fetchPorudzbine]);

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

  // Porudžbine funkcije
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    setFieldErrors({});
    const result = schema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) {
          errors[String(err.path[0])] = err.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const method = editId ? 'PUT' : 'POST';
    const body = editId ? { id: editId, ...form, ukupno: Number(form.ukupno) } : { ...form, ukupno: Number(form.ukupno) };
    const res = await fetch('/api/porudzbine', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ? t(data.error, { ns: 'porudzbine' }) : t('error', { ns: 'porudzbine' }));
    } else {
      toast.success(editId ? t('success_update', { ns: 'porudzbine' }) : t('success_create', { ns: 'porudzbine' }));
      setForm({ korisnikId: '', ukupno: '', status: '', email: '' });
      setEditId(null);
      fetchPorudzbine();
    }
  };

  const handleEdit = (p: PorudzbinaWithKorisnik) => {
    setEditId(p.id);
    setForm({
      korisnikId: p.korisnikId,
      ukupno: String(p.ukupno),
      status: p.status,
      email: p.email || '',
    });
    setFieldErrors({});
  };

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/porudzbine', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ? t(data.error, { ns: 'porudzbine' }) : t('error', { ns: 'porudzbine' }));
    } else {
      toast.success(t('success_delete', { ns: 'porudzbine' }));
      fetchPorudzbine();
    }
  };

  const handleTabChange = (newTab: 'korisnici' | 'proizvodi' | 'porudzbine') => {
    setTab(newTab);
    router.push(`/admin?page=${newTab}`);
  };

  return (
    <div className="admin-container w-full max-w-screen-2xl mx-auto">
      <Toaster position="top-right" reverseOrder={false} />
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
                    {proizvodi
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
                            <button className="text-blue-600 hover:underline" onClick={() => router.push(`/admin/proizvodi/${p.id}?lang=sr`)}>{t('uredi', { ns: 'proizvodi' })}</button>
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
            <h2 className="font-semibold mb-6 text-xl text-violet-700">{t('title', { ns: 'porudzbine' })}</h2>

            {/* Forma za dodavanje/izmenu porudžbine */}
            <form onSubmit={handleSubmit} className="mb-6 flex gap-3 flex-wrap">
              <div>
                <input
                  name="korisnikId"
                  value={form.korisnikId}
                  onChange={handleChange}
                  placeholder={t('userId', { ns: 'porudzbine' })}
                  className={`border p-2 rounded ${fieldErrors.korisnikId ? 'border-red-500' : ''}`}
                />
                {fieldErrors.korisnikId && (
                  <div className="text-red-600 text-xs mt-1">{fieldErrors.korisnikId}</div>
                )}
              </div>
              <div>
                <input
                  name="ukupno"
                  value={form.ukupno}
                  onChange={handleChange}
                  placeholder={t('total', { ns: 'porudzbine' })}
                  type="number"
                  className={`border p-2 rounded ${fieldErrors.ukupno ? 'border-red-500' : ''}`}
                />
                {fieldErrors.ukupno && (
                  <div className="text-red-600 text-xs mt-1">{fieldErrors.ukupno}</div>
                )}
              </div>
              <div>
                <input
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  placeholder={t('status', { ns: 'porudzbine' })}
                  className={`border p-2 rounded ${fieldErrors.status ? 'border-red-500' : ''}`}
                />
                {fieldErrors.status && (
                  <div className="text-red-600 text-xs mt-1">{fieldErrors.status}</div>
                )}
              </div>
              <div>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className={`border p-2 rounded ${fieldErrors.email ? 'border-red-500' : ''}`}
                />
                {fieldErrors.email && (
                  <div className="text-red-600 text-xs mt-1">{fieldErrors.email}</div>
                )}
              </div>
              <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700 transition">
                {editId ? t('update', { ns: 'porudzbine' }) : t('dodaj', { ns: 'porudzbine' })}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setForm({ korisnikId: '', ukupno: '', status: '', email: '' });
                    setFieldErrors({});
                  }}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  {t('cancel', { ns: 'porudzbine' })}
                </button>
              )}
            </form>

            {/* Tabela porudžbina */}
            <div className="overflow-x-auto">
              <table className="w-full border border-violet-200 rounded-lg shadow-md text-sm">
                <thead>
                  <tr className="bg-violet-100 text-violet-700">
                    <th className="px-4 py-3 text-left">{t('userId', { ns: 'porudzbine' })}</th>
                    <th className="px-4 py-3 text-left">{t('name', { ns: 'porudzbine' })}</th>
                    <th className="px-4 py-3 text-left">{t('surname', { ns: 'porudzbine' })}</th>
                    <th className="px-4 py-3 text-left">{t('status', { ns: 'porudzbine' })}</th>
                    <th className="px-4 py-3 text-left">{t('total', { ns: 'porudzbine' })}</th>
                    <th className="px-4 py-3 text-left">{t('date', { ns: 'porudzbine' })}</th>
                    <th className="px-4 py-3 text-left">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {porudzbine.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-500 p-6">{t('empty', { ns: 'porudzbine' })}</td>
                    </tr>
                  ) : (
                    porudzbine.map((p) => (
                      <tr key={p.id} className="hover:bg-violet-50 transition">
                        <td className="px-4 py-3">{p.korisnikId}</td>
                        <td className="px-4 py-3">{p.korisnik?.ime || 'N/A'}</td>
                        <td className="px-4 py-3">{p.korisnik?.prezime || 'N/A'}</td>
                        <td className="px-4 py-3">{p.status}</td>
                        <td className="px-4 py-3">{p.ukupno} €</td>
                        <td className="px-4 py-3">{new Date(p.kreiran).toLocaleDateString()}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginacija */}
            {totalPorudzbine > 10 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  disabled={pagePorudzbine === 1}
                  onClick={() => setPagePorudzbine(pagePorudzbine - 1)}
                  className={`px-3 py-1 rounded ${pagePorudzbine === 1 ? 'bg-gray-200 text-gray-400' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                >
                  {t('prethodna', { ns: 'porudzbine' })}
                </button>
                <span>
                  {pagePorudzbine} / {Math.ceil(totalPorudzbine / pageSizePorudzbine)}
                </span>
                <button
                  disabled={pagePorudzbine >= Math.ceil(totalPorudzbine / pageSizePorudzbine)}
                  onClick={() => setPagePorudzbine(pagePorudzbine + 1)}
                  className={`px-3 py-1 rounded ${pagePorudzbine >= Math.ceil(totalPorudzbine / pageSizePorudzbine) ? 'bg-gray-200 text-gray-400' : 'bg-violet-600 text-white hover:bg-violet-700'}`}
                >
                  {t('sljedeca', { ns: 'porudzbine' })}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
