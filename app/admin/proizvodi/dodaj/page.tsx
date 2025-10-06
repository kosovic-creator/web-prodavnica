'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// Removed i18n - using Serbian text directly
import ImageUpload from '@/components/ImageUpload';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { proizvodSchemaStatic } from '@/zod';
import { ZodError } from 'zod';
import { toast } from 'react-hot-toast';
import DodajProizvodSkeleton from '@/components/Skeletoni';
import { TranslationData } from '@/types';


function DodajProizvodPage() {
    const router = useRouter();
    // Removed useTranslation - using direct Serbian text
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
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
        setValidationErrors({});
        // Vrati se na admin stranicu
        router.push('/admin/proizvodi');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationErrors({});

        const serbianTranslation = translations.sr;
        const englishTranslation = translations.en;

        // Validate Serbian translation using Zod schema
        try {
            const schema = proizvodSchemaStatic;
            schema.parse({
                naziv: serbianTranslation.naziv,
                cena: Number(form.cena) || 0,
                slika: form.slika,
                opis: serbianTranslation.opis || '',
                karakteristike: serbianTranslation.karakteristike,
                kategorija: serbianTranslation.kategorija,
                kolicina: Number(form.kolicina) || 0,
            });
        } catch (zodError) {
            const errors: Record<string, string> = {};
            if (zodError instanceof ZodError) {
                zodError.issues.forEach((issue) => {
                    const field = issue.path[0] as string;
                    errors[`sr_${field}`] = issue.message;
                });
            }
            setValidationErrors(errors);
            setError('Molimo ispravite greške u srpskom prevodu.');

            return;
        }

        // Validate English translation using Zod schema
        try {
            const schema = proizvodSchemaStatic;

            schema.parse({
                naziv: englishTranslation.naziv,
                cena: Number(form.cena) || 0,
                slika: form.slika,
                opis: englishTranslation.opis || '',
                karakteristike: englishTranslation.karakteristike,
                kategorija: englishTranslation.kategorija,
                kolicina: Number(form.kolicina) || 0,
            });
        } catch (zodError) {
            const errors = { ...validationErrors };
            if (zodError instanceof ZodError) {
                zodError.issues.forEach((issue) => {
                    const field = issue.path[0] as string;
                    errors[`en_${field}`] = issue.message;
                });
            }
            setValidationErrors(errors);
            setError('Please fix errors in English translation.');
            return;
        }

        // Additional validation checks
        if (!serbianTranslation.naziv || !englishTranslation.naziv) {
            setError('Naziv je obavezan i za srpski i za engleski jezik!');
            return;
        }

        if (!serbianTranslation.kategorija || !englishTranslation.kategorija) {
            setError('Kategorija je obavezna i za srpski i za engleski jezik!');
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
                toast.error(result.error || 'Greška pri kreiranju proizvoda!');
                return;
            }

            router.push('/admin/proizvodi');
            toast.success('Proizvod je uspešno dodat!');
        } catch {
            setError('Greška pri kreiranju proizvoda!');
            toast.error('Greška pri kreiranju proizvoda!');
        }
    };
    return (
        <>
            <DodajProizvodSkeleton />
            <div className="max-w-2xl mx-auto p-8">
                <h2 className="text-2xl text-blue-600 font-semibold mb-6">Dodaj novi proizvod</h2>
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
                                Naziv ({activeLanguage === 'sr' ? 'Srpski' : 'English'}) *
                        </label>
                        <input
                            id="naziv"
                            name="naziv"
                            value={translations[activeLanguage].naziv}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors[`${activeLanguage}_naziv`]
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder={activeLanguage === 'sr' ? 'Naziv proizvoda' : 'Product name'}
                            required
                        />
                        {validationErrors[`${activeLanguage}_naziv`] && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors[`${activeLanguage}_naziv`]}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="kategorija">
                                Kategorija ({activeLanguage === 'sr' ? 'Srpski' : 'English'}) *
                        </label>
                        <input
                            id="kategorija"
                            name="kategorija"
                            value={translations[activeLanguage].kategorija}
                            onChange={handleChange}
                            type="text"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors[`${activeLanguage}_kategorija`]
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder={activeLanguage === 'sr' ? 'Kategorija proizvoda' : 'Product category'}
                            required
                        />
                        {validationErrors[`${activeLanguage}_kategorija`] && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors[`${activeLanguage}_kategorija`]}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="opis">
                                Opis ({activeLanguage === 'sr' ? 'Srpski' : 'English'})
                        </label>
                        <textarea
                            id="opis"
                            name="opis"
                            value={translations[activeLanguage].opis}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors[`${activeLanguage}_opis`]
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder={activeLanguage === 'sr' ? 'Opis proizvoda' : 'Product description'}
                            rows={4}
                        />
                        {validationErrors[`${activeLanguage}_opis`] && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors[`${activeLanguage}_opis`]}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="karakteristike">
                                Karakteristike ({activeLanguage === 'sr' ? 'Srpski' : 'English'})
                        </label>
                        <textarea
                            id="karakteristike"
                            name="karakteristike"
                            value={translations[activeLanguage].karakteristike}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors[`${activeLanguage}_karakteristike`]
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder={activeLanguage === 'sr' ? 'Karakteristike proizvoda' : 'Product features'}
                            rows={4}
                        />
                        {validationErrors[`${activeLanguage}_karakteristike`] && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors[`${activeLanguage}_karakteristike`]}</p>
                        )}
                    </div>
                </div>

                {/* Product metadata (language independent) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 text-gray-700">Osnovne informacije</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="cena">
                                    Cena *
                            </label>
                            <input
                                id="cena"
                                name="cena"
                                type="number"
                                step="0.01"
                                value={form.cena}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors['sr_cena'] || validationErrors['en_cena']
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                placeholder="0.00"
                                required
                            />
                            {(validationErrors['sr_cena'] || validationErrors['en_cena']) && (
                                <p className="text-red-500 text-sm mt-1">
                                    {validationErrors['sr_cena'] || validationErrors['en_cena']}
                                </p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="kolicina">
                                    Količina *
                            </label>
                            <input
                                id="kolicina"
                                name="kolicina"
                                value={form.kolicina}
                                onChange={handleChange}
                                type="number"
                                min="0"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${validationErrors['sr_kolicina'] || validationErrors['en_kolicina']
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                placeholder="0"
                                required
                            />
                            {(validationErrors['sr_kolicina'] || validationErrors['en_kolicina']) && (
                                <p className="text-red-500 text-sm mt-1">
                                    {validationErrors['sr_kolicina'] || validationErrors['en_kolicina']}
                                </p>
                            )}
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
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer"
                    >
                        <FaPlus />
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

                {error && <div className="text-red-600 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

            </form>
        </div>
        </>
    );
}
export default DodajProizvodPage;