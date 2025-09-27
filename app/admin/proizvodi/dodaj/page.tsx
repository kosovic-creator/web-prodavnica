'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { proizvodSchema } from '@/zod';
import ImageUpload from '@/components/ImageUpload';



function DodajProizvodPage() {
  const router = useRouter();
    const { t } = useTranslation(['proizvodi']);
  const [form, setForm] = useState({
    naziv: '',
    cena: '',
    opis: '',
    karakteristike: '',
    kategorija: '',
    kolicina: '',
    slika: '',
  });
  const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

    const handleImageChange = (imageUrl: string) => {
        setForm({ ...form, slika: imageUrl });
    };

    const handleImageRemove = () => {
        setForm({ ...form, slika: '' });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
      setFieldErrors({});
      const parse = proizvodSchema(t).safeParse({
          ...form,
          cena: Number(form.cena),
          kolicina: Number(form.kolicina),
      });
      if (!parse.success) {
          const newFieldErrors: { [key: string]: string } = {};
          parse.error.issues.forEach(issue => {
              if (issue.path[0]) newFieldErrors[String(issue.path[0])] = issue.message;
          });
          setFieldErrors(newFieldErrors);
          return;
      }
    const res = await fetch('/api/proizvodi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        cena: Number(form.cena),
        kolicina: Number(form.kolicina),
      }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Greška!');
      return;
    }
    router.push('/admin?page=proizvodi');
  };

    function setEditMode(arg0: boolean): void {
        throw new Error('Function not implemented.');
    }

  return (
      <div className="max-w-xl mx-auto p-8">
          <h2 className="text-2xl font-semibold mb-6">{t('proizvodi:dodaj_artikal')}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
              <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="naziv">
                      {t('proizvodi:naziv')}
                  </label>
                  <input
                      id="naziv"
                      name="naziv"
                      value={form.naziv || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('proizvodi:naziv_placeholder')}
                      required
                  />
                  {fieldErrors.naziv && <p className="text-red-500 text-sm mt-1">{fieldErrors.naziv}</p>}
              </div>
              <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="cena">
                      {t('proizvodi:cena')}
                  </label>
                  <input
                      id="cena"
                      name="cena"
                      type="number"
                      value={form.cena || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('proizvodi:cena_placeholder')}
                      required
                  />
                  {fieldErrors.cena && <p className="text-red-500 text-sm mt-1">{fieldErrors.cena}</p>}
              </div>
              <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="opis">
                      {t('proizvodi:opis')}
                  </label>
                  <textarea
                      id="opis"
                      name="opis"
                      value={form.opis || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('proizvodi:opis_placeholder')}
                  />
                  {fieldErrors.opis && <p className="text-red-500 text-sm mt-1">{fieldErrors.opis}</p>}
              </div>
              <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="karakteristike">
                      {t('proizvodi:karakteristike')}
                  </label>
                  <input
                      id="karakteristike"
                      name="karakteristike"
                      value={form.karakteristike}
                      onChange={handleChange}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('proizvodi:karakteristike_placeholder')}
                  />
                  {fieldErrors.karakteristike && <p className="text-red-500 text-sm mt-1">{fieldErrors.karakteristike}</p>}
              </div>
              <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="kategorija">
                      {t('proizvodi:kategorija')}
                  </label>
                  <input
                      id="kategorija"
                      name="kategorija"
                      value={form.kategorija}
                      onChange={handleChange}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('proizvodi:kategorija_placeholder')}
                  />
                  {fieldErrors.kategorija && <p className="text-red-500 text-sm mt-1">{fieldErrors.kategorija}</p>}
              </div>
              <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="kolicina">
                      {t('proizvodi:kolicina')}
                  </label>
                  <input
                      id="kolicina"
                      name="kolicina"
                      value={form.kolicina}
                      onChange={handleChange}
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('proizvodi:kolicina_placeholder')}
                      required
                  />
                  {fieldErrors.kolicina && <p className="text-red-500 text-sm mt-1">{fieldErrors.kolicina}</p>}
              </div>
              <ImageUpload
                  currentImage={form.slika}
                  onImageChange={handleImageChange}
                  onImageRemove={handleImageRemove}
                  productId={`new-${Date.now()}`}
              />
              <div className="mb-4">

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                  {t('proizvodi:sacuvaj')}
              </button>
               <button
                      type="button"
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition" onClick={() => setEditMode(false)}
                  >
                      {t('proizvodi:otkazi')}
                  </button>
                  <button
                      type="button"
                      className="bg-amber-800 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition" onClick={() => router.push('/admin?page=proizvodi')}
                  >
                      {t('proizvodi:nazad')}
                  </button>
                  {error && <div className="text-red-600 mt-4">{error}</div>}
              </div>

              {error && <div className="text-red-600 mt-4">{error}</div>}
      </form>
    </div>
  );
}

export default DodajProizvodPage;