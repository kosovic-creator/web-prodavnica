/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProizvodi } from '@/lib/actions';
import { Suspense } from 'react';
import Image from 'next/image';

interface ProizvodiPageProps {
  searchParams: {
    page?: string;
    pageSize?: string;
  };
}

async function ProizvodiLista({ page, pageSize }: { page: number; pageSize: number }) {
  const result = await getProizvodi(page, pageSize);

  if (!result.success || !result.data) {
    return <div className="text-red-500">Greška: {result.error}</div>;
  }

  const { proizvodi, total } = result.data;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Proizvodi</h1>

      <div className="mb-4 text-gray-600">
        Ukupno: {total} proizvoda
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proizvodi.map((proizvod: any) => (
          <div key={proizvod.id} className="border rounded-lg p-4">
            {proizvod.slika && (
              <Image
                src={proizvod.slika}
                alt={proizvod.naziv_sr}
                width={300}
                height={200}
                className="w-full h-48 object-cover mb-2 rounded"
              />
            )}
            <h3 className="font-semibold text-lg">{proizvod.naziv_sr}</h3>
            <p className="text-gray-600">{proizvod.opis_sr}</p>
            <p className="text-xl font-bold text-green-600">{proizvod.cena} RSD</p>
            <p className="text-sm text-gray-500">Dostupno: {proizvod.kolicina}</p>
            <p className="text-sm text-gray-500">Kategorija: {proizvod.kategorija_sr}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProizvodiSkeleton() {
  return (
    <div>
      <div className="h-8 bg-gray-200 rounded mb-4 w-32"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="w-full h-48 bg-gray-200 mb-2 rounded"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProizvodiPage({ searchParams }: ProizvodiPageProps) {
  const page = parseInt(searchParams.page || '1');
  const pageSize = parseInt(searchParams.pageSize || '10');

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<ProizvodiSkeleton />}>
        <ProizvodiLista page={page} pageSize={pageSize} />
      </Suspense>
    </div>
  );
}