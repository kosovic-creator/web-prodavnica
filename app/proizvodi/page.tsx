import { Suspense } from 'react';
import { getProizvodi } from '@/lib/actions';
import ProizvodiClient from './ProizvodiClient';
import ProizvodiSkeleton from '@/components/ProizvodiSkeleton';


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



export default async function ProizvodiPage({ searchParams }: ProizvodiPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const pageSize = parseInt(resolvedSearchParams.pageSize || '10');
  const lang = resolvedSearchParams.lang || 'sr';

  return (
    <Suspense fallback={<ProizvodiSkeleton />}>
      <ProizvodiServerComponent
        page={page}
        pageSize={pageSize}
        lang={lang}
      />
    </Suspense>
  );
}