import { Suspense } from 'react';
import { getProizvodById } from '@/lib/actions';
import ProizvodClient from './ProizvodClient';
import { notFound } from 'next/navigation';

interface ProizvodPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    lang?: string;
  }>;
}

async function ProizvodServerComponent({ id, lang }: { id: string; lang: string }) {
  const result = await getProizvodById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <ProizvodClient
      proizvod={result.data}
      lang={lang}
    />
  );
}

function ProizvodLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-4">
        {/* Back button skeleton */}
        <div className="mb-6">
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Image skeleton */}
            <div className="md:w-1/2 p-8">
              <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="mt-3 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Content skeleton */}
            <div className="md:w-1/2 p-8 space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>

              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>

              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProizvodPage({ params, searchParams }: ProizvodPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const lang = resolvedSearchParams.lang || 'sr';

  return (
    <Suspense fallback={<ProizvodLoading />}>
      <ProizvodServerComponent
        id={resolvedParams.id}
        lang={lang}
      />
    </Suspense>
  );
}
