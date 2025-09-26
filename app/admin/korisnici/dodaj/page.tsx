'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { korisnikSchema } from '@/zod';

function DodajKorisnikaPage() {
  const { t } = useTranslation(['korisnici']);
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    ime: '',
    prezime: '',
    telefon: '',
    drzava: '',
    grad: '',
    postanskiBroj: '',
    adresa: '',
    uloga: 'korisnik',
    lozinka: '',
    slika: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  interface FormData {
    email: string;
    ime: string;
    prezime: string;
    telefon: string;
    drzava: string;
    grad: string;
    postanskiBroj: string;
    adresa: string;
    uloga: string;
    lozinka: string;
    slika: string;
  }

  interface ApiResponse {
    error?: string;
    [key: string]: unknown;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parse = korisnikSchema(t).safeParse(form as FormData);
    if (!parse.success) {
      const newFieldErrors: { [key: string]: string } = {};
      parse.error.issues.forEach(issue => {
        if (issue.path[0]) newFieldErrors[String(issue.path[0])] = issue.message;
      });
      setFieldErrors(newFieldErrors);
      return;
    }
    const res: Response = await fetch('/api/korisnici', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        postanskiBroj: Number(form.postanskiBroj),
      }),
    });
    const result: ApiResponse = await res.json();
    if (!res.ok) {
      setError(result.error || 'Greška!');
      return;
    }
    router.push('/admin?page=korisnici');
  };

  return (
    <div className="admin-container">
      <div className="max-w-xl mx-auto rounded-xl  p-8">
        <h2 className=" text-blue-600 px-6 py-2 rounded-lg text-2xl font-semibold mb-6">{t('korisnici:dodaj_korisnika')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="ime">
              {t('korisnici:ime')}
            </label>
            <input
              id="ime"
              name="ime"
              value={form.ime}
              onChange={handleChange}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:ime_placeholder')}
              required
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
              value={form.prezime}
              onChange={handleChange}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:prezime_placeholder')}
              required
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
              value={form.email}
              onChange={handleChange}
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:email_placeholder')}
              required
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
              value={form.telefon}
              onChange={handleChange}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:telefon_placeholder')}
              required
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
              value={form.drzava}
              onChange={handleChange}
              type="text"
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
              value={form.grad}
              onChange={handleChange}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:grad_placeholder')}
              required
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
              value={form.postanskiBroj}
              onChange={handleChange}
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:postanskiBroj_placeholder')}
              required
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
              value={form.adresa}
              onChange={handleChange}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:adresa_placeholder')}
              required
            />
            {fieldErrors.adresa && <p className="text-red-500 text-sm mt-1">{fieldErrors.adresa}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="lozinka">
              {t('korisnici:lozinka')}
            </label>
            <input
              id="lozinka"
              name="lozinka"
              value={form.lozinka}
              onChange={handleChange}
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:lozinka_placeholder')}
              required
            />
            {fieldErrors.lozinka && <p className="text-red-500 text-sm mt-1">{fieldErrors.lozinka}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="slika">
              {t('korisnici:slika')}
            </label>
            <input
              id="slika"
              name="slika"
              value={form.slika}
              onChange={handleChange}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('korisnici:slika_placeholder')}
            />
            {fieldErrors.slika && <p className="text-red-500 text-sm mt-1">{fieldErrors.slika}</p>}
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {t('dodaj_novog_korisnika')}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default DodajKorisnikaPage;
