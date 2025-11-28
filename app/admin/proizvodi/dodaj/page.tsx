'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { noviProizvodSchemaStatic } from '@/zod';
import { ZodError } from 'zod';
import { toast } from 'react-hot-toast';
import { createProizvod } from '@/lib/actions/proizvodi';
import Image from 'next/image';

function DodajProizvodPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [form, setForm] = useState({
        cena: '',
        kolicina: '',
        slike: [] as string[],
    });

    const [formTranslations, setFormTranslations] = useState({
        naziv_sr: '',
        opis_sr: '',
        karakteristike_sr: '',
        kategorija_sr: '',
        naziv_en: '',
        opis_en: '',
        karakteristike_en: '',
        kategorija_en: '',
    });

    const [activeLanguage, setActiveLanguage] = useState<'sr' | 'en'>('sr');
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (['cena', 'kolicina'].includes(name)) {
            setForm({ ...form, [name]: value });
        } else {
            // Mapiraj polja za oba jezika
            const langPrefix = activeLanguage === 'sr' ? '_sr' : '_en';
            setFormTranslations({
                ...formTranslations,
                [`${name}${langPrefix}`]: value
            });
        }
    };

    const handleImageAdd = (imageUrl: string) => {
        setForm((prev) => ({ ...prev, slike: [...prev.slike, imageUrl] }));
    };

    const handleImageRemove = (index: number) => {
        setForm((prev) => ({ ...prev, slike: prev.slike.filter((_, i) => i !== index) }));
    };

    const handleCancel = () => {
        // Resetuj form
        setForm({
            cena: '',
            kolicina: '',
            slike: [],
        });
        setFormTranslations({
            naziv_sr: '',
            opis_sr: '',
            karakteristike_sr: '',
            kategorija_sr: '',
            naziv_en: '',
            opis_en: '',
            karakteristike_en: '',
            kategorija_en: '',
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

        // Pripremi payload za backend
        const payload = {
            cena: Number(form.cena),
            kolicina: Number(form.kolicina),
            slike: form.slike,
            naziv_sr: formTranslations.naziv_sr || '',
            opis_sr: formTranslations.opis_sr || '',
            karakteristike_sr: formTranslations.karakteristike_sr || '',
            kategorija_sr: formTranslations.kategorija_sr || '',
            naziv_en: formTranslations.naziv_en || '',
            opis_en: formTranslations.opis_en || '',
            karakteristike_en: formTranslations.karakteristike_en || '',
            kategorija_en: formTranslations.kategorija_en || '',
        };

        // Validacija celog objekta
        try {
            noviProizvodSchemaStatic.parse(payload);
        } catch (zodError) {
            const errors: Record<string, string> = {};
            if (zodError instanceof ZodError) {
                zodError.issues.forEach((issue) => {
                    errors[issue.path.join('.')] = issue.message;
                });
            }
            setValidationErrors(errors);
            setError('Molimo ispravite greške u formi.');
            return;
        }

        // Additional validation checks
        if (!payload.naziv_sr || !payload.naziv_en) {
            setError('Naziv je obavezan i za srpski i za engleski jezik!');
            return;
        }
        if (!payload.kategorija_sr || !payload.kategorija_en) {
            setError('Kategorija je obavezna i za srpski i za engleski jezik!');
            return;
        }

        startTransition(async () => {
            try {
                console.log('Payload za Server Action:', payload);

                const result = await createProizvod(payload);

                if (result.success) {
                    toast.success('Proizvod je uspešno dodat!');
                    router.push('/admin/proizvodi');
                } else {
                    setError(result.error || 'Greška pri kreiranju proizvoda!');
                    toast.error(result.error || 'Greška pri kreiranju proizvoda!');
                }
            } catch (error) {
                console.error('Error creating product:', error);
                setError('Greška pri kreiranju proizvoda!');
                toast.error('Greška pri kreiranju proizvoda!');
            }
        });
    };

    return (
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
                            🇲🇪 Crnogorski
                            {formTranslations.naziv_sr && formTranslations.kategorija_sr && (
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
                            {formTranslations.naziv_en && formTranslations.kategorija_en && (
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
                            value={activeLanguage === 'sr' ? formTranslations.naziv_sr : formTranslations.naziv_en}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors[`${activeLanguage}_naziv`]
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300'
                                }`}
                            placeholder={activeLanguage === 'sr' ? 'Naziv proizvoda' : 'Product name'}
                            required
                            disabled={isPending}
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
                            value={activeLanguage === 'sr' ? formTranslations.kategorija_sr : formTranslations.kategorija_en}
                            onChange={handleChange}
                            type="text"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors[`${activeLanguage}_kategorija`]
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300'
                                }`}
                            placeholder={activeLanguage === 'sr' ? 'Kategorija proizvoda' : 'Product category'}
                            required
                            disabled={isPending}
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
                            value={activeLanguage === 'sr' ? formTranslations.opis_sr : formTranslations.opis_en}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors[`${activeLanguage}_opis`]
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300'
                                }`}
                            placeholder={activeLanguage === 'sr' ? 'Opis proizvoda' : 'Product description'}
                            rows={4}
                            disabled={isPending}
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
                            value={activeLanguage === 'sr' ? formTranslations.karakteristike_sr : formTranslations.karakteristike_en}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors[`${activeLanguage}_karakteristike`]
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300'
                                }`}
                            placeholder={activeLanguage === 'sr' ? 'Karakteristike proizvoda' : 'Product features'}
                            rows={4}
                            disabled={isPending}
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
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors['sr_cena'] || validationErrors['en_cena']
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300'
                                    }`}
                                placeholder="0.00"
                                required
                                disabled={isPending}
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
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors['sr_kolicina'] || validationErrors['en_kolicina']
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300'
                                    }`}
                                placeholder="0"
                                required
                                disabled={isPending}
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
                    <h3 className="text-lg font-medium mb-4 text-gray-700">Slike proizvoda</h3>
                    <div className="flex flex-wrap gap-4 mb-4">
                        {form.slike.map((img, idx) => (
                            <div key={idx} className="relative group">
                                <Image
                                    src={img}
                                    alt="Slika proizvoda"
                                    width={96}
                                    height={96}
                                    className="w-24 h-24 object-cover rounded border"
                                />
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
                            productId={`new-${Date.now()}`}
                        />
                    </div>
                    <div className="text-sm text-gray-500">Možete dodati više slika. Prva slika će biti glavna.</div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 mt-6">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaPlus />
                        {isPending ? 'Čuva...' : 'Sačuvaj'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isPending}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaTimes />
                        Otkaži
                    </button>
                </div>

                {error && (
                    <div className="text-red-600 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        {error}
                        {/* Prikaz svih grešaka iz validationErrors koje nisu prikazane pored polja */}
                        {Object.entries(validationErrors).length > 0 && (
                            <ul className="mt-2 list-disc list-inside">
                                {Object.entries(validationErrors).map(([key, msg]) => (
                                    <li key={key} className="text-red-500 text-sm">{msg}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

            </form>
        </div>
    );
}

export default DodajProizvodPage;