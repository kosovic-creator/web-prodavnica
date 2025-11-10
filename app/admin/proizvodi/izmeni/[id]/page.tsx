/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState, Suspense, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { noviProizvodSchemaStatic } from '@/zod';
import ImageUpload from '@/components/ImageUpload';
import { FaSave, FaTimes } from 'react-icons/fa';
import { Proizvod } from '@/types';
import { getProizvodById, updateProizvod } from '@/lib/actions/proizvodi';
import { toast } from 'react-hot-toast';

function IzmeniProizvodContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [form, setForm] = useState<Proizvod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [activeLanguage, setActiveLanguage] = useState<'sr' | 'en'>('sr');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const loadProizvod = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const result = await getProizvodById(id);

        if (result.success && result.data) {
          const data = result.data;
          setForm({
            id: data.id ?? "",
            cena: data.cena ?? 0,
            slike: Array.isArray(data.slike) ? data.slike : [],
            kolicina: data.kolicina ?? 0,
            kreiran: data.kreiran ?? "",
            azuriran: data.azuriran ?? "",
            naziv_sr: data.naziv_sr ?? '',
            naziv_en: data.naziv_en ?? '',
            opis_sr: data.opis_sr ?? '',
            opis_en: data.opis_en ?? '',
            karakteristike_sr: data.karakteristike_sr ?? '',
            karakteristike_en: data.karakteristike_en ?? '',
            kategorija_sr: data.kategorija_sr ?? '',
            kategorija_en: data.kategorija_en ?? '',
            naziv: data.naziv_sr ?? '',
            opis: data.opis_sr ?? '',
            kategorija: data.kategorija_sr ?? '',
          });
        } else {
          setError(result.error || 'Greška pri učitavanju proizvoda');
          toast.error(result.error || 'Greška pri učitavanju proizvoda');
        }
      } catch (error) {
        console.error('Error loading proizvod:', error);
        setError('Greška pri učitavanju proizvoda');
        toast.error('Greška pri učitavanju proizvoda');
      } finally {
        setLoading(false);
      }
    };

    loadProizvod();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    if (form) {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleImageAdd = (imageUrl: string): void => {
    if (form) {
      setForm({ ...form, slike: [...(form.slike || []), imageUrl] });
    }
  };

  const handleImageRemove = (index: number) => {
    if (form) {
      setForm({ ...form, slike: (form.slike || []).filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setError(null);
    setFieldErrors({});

    // Validate form data
    const parse = noviProizvodSchemaStatic.safeParse({
      naziv_sr: form.naziv_sr,
      naziv_en: form.naziv_en,
      opis_sr: form.opis_sr,
      opis_en: form.opis_en,
      karakteristike_sr: form.karakteristike_sr,
      karakteristike_en: form.karakteristike_en,
      kategorija_sr: form.kategorija_sr,
      kategorija_en: form.kategorija_en,
      cena: Number(form.cena),
      kolicina: Number(form.kolicina),
      slike: form.slike || [],
      id: form.id,
    });

    if (!parse.success) {
      const newFieldErrors: { [key: string]: string } = {};
      parse.error.issues.forEach(issue => {
        if (issue.path[0]) newFieldErrors[String(issue.path[0])] = issue.message;
      });
      setFieldErrors(newFieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateProizvod({
          id: form.id,
          naziv_sr: form.naziv_sr || '',
          naziv_en: form.naziv_en || '',
          opis_sr: form.opis_sr,
          opis_en: form.opis_en,
          karakteristike_sr: form.karakteristike_sr,
          karakteristike_en: form.karakteristike_en,
          kategorija_sr: form.kategorija_sr || '',
          kategorija_en: form.kategorija_en || '',
          cena: Number(form.cena),
          kolicina: Number(form.kolicina),
          slike: form.slike || [],
        });

        if (result.success) {
          toast.success('Proizvod je uspešno ažuriran!');
          router.push('/admin/proizvodi');
        } else {
          setError(result.error || 'Greška pri ažuriranju proizvoda!');
          toast.error(result.error || 'Greška pri ažuriranju proizvoda!');
        }
      } catch (error) {
        console.error('Error updating product:', error);
        setError('Greška pri ažuriranju proizvoda!');
        toast.error('Greška pri ažuriranju proizvoda!');
      }
    });
  };

  const handleCancel = () => {
    router.push('/admin/proizvodi');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">
          {error || 'Proizvod nije pronađen'}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2 className="text-2xl text-blue-600 font-semibold mb-6">Izmeni proizvod</h2>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveLanguage('sr')}
          className={`px-4 py-2 rounded-lg ${activeLanguage === 'sr' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          disabled={isPending}
        >
          Srpski
        </button>
        <button
          type="button"
          onClick={() => setActiveLanguage('en')}
          className={`px-4 py-2 rounded-lg ${activeLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          disabled={isPending}
        >
          Engleski
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor={`naziv_${activeLanguage}`}>
            Naziv ({activeLanguage === 'sr' ? 'Srpski' : 'Engleski'})
          </label>
          <input
            id={`naziv_${activeLanguage}`}
            name={`naziv_${activeLanguage}`}
            value={form[`naziv_${activeLanguage}`] || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={activeLanguage === 'sr' ? 'Unesite naziv proizvoda' : 'Enter product name'}
            required
            disabled={isPending}
          />
          {fieldErrors[`naziv_${activeLanguage}`] && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors[`naziv_${activeLanguage}`]}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor={`opis_${activeLanguage}`}>
            Opis ({activeLanguage === 'sr' ? 'Srpski' : 'Engleski'})
          </label>
          <textarea
            id={`opis_${activeLanguage}`}
            name={`opis_${activeLanguage}`}
            value={form[`opis_${activeLanguage}`] || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={activeLanguage === 'sr' ? 'Unesite opis proizvoda' : 'Enter product description'}
            disabled={isPending}
            rows={4}
          />
          {fieldErrors[`opis_${activeLanguage}`] && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors[`opis_${activeLanguage}`]}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor={`karakteristike_${activeLanguage}`}>
            Karakteristike ({activeLanguage === 'sr' ? 'Srpski' : 'Engleski'})
          </label>
          <input
            id={`karakteristike_${activeLanguage}`}
            name={`karakteristike_${activeLanguage}`}
            value={form[`karakteristike_${activeLanguage}`] || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={activeLanguage === 'sr' ? 'Unesite karakteristike' : 'Enter features'}
            disabled={isPending}
          />
          {fieldErrors[`karakteristike_${activeLanguage}`] && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors[`karakteristike_${activeLanguage}`]}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor={`kategorija_${activeLanguage}`}>
            Kategorija ({activeLanguage === 'sr' ? 'Srpski' : 'Engleski'})
          </label>
          <input
            id={`kategorija_${activeLanguage}`}
            name={`kategorija_${activeLanguage}`}
            value={form[`kategorija_${activeLanguage}`] || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={activeLanguage === 'sr' ? 'Unesite kategoriju' : 'Enter category'}
            disabled={isPending}
          />
          {fieldErrors[`kategorija_${activeLanguage}`] && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors[`kategorija_${activeLanguage}`]}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="cena">Cena</label>
          <input
            id="cena"
            name="cena"
            type="number"
            step="0.01"
            value={form.cena || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isPending}
          />
          {fieldErrors.cena && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.cena}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="kolicina">Količina</label>
          <input
            id="kolicina"
            name="kolicina"
            type="number"
            value={form.kolicina || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isPending}
          />
          {fieldErrors.kolicina && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.kolicina}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="slike">Slike proizvoda</label>
          <div className="flex flex-wrap gap-4 mb-2">
            {form.slike && form.slike.map((img, idx) => (
              <div key={img + idx} className="relative group">
                <img src={img} alt="Slika proizvoda" className="w-24 h-24 object-cover rounded border" />
                <button
                  type="button"
                  onClick={() => handleImageRemove(idx)}
                  className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:text-red-800 shadow group-hover:opacity-100 opacity-80"
                  title="Ukloni sliku"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            <ImageUpload
              currentImage={''}
              onImageChange={handleImageAdd}
              onImageRemove={() => { }}
              productId={id}
            />
          </div>
          <div className="text-sm text-gray-500">Možete dodati više slika. Prva slika će biti glavna.</div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            <FaSave /> {isPending ? 'Čuva...' : 'Sačuvaj'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            <FaTimes /> Otkaži
          </button>
        </div>

        {error && (
          <div className="text-red-600 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

function IzmeniProizvodPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <IzmeniProizvodContent />
    </Suspense>
  );
}

export default IzmeniProizvodPage;