import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { getPorudzbineKorisnika } from '@/lib/actions';
import MojePorudzbineClient from './MojePorudzbineClient';

interface MojePorudzbinePageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    lang?: string;
  }>;
}

export default async function MojePorudzbinePage({ searchParams }: MojePorudzbinePageProps) {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to login
  if (!session?.user?.id) {
    redirect('/auth/prijava');
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const pageSize = parseInt(resolvedSearchParams.pageSize || '10');
  const lang = resolvedSearchParams.lang || 'sr';

  // Get user orders on server-side
  const result = await getPorudzbineKorisnika(session.user.id, page, pageSize);

  return (
    <MojePorudzbineClient
      initialPorudzbine={result.success ? result.data?.porudzbine || [] : []}
      initialTotal={result.success ? result.data?.total || 0 : 0}
      initialPage={page}
      pageSize={pageSize}
      lang={lang}
      session={session}
    />
  );
}