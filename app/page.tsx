import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { getProizvodi } from '@/lib/actions';
import HomeClient from './HomeClient';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Redirect admin users to /admin
  if (session?.user?.uloga === 'admin') {
    redirect('/admin');
  }

  // Get products on server-side
  const result = await getProizvodi(1, 12); // First page with limit to 12 for home page

  return (
    <HomeClient
      initialProizvodi={result.success ? result.data?.proizvodi || [] : []}
      session={session}
    />
  );
}