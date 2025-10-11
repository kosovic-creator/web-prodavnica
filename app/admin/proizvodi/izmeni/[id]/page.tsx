
'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
// Removed i18n - using Serbian text directly
import { noviProizvodSchemaStatic } from '@/zod';
import ImageUpload from '@/components/ImageUpload';
import { FaSave, FaTimes } from 'react-icons/fa';

type Proizvod = {
  id?: string;
  cena: number;
  slika?: string | null;
  kolicina: number;
  naziv_sr: string;
  naziv_en: string;
  opis_sr?: string;
  opis_en?: string;
  karakteristike_sr?: string;
  karakteristike_en?: string;
  kategorija_sr: string;
  kategorija_en: string;
  kreiran?: Date;
  azuriran?: Date;
};

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
      const langFromUrl = searchParams?.get('lang');
      const currentLang = langFromUrl || 'sr';
      fetch(`/api/proizvodi/${id}?lang=${currentLang}`)
        .then(res => res.json())
        .then(data => {
          // Mapiraj API polja na polja forme
          setForm(form => ({
            ...form,
            id: data.id,
            cena: data.cena,
            slika: data.slika,
            kolicina: data.kolicina,
            kreiran: data.kreiran,
            azuriran: data.azuriran,
            naziv_sr: currentLang === 'sr' ? (data.naziv ?? '') : (form?.naziv_sr ?? ''),
            naziv_en: currentLang === 'en' ? (data.naziv ?? '') : (form?.naziv_en ?? ''),
            opis_sr: currentLang === 'sr' ? (data.opis ?? '') : (form?.opis_sr ?? ''),
            opis_en: currentLang === 'en' ? (data.opis ?? '') : (form?.opis_en ?? ''),
            karakteristike_sr: currentLang === 'sr' ? (data.karakteristike ?? '') : (form?.karakteristike_sr ?? ''),
            karakteristike_en: currentLang === 'en' ? (data.karakteristike ?? '') : (form?.karakteristike_en ?? ''),
            kategorija_sr: currentLang === 'sr' ? (data.kategorija ?? '') : (form?.kategorija_sr ?? ''),
            kategorija_en: currentLang === 'en' ? (data.kategorija ?? '') : (form?.kategorija_en ?? ''),
          }));
        });
    }
  }, [id, searchParams]);

const [activeLanguage, setActiveLanguage] = useState<'sr' | 'en'>('sr');

  if (!form) return <div>Učitavanje...</div>;

// Use React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> directly

const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
};

const handleImageChange = (imageUrl: string): void => {
    setForm({ ...form, slika: imageUrl });
};

    const handleImageRemove = () => {
        setForm({ ...form, slika: '' });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
      setFieldErrors({});
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
      slika: form.slika,
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
    const res = await fetch('/api/proizvodi', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
        slika: form.slika,
        id: form.id,
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
  <>
    <div className="admin-container">
      <h2 className="text-2xl text-blue-600 font-semibold mb-6">Izmeni proizvod</h2>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveLanguage('sr')}
          className={`px-4 py-2 rounded-lg ${activeLanguage === 'sr' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Srpski
        </button>
        <button
          type="button"
          onClick={() => setActiveLanguage('en')}
          className={`px-4 py-2 rounded-lg ${activeLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Engleski
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor={`naziv_${activeLanguage}`}>Naziv ({activeLanguage === 'sr' ? 'Srpski' : 'Engleski'})</label>
          <input
            id={`naziv_${activeLanguage}`}
            name={`naziv_${activeLanguage}`}
            value={form[`naziv_${activeLanguage}`] || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus"
            placeholder={activeLanguage === 'sr' ? 'Unesite naziv proizvoda' : 'Enter product name'}
            required
          />
          {fieldErrors[`naziv_${activeLanguage}`] && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors[`naziv_${activeLanguage}`]}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor={`opis_${activeLanguage}`}>Opis ({activeLanguage === 'sr' ? 'Srpski' : 'Engleski'})</label>
          <textarea
            id={`opis_${activeLanguage}`}
            name={`opis_${activeLanguage}`}
            value={form[`opis_${activeLanguage}`] || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus"
            placeholder={activeLanguage === 'sr' ? 'Unesite opis proizvoda' : 'Enter product description'}
          />
          {fieldErrors[`opis_${activeLanguage}`] && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors[`opis_${activeLanguage}`]}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor={`karakteristike_${activeLanguage}`}>Karakteristike ({activeLanguage === 'sr' ? 'Srpski' : 'Engleski'})</label>
          <input
            id={`karakteristike_${activeLanguage}`}
            name={`karakteristike_${activeLanguage}`}
            value={form[`karakteristike_${activeLanguage}`] || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus"
            placeholder={activeLanguage === 'sr' ? 'Unesite karakteristike' : 'Enter features'}
          />
          {fieldErrors[`karakteristike_${activeLanguage}`] && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors[`karakteristike_${activeLanguage}`]}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor={`kategorija_${activeLanguage}`}>Kategorija ({activeLanguage === 'sr' ? 'Srpski' : 'Engleski'})</label>
          <input
            id={`kategorija_${activeLanguage}`}
            name={`kategorija_${activeLanguage}`}
            value={form[`kategorija_${activeLanguage}`] || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus"
            placeholder={activeLanguage === 'sr' ? 'Unesite kategoriju' : 'Enter category'}
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
            value={form.cena || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="kolicina">Količina</label>
          <input
            id="kolicina"
            name="kolicina"
            type="number"
            value={form.kolicina || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg input-focus"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="slika">Slika</label>
          <ImageUpload
            currentImage={form.slika || ''}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
            productId={id}
          />
        </div>
        <div className="flex gap-4 mt-6">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer">
            <FaSave /> Sačuvaj
          </button>
          <button type="button" onClick={handleCancel} className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer">
            <FaTimes /> Otkaži
          </button>
        </div>
        {error && <div className="text-red-600 mt-4">{error}</div>}
      </form>
    </div>
  </>
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