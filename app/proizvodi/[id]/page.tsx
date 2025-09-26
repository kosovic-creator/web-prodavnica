'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Proizvod } from '@/types';

export default function ProizvodPage() {
  const params = useParams();
  const id = params && typeof params.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : undefined;
  const [proizvod, setProizvod] = useState<Proizvod | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProizvod() {
      setLoading(true);
      const res = await fetch(`/api/proizvodi/${id}`);
      const data = await res.json();
      setProizvod(data.error ? null : data);
      setLoading(false);
    }
    if (id) fetchProizvod();
  }, [id]);

  if (loading) return <div className="p-4">Učitavanje...</div>;
  if (!proizvod) return <div className="p-4 text-red-600">Proizvod nije pronađen.</div>;

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      {proizvod.slika && (
        <Image src={proizvod.slika} alt={proizvod.naziv} width={320} height={240} className="mb-4 rounded" />
      )}
      <h1 className="text-2xl font-bold mb-2">{proizvod.naziv}</h1>
      <div className="text-lg font-semibold mb-2">Cena: {proizvod.cena} EUR</div>
      <div className="mb-2">Opis: {proizvod.opis}</div>
      <div className="mb-2">Karakteristike: {proizvod.karakteristike}</div>
      <div className="mb-2">Kategorija: {proizvod.kategorija}</div>
      <div className="mb-2">Količina: {proizvod.kolicina}</div>
    </div>
  );
}
