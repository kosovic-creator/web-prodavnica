'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Proizvod } from '@/types';
import { FaArrowLeft } from 'react-icons/fa';

export default function SlikaPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = searchParams?.get('lang') || 'sr';

  const id = params && typeof params.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : undefined;
  const [proizvod, setProizvod] = useState<Proizvod | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProizvod() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/proizvodi/${id}`);
        const data = await res.json();
        setProizvod(data.error ? null : data);
      } catch (error) {
        console.error('Greška pri učitavanju proizvoda:', error);
        setProizvod(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProizvod();
  }, [id]);

  const handleNazad = () => {
    router.push(`/proizvodi/${id}?lang=${lang}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Učitavanje...</div>
      </div>
    );
  }

  if (!proizvod || !proizvod.slika) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-lg">Slika nije dostupna</div>
      </div>
    );
  }

  const naziv = lang === 'en' ? proizvod.naziv_en : proizvod.naziv_sr;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto p-4">
        {/* Dugme za nazad */}
        <button
          onClick={handleNazad}
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-700 transition"
        >
          <FaArrowLeft />
          Nazad na proizvod
        </button>

        {/* Naslov */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {naziv}
        </h1>

        {/* Slika */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center">
            <Image
              src={proizvod.slika}
              alt={naziv || 'Slika proizvoda'}
              width={1200}
              height={800}
              className="max-w-full h-auto object-contain rounded-lg shadow-md"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}