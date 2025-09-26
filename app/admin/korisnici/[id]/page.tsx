'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Korisnik } from '@/types';
import { useTranslation } from 'react-i18next';
import { korisnikSchema } from '@/zod';

function KorisnikPage() {
  const params = useParams();
  const id = params ? params['id'] : undefined;
  const router = useRouter();
  const [korisnik, setKorisnik] = useState<Korisnik | null>(null);
  const [form, setForm] = useState<Korisnik | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const { t } = useTranslation(['korisnici']);

  useEffect(() => {
    if (id) {
      fetch(`/api/korisnici/${id}`)
        .then(res => res.json())
        .then(data => {
          setKorisnik(data);
          setForm(data);
        });
    }
  }, [id]);

  if (!form) return <div>Učitavanje...</div>;
  if (error) return <div>{error}</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const parse = korisnikSchema(t).safeParse(form);
    if (!parse.success) {
      const newFieldErrors: { [key: string]: string } = {};
      parse.error.issues.forEach(issue => {
        if (issue.path[0]) newFieldErrors[String(issue.path[0])] = issue.message;
      });
      setFieldErrors(newFieldErrors);
      return;
    }
    const res = await fetch('/api/korisnici', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Greška!');
      return;
    }
    router.push('/admin?page=korisnici');
  };

  return (
    <div className="admin-container">
      <div className="max-w-xl mx-auto rounded-xl  p-8">
        <h2 className=" text-blue-600 px-6 py-2 rounded-lg text-2xl font-semibold mb-6">{t('izmjeni_korisnika')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="ime">
              {t('korisnici:ime')}
            </label>
            <input
              id="ime"
              name="ime"
              value={form.ime || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:ime_placeholder')}
            />
            {fieldErrors.ime && <p className="text-red-500 text-sm mt-1">{fieldErrors.ime}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="prezime">
              {t('korisnici:prezime')}
            </label>
            <input
              id="prezime"
              name="prezime"
              value={form.prezime || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:prezime_placeholder')}
            />
            {fieldErrors.prezime && <p className="text-red-500 text-sm mt-1">{fieldErrors.prezime}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
              {t('korisnici:email')}
            </label>
            <input
              id="email"
              name="email"
              value={form.email || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:email_placeholder')}
            />
            {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="telefon">
              {t('korisnici:telefon')}
            </label>
            <input
              id="telefon"
              name="telefon"
              value={form.telefon || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:telefon_placeholder')}
            />
            {fieldErrors.telefon && <p className="text-red-500 text-sm mt-1">{fieldErrors.telefon}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="drzava">
              {t('korisnici:drzava')}
            </label>
            <input
              id="drzava"
              name="drzava"
              value={form.drzava || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:drzava_placeholder')}
            />
            {fieldErrors.drzava && <p className="text-red-500 text-sm mt-1">{fieldErrors.drzava}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="grad">
              {t('korisnici:grad')}
            </label>
            <input
              id="grad"
              name="grad"
              value={form.grad || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:grad_placeholder')}
            />
            {fieldErrors.grad && <p className="text-red-500 text-sm mt-1">{fieldErrors.grad}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="postanskiBroj">
              {t('korisnici:postanskiBroj')}
            </label>
            <input
              id="postanskiBroj"
              name="postanskiBroj"
              value={form.postanskiBroj || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:postanskiBroj_placeholder')}
              type="number"
            />
            {fieldErrors.postanskiBroj && <p className="text-red-500 text-sm mt-1">{fieldErrors.postanskiBroj}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="adresa">
              {t('korisnici:adresa')}
            </label>
            <input
              id="adresa"
              name="adresa"
              value={form.adresa || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:adresa_placeholder')}
            />
            {fieldErrors.adresa && <p className="text-red-500 text-sm mt-1">{fieldErrors.adresa}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="uloga">
              {t('korisnici:uloga')}
            </label>
            <input
              id="uloga"
              name="uloga"
              value={form.uloga || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:uloga_placeholder')}
            />
            {fieldErrors.uloga && <p className="text-red-500 text-sm mt-1">{fieldErrors.uloga}</p>}
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {t('korisnici:sacuvaj')}
          </button>
          {error && <div className="text-red-600">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default KorisnikPage;
