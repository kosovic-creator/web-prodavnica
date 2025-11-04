import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { getPodaciPreuzimanja } from '@/lib/actions';
import PodaciPreuzimanjaClient from './PodaciPreuzimanjaClient';

export default async function PodaciPreuzimanjaPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect unauthenticated users to login
  if (!session?.user?.id) {
    redirect('/auth/prijava');
  }

  // Get existing delivery data on server-side
  const result = await getPodaciPreuzimanja(session.user.id);

  return (
    <PodaciPreuzimanjaClient 
      session={session}
      initialPodaci={result.success && result.data ? result.data : null}
    />
  );
}