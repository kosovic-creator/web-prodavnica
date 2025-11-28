'use client';

import React, { useEffect, useState } from 'react';
import { getProizvodById } from '@/lib/actions/proizvodi';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { FaEdit, FaBox, FaEuroSign, FaCalendar, FaLanguage, FaTag } from 'react-icons/fa';
import Link from 'next/link';

type Proizvod = {
  id: string;
  cena: number;
  slika: string | null;
  kolicina: number;
  kreiran: Date;
  azuriran: Date;
  naziv_sr: string | null;
  naziv_en: string | null;
  opis_sr: string | null;
  opis_en: string | null;
  karakteristike_sr: string | null;
  karakteristike_en: string | null;
  kategorija_sr: string | null;
  kategorija_en: string | null;
};

interface PregledProizvodaClientProps {
  id: string;
}

export default function PregledProizvodaClient({ id }: PregledProizvodaClientProps) {
  const [proizvod, setProizvod] = useState<Proizvod | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState<'sr' | 'en'>('sr');

  useEffect(() => {
    const loadProizvod = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const result = await getProizvodById(id);

        if (result.success && result.data) {
          // Map 'slike' array to 'slika' property for Proizvod type
          const data = {
            ...result.data,
            slika: Array.isArray(result.data.slike) && result.data.slike.length > 0 ? result.data.slike[0] : null,
          };
          setProizvod(data as Proizvod);
        } else {
          toast.error(result.error || 'Greška pri učitavanju proizvoda');
        }
      } catch (error) {
        console.error('Error loading proizvod:', error);
        toast.error('Greška pri učitavanju proizvoda');
      } finally {
        setLoading(false);
      }
    };

    loadProizvod();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Nema na stanju', icon: '❌' };
    } else if (quantity < 5) {
      return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Malo na stanju', icon: '⚠️' };
    } else {
      return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Dostupno', icon: '✅' };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!proizvod) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Proizvod nije pronađen</div>
          <Link
            href="/admin/proizvodi"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Vrati se na listu
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(proizvod.kolicina);

  return (
    <div className="space-y-6">
      {/* Product Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {proizvod[`naziv_${activeLanguage}`] || proizvod.naziv_sr || 'Bez naziva'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <FaTag className="w-4 h-4" />
                ID: {proizvod.id}
              </span>
              <span className="flex items-center gap-1">
                <FaCalendar className="w-4 h-4" />
                Kreiran: {formatDate(proizvod.kreiran)}
              </span>
            </div>

            {/* Language Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveLanguage('sr')}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  activeLanguage === 'sr'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FaLanguage className="w-3 h-3" />
                Srpski
              </button>
              <button
                onClick={() => setActiveLanguage('en')}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  activeLanguage === 'en'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FaLanguage className="w-3 h-3" />
                English
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4 lg:mt-0">
            <Link
              href={`/admin/proizvodi/izmeni/${proizvod.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaEdit className="w-4 h-4" />
              Izmeni
            </Link>
          </div>
        </div>
      </div>

      {/* Product Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Slika proizvoda</h3>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {proizvod.slika ? (
                <Image
                  src={proizvod.slika}
                  alt={proizvod[`naziv_${activeLanguage}`] || 'Proizvod'}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FaBox className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Osnovne informacije</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaEuroSign className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Cijena</p>
                  <p className="text-xl font-bold text-blue-900">{formatCurrency(proizvod.cena)}</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-4 rounded-lg border ${stockStatus.color}`}>
                <div className="text-2xl">{stockStatus.icon}</div>
                <div>
                  <p className="text-sm font-medium">Na stanju</p>
                  <p className="text-xl font-bold">{proizvod.kolicina} kom</p>
                  <p className="text-xs">{stockStatus.text}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategorija</h3>
            <div className="inline-flex px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              {proizvod[`kategorija_${activeLanguage}`] || proizvod.kategorija_sr || 'Nema kategorije'}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Opis</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {proizvod[`opis_${activeLanguage}`] || proizvod.opis_sr || 'Nema opisa'}
              </p>
            </div>
          </div>

          {/* Features */}
          {(proizvod[`karakteristike_${activeLanguage}`] || proizvod.karakteristike_sr) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Karakteristike</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {proizvod[`karakteristike_${activeLanguage}`] || proizvod.karakteristike_sr}
                </p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metapodaci</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Kreiran:</span>
                <div className="font-medium">{formatDate(proizvod.kreiran)}</div>
              </div>
              <div>
                <span className="text-gray-600">Poslednja izmjena:</span>
                <div className="font-medium">{formatDate(proizvod.azuriran)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}