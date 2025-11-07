import { getServerSession } from 'next-auth';
import { getKorisnikById } from '@/lib/actions';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import { FaUser, FaEdit } from 'react-icons/fa';
import Link from 'next/link';
import DeleteButton from './DeleteButton';

export default async function ProfilPage() {
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

  const korisnik = result.data;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 text-center justify-center">
          <FaUser className="text-blue-600" />
          Profil
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Email</span>
                  <p className="text-base text-gray-800">{korisnik.email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Ime</span>
                  <p className="text-base text-gray-800">{korisnik.ime}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Prezime</span>
                  <p className="text-base text-gray-800">{korisnik.prezime}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Telefon</span>
                  <p className="text-base text-gray-800">{korisnik.podaciPreuzimanja?.telefon || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Uloga</span>
                  <p className="text-base text-gray-800">{korisnik.uloga}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Država</span>
                  <p className="text-base text-gray-800">{korisnik.podaciPreuzimanja?.drzava || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Grad</span>
                  <p className="text-base text-gray-800">{korisnik.podaciPreuzimanja?.grad || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Poštanski broj</span>
                  <p className="text-base text-gray-800">{korisnik.podaciPreuzimanja?.postanskiBroj || '-'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Adresa</span>
                  <p className="text-base text-gray-800">{korisnik.podaciPreuzimanja?.adresa || '-'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
              <Link
                href="/profil/edit"
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base font-medium"
              >
                <FaEdit />
                Izmeni profil
              </Link>
              <DeleteButton userId={session.user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}