import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { getKorisnikById } from '@/lib/actions';
import ProfilClient from './ProfilClient';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import Loading from '@/components/Loadning';

async function ProfilServerComponent() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/prijava');
  }

  const result = await getKorisnikById(session.user.id);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Greška pri učitavanju profila</div>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <ProfilClient 
      initialKorisnik={result.data}
      sessionUser={session.user}
    />
  );
}

function ProfilLoading() {
  return <Loading />;
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<ProfilLoading />}>
      <ProfilServerComponent />
    </Suspense>
  );
}