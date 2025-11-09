
import { getProizvodById } from '@/lib/actions';
import { notFound } from 'next/navigation';
import ProizvodClient from './ProizvodClient';

// This is a hybrid server/client page
export default async function ProizvodPage({ params, searchParams }: { params: { id: string }, searchParams: { lang?: string } }) {
  const lang = searchParams?.lang || 'sr';
  const result = await getProizvodById(params.id);
  if (!result.success || !result.data) notFound();
  const proizvod = result.data;

  // Render server + client boundary
  return <ProizvodClient proizvod={proizvod} lang={lang} />;
}
