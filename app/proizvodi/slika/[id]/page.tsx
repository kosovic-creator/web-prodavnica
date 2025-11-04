import { Suspense } from 'react';
import { getProizvodById } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

interface SlikaPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    lang?: string;
  }>;
}

async function SlikaServerComponent({ id, lang }: { id: string; lang: string }) {
  const result = await getProizvodById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const proizvod = result.data;

  // Proverava da li proizvod ima sliku
  if (!proizvod.slika) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Slika nije dostupna</div>
          <Link
            href={`/proizvodi/${id}?lang=${lang}`}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Nazad na proizvod
          </Link>
        </div>
      </div>
    );
  }

  const naziv = lang === 'en' ? proizvod.naziv_en : proizvod.naziv_sr;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto p-4">
        {/* Dugme za nazad */}
        <Link
          href={`/proizvodi/${proizvod.id}?lang=${lang}`}
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-700 transition"
        >
          <FaArrowLeft />
          Nazad na proizvod
        </Link>

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

          {/* Informacije o proizvodu ispod slike */}
          <div className="mt-6 text-center">
            <div className="text-xl font-bold text-blue-700 mb-2">{proizvod.cena} €</div>
            <div className={`text-sm font-semibold ${proizvod.kolicina === 0 ? 'text-red-600' : 'text-green-600'}`}>
              {proizvod.kolicina === 0 ? 'Nema na zalihama' : `Dostupno: ${proizvod.kolicina}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlikaLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto p-4">
        {/* Back button skeleton */}
        <div className="mb-6">
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Title skeleton */}
        <div className="mb-6 flex justify-center">
          <div className="w-64 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Image skeleton */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function SlikaPage({ params, searchParams }: SlikaPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const lang = resolvedSearchParams.lang || 'sr';

  return (
    <Suspense fallback={<SlikaLoading />}>
      <SlikaServerComponent
        id={resolvedParams.id}
        lang={lang}
      />
    </Suspense>
  );
}