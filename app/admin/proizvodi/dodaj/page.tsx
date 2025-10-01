'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ImageUpload from '@/components/ImageUpload';
import { FaPlus, FaTimes } from 'react-icons/fa';

interface TranslationData {
    naziv: string;
    opis: string;
    karakteristike: string;
    kategorija: string;
}

function DodajProizvodPage() {
  const router = useRouter();
    const { t } = useTranslation(['proizvodi']);
  const [form, setForm] = useState({
      cena: '',
      kolicina: '',
      slika: '',
  });

    const [translations, setTranslations] = useState<Record<string, TranslationData>>({
        sr: {
          naziv: '',
          opis: '',
          karakteristike: '',
          kategorija: '',
      },
      en: {
          naziv: '',
          opis: '',
          karakteristike: '',
          kategorija: '',
      }
  });

    const [activeLanguage, setActiveLanguage] = useState<'sr' | 'en'>('sr');
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (['cena', 'kolicina', 'slika'].includes(name)) {
            setForm({ ...form, [name]: value });
        } else {
            setTranslations({
                ...translations,
                [activeLanguage]: {
                    ...translations[activeLanguage],
                    [name]: value
                }
            });
        }
    };

    const handleImageChange = (imageUrl: string) => {
        setForm({ ...form, slika: imageUrl });
    };

    const handleImageRemove = () => {
        setForm({ ...form, slika: '' });
    };

    const handleCancel = () => {
        // Resetuj form
        setForm({
            cena: '',
            kolicina: '',
            slika: '',
        });
        setTranslations({
            sr: {
                naziv: '',
            opis: '',
            karakteristike: '',
            kategorija: '',
            },
            en: {
                naziv: '',
                opis: '',
                karakteristike: '',
                kategorija: '',
            }
        });
        setError(null);
        // Vrati se na admin stranicu
        router.push('/admin?page=proizvodi');
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

      // Validate that both languages have required fields
      const serbianTranslation = translations.sr;
      const englishTranslation = translations.en;

      if (!serbianTranslation.naziv || !serbianTranslation.kategorija) {
          setError('Srpski naziv i kategorija su obavezni!');
          return;
      }

      if (!englishTranslation.naziv || !englishTranslation.kategorija) {
          setError('Engleski naziv i kategorija su obavezni!');
          return;
      }

      if (!form.cena || !form.kolicina) {
          setError('Cena i količina su obavezni!');
          return;
      }

      try {
      // Create product with both translations
        const res = await fetch('/api/proizvodi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            cena: Number(form.cena),
            kolicina: Number(form.kolicina),
            slika: form.slika,
            translations: {
                sr: serbianTranslation,
                en: englishTranslation
            }
        }),
      });

        const result = await res.json();
        if (!res.ok) {
          setError(result.error || 'Greška pri kreiranju proizvoda!');
          return;
      }

        router.push('/admin?page=proizvodi');
    } catch {
        setError('Greška pri kreiranju proizvoda!');
    }
  };

  return (
      <div className="max-w-2xl mx-auto p-8">
          <h2 className="text-2xl text-blue-600 font-semibold mb-6">{t('proizvodi:dodaj_artikal')}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Language Tabs */}
              <div className="mb-6">
                  <div className="flex border-b border-gray-200">
                      <button
                          type="button"
                          onClick={() => setActiveLanguage('sr')}
                          className={`px-4 py-2 font-medium text-sm relative ${activeLanguage === 'sr'
                                  ? 'border-b-2 border-blue-600 text-blue-600'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                      >
                          🇷🇸 Srpski
                          {translations.sr.naziv && translations.sr.kategorija && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                          )}
                      </button>
                      <button
                          type="button"
                          onClick={() => setActiveLanguage('en')}
                          className={`px-4 py-2 font-medium text-sm relative ${activeLanguage === 'en'
                                  ? 'border-b-2 border-blue-600 text-blue-600'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                      >
                          🇺🇸 English
                          {translations.en.naziv && translations.en.kategorija && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                          )}
                      </button>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                      Popunite prevod za {activeLanguage === 'sr' ? 'srpski' : 'engleski'} jezik
                  </div>
              </div>

              {/* Translation Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                      <label className="block font-medium mb-2" htmlFor="naziv">
                          {t('proizvodi:naziv')} ({activeLanguage === 'sr' ? 'Srpski' : 'English'}) *
                      </label>
                      <input
                          id="naziv"
                          name="naziv"
                          value={translations[activeLanguage].naziv}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={activeLanguage === 'sr' ? 'Naziv proizvoda' : 'Product name'}
                          required
                      />
                  </div>

                  <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="kategorija">
                          {t('proizvodi:kategorija')} ({activeLanguage === 'sr' ? 'Srpski' : 'English'}) *
                      </label>
                      <input
                          id="kategorija"
                          name="kategorija"
                          value={translations[activeLanguage].kategorija}
                          onChange={handleChange}
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={activeLanguage === 'sr' ? 'Kategorija proizvoda' : 'Product category'}
                          required
                      />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="opis">
                          {t('proizvodi:opis')} ({activeLanguage === 'sr' ? 'Srpski' : 'English'})
                      </label>
                      <textarea
                          id="opis"
                          name="opis"
                          value={translations[activeLanguage].opis}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={activeLanguage === 'sr' ? 'Opis proizvoda' : 'Product description'}
                          rows={4}
                      />
                  </div>

                  <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="karakteristike">
                          {t('proizvodi:karakteristike')} ({activeLanguage === 'sr' ? 'Srpski' : 'English'})
                      </label>
                      <textarea
                          id="karakteristike"
                          name="karakteristike"
                          value={translations[activeLanguage].karakteristike}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={activeLanguage === 'sr' ? 'Karakteristike proizvoda' : 'Product features'}
                          rows={4}
                      />
                  </div>
              </div>

              {/* Product metadata (language independent) */}
              <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 text-gray-700">Osnovne informacije</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-4">
                          <label className="block text-gray-700 font-medium mb-2" htmlFor="cena">
                              {t('proizvodi:cena')} *
                          </label>
                          <input
                              id="cena"
                              name="cena"
                              type="number"
                              step="0.01"
                              value={form.cena}
                              onChange={handleChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.00"
                              required
                          />
                      </div>

                      <div className="mb-4">
                          <label className="block text-gray-700 font-medium mb-2" htmlFor="kolicina">
                              {t('proizvodi:kolicina')} *
                          </label>
                          <input
                              id="kolicina"
                              name="kolicina"
                              value={form.kolicina}
                              onChange={handleChange}
                              type="number"
                              min="0"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0"
                              required
                          />
                      </div>
                  </div>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-700">Slika proizvoda</h3>
                  <ImageUpload
                      currentImage={form.slika}
                      onImageChange={handleImageChange}
                      onImageRemove={handleImageRemove}
                      productId={`new-${Date.now()}`}
                  />
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 mt-6">
                  <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                      <FaPlus />
                      {t('proizvodi:sacuvaj')}
                  </button>
                  <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                  >
                      <FaTimes />
                      {t('proizvodi:otkazi')}
                  </button>
              </div>

              {error && <div className="text-red-600 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
      </form>
    </div>
  );
}

export default DodajProizvodPage;