
'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
// Removed i18n - using Serbian text directly
import { proizvodSchemaStatic } from '@/zod';
import ImageUpload from '@/components/ImageUpload';
import { FaSave, FaTimes } from 'react-icons/fa';
import {Proizvod} from '@/types';

function IzmeniProizvodContent() {
  const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
  const id = params?.id;
  const router = useRouter();
    // Removed useTranslation - using direct Serbian text

  const [form, setForm] = useState<Proizvod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    if (id) {
        // Uzmi jezik iz URL-a ili iz i18n ili default 'sr'
        const langFromUrl = searchParams?.get('lang');
        const currentLang = langFromUrl || 'sr';
        fetch(`/api/proizvodi/${id}?lang=${currentLang}`)
        .then(res => res.json())
        .then(data => setForm(data));
    }
  }, [id, searchParams]);

  if (!form) return <div>Učitavanje...</div>;

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
      const parse = proizvodSchemaStatic.safeParse({
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
      const langFromUrl = searchParams?.get('lang');
      const currentLang = langFromUrl || 'sr';
    const res = await fetch('/api/proizvodi', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        cena: Number(form.cena),
        kolicina: Number(form.kolicina),
          jezik: currentLang, // Dodaj jezik za update
      }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Greška!');
      return;
    }
    router.push('/admin/proizvodi');
  };

    const handleCancel = () => {
        // Vrati se na admin stranicu bez čuvanja promena
        router.push('/admin/proizvodi');
    };

  return (
      <div className="admin-container">
          <div className="max-w-xl mx-auto p-8">
              <h2 className="text-2xl text-blue-600  font-semibold mb-6">Izmeni proizvod</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
                  <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="naziv">
                          Naziv
                      </label>
                      <input
                          id="naziv"
                          name="naziv"
                          value={form.naziv || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus"
                          placeholder={"Unesite naziv proizvoda"}
                          required
                      />
                      {fieldErrors.naziv && <p className="text-red-500 text-sm mt-1">{fieldErrors.naziv}</p>}
                  </div>
                  <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="cena">
                          Cena
                      </label>
                      <input
                          id="cena"
                          name="cena"
                          type="number"
                          value={form.cena || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus"
                          placeholder="Unesite cenu"
                          required
                      />
                      {fieldErrors.cena && <p className="text-red-500 text-sm mt-1">{fieldErrors.cena}</p>}
                  </div>
                  <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="opis">
                          Opis
                      </label>
                      <textarea
                          id="opis"
                          name="opis"
                          value={form.opis || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus"
                          placeholder="Unesite opis"
                      />
                      {fieldErrors.opis && <p className="text-red-500 text-sm mt-1">{fieldErrors.opis}</p>}
                  </div>
                  <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="karakteristike">
                          Karakteristike
                      </label>
                      <input
                          id="karakteristike"
                          name="karakteristike"
                          value={form.karakteristike || ""}
                          onChange={handleChange}
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus"
                          placeholder="Unesite karakteristike"
                      />
                      {fieldErrors.karakteristike && <p className="text-red-500 text-sm mt-1">{fieldErrors.karakteristike}</p>}
                  </div>
                  <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="kategorija">
                          Kategorija
                      </label>
                      <input
                          id="kategorija"
                          name="kategorija"
                          value={form.kategorija || ""}
                          onChange={handleChange}
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus"
                          placeholder="Unesite kategoriju"
                      />
                      {fieldErrors.kategorija && <p className="text-red-500 text-sm mt-1">{fieldErrors.kategorija}</p>}
                  </div>
                  <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="kolicina">
                          Količina
                      </label>
                      <input
                          id="kolicina"
                          name="kolicina"
                          value={form.kolicina || ""}
                          onChange={handleChange}
                          type="number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus"
                          placeholder="Unesite količinu"
                          required
                      />
                      {fieldErrors.kolicina && <p className="text-red-500 text-sm mt-1">{fieldErrors.kolicina}</p>}
                  </div>
                  <ImageUpload
                      currentImage={form.slika ?? undefined}
                      onImageChange={handleImageChange}
                      onImageRemove={handleImageRemove}
                      productId={id}
                  />
                  <div className="flex gap-4 mt-6">
                      <button
                          type="submit"
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer"
                      >
                          <FaSave />
                          Sačuvaj
                      </button>
                      <button
                          type="button"
                          onClick={handleCancel}
                          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer"
                      >
                          <FaTimes />
                          Otkaži
                      </button>
                  </div>
                  {error && <div className="text-red-600 mt-4">{error}</div>}
              </form>
          </div>
    </div>
  );
}

function IzmeniProizvodPage() {
    return (
        <Suspense fallback={<div>Učitavanje...</div>}>
            <IzmeniProizvodContent />
        </Suspense>
    );
}

export default IzmeniProizvodPage;