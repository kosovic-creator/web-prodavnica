'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes, FaSave, FaBox } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import ImageUpload from '@/components/ImageUpload';

export default function DodajProizvodModalClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    naziv_sr: '',
    naziv_en: '',
    opis_sr: '',
    opis_en: '',
    kategorija_sr: '',
    kategorija_en: '',
    cena: '',
    kolicina: '',
    slika: ''
  });

  const handleClose = () => {
    router.back();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleImageChange = (imageUrl: string) => {
    setForm((prev) => ({ ...prev, slika: imageUrl }));
  };

  const handleImageRemove = () => {
    setForm((prev) => ({ ...prev, slika: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        cena: form.cena ? parseFloat(form.cena) : 0,
        kolicina: form.kolicina ? parseInt(form.kolicina) : 0,
      };
      const res = await fetch('/api/proizvodi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Proizvod je uspešno dodat!');
        handleClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Greška pri dodavanju proizvoda');
      }
    } catch {
      toast.error('Greška pri dodavanju proizvoda');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaBox className="text-blue-600 text-xl" />
            <h2 className="text-2xl font-bold text-gray-900">Brzo dodavanje proizvoda</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naziv (Srpski) *
              </label>
              <input
                type="text"
                name="naziv_sr"
                value={form.naziv_sr}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Unesite naziv proizvoda"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naziv (Engleski)
              </label>
              <input
                type="text"
                name="naziv_en"
                value={form.naziv_en}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
              />
            </div>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cijena (€) *
              </label>
              <input
                type="number"
                name="cena"
                value={form.cena}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Količina *
              </label>
              <input
                type="number"
                name="kolicina"
                value={form.kolicina}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorija (Srpski)
              </label>
              <input
                type="text"
                name="kategorija_sr"
                value={form.kategorija_sr}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="npr. bicikla, patike..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorija (Engleski)
              </label>
              <input
                type="text"
                name="kategorija_en"
                value={form.kategorija_en}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. bike, shoes..."
              />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opis (Srpski)
            </label>
            <textarea
              name="opis_sr"
              value={form.opis_sr}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Krataki opis proizvoda..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opis (Engleski)
            </label>
            <textarea
              name="opis_en"
              value={form.opis_en}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Short product description..."
            />
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

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <FaSave className="w-4 h-4" />
              Sačuvaj proizvod
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Otkaži
            </button>
          </div>

          {/* Full Form Link */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/admin/proizvodi/dodaj')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Otvori kompletan form za dodavanje →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}