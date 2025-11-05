'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProizvodServerAction } from '@/types';

interface SimpleImagePageProps {
  proizvod: ProizvodServerAction;
}

export default function SimpleImagePage({ proizvod }: SimpleImagePageProps) {
  const router = useRouter();

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        router.back();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-6xl max-h-[90vh] relative">
        <button
          onClick={() => router.back()}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold"
        >
          ✕ Zatvori
        </button>

        {proizvod.slika && (
          <img
            src={proizvod.slika}
            alt={proizvod.naziv_sr || 'Proizvod'}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{ minWidth: '300px', minHeight: '300px' }}
          />
        )}

        <div className="mt-4 text-center text-white">
          <h2 className="text-xl font-bold">{proizvod.naziv_sr}</h2>
          <p className="text-sm opacity-75 mt-2">Pritisnite ESC ili kliknite Zatvori za povratak</p>
        </div>
      </div>
    </div>
  );
}