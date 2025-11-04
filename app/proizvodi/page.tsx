import { Suspense } from 'react';
import { getProizvodi } from '@/lib/actions';
import ProizvodiClient from './ProizvodiClient';
import ProductSkeleton from '@/components/Skeletoni';

interface ProizvodiPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    lang?: string;
  }>;
}

async function ProizvodiServerComponent({ page, pageSize, lang }: {
  page: number;
  pageSize: number;
  lang: string;
}) {
  const result = await getProizvodi(page, pageSize);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-red-500 py-12">
            <p className="text-lg">Greška pri učitavanju proizvoda: {result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { proizvodi, total } = result.data;

  return (
    <ProizvodiClient
      initialProizvodi={proizvodi}
      initialTotal={total}
      initialPage={page}
      pageSize={pageSize}
      lang={lang}
    />
  );
}

function ProizvodiLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ProizvodiPage({ searchParams }: ProizvodiPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const pageSize = parseInt(resolvedSearchParams.pageSize || '10');
  const lang = resolvedSearchParams.lang || 'sr';

  return (
    <Suspense fallback={<ProizvodiLoading />}>
      <ProizvodiServerComponent
        page={page}
        pageSize={pageSize}
        lang={lang}
      />
    </Suspense>
  );
}