import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { getKorpa } from '@/lib/actions';
import KorpaClient from './KorpaClient';

export default async function KorpaPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect unauthenticated users to login
  if (!session?.user?.id) {
    redirect('/auth/prijava');
  }

  // Get cart items on server-side
  const result = await getKorpa(session.user.id);

  return (
    <KorpaClient 
      session={session}
      initialStavke={result.success && result.data ? result.data.stavke : []}
    />
  );
}