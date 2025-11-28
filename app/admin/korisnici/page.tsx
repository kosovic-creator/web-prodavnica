import { getKorisnici } from '@/lib/actions/korisnici';
import DeleteButton from './DeleteButton';
import { Suspense } from 'react';

interface Korisnik {
  id: string;
  ime: string;
  prezime: string;
  email: string;
  uloga: string;
  kreiran: Date;
  podaciPreuzimanja: {
    id: string;
    korisnikId: string;
    kreiran: Date;
    azuriran: Date;
    adresa: string;
    grad: string;
    drzava: string;
    telefon: string;
    postanskiBroj: number;
  } | null;
};

async function KorisniciTable({ page = 1, pageSize = 10 }: { page?: number, pageSize?: number }) {
  const result = await getKorisnici(page, pageSize);

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-8 text-red-600">
        {result.error || 'Greška pri učitavanju korisnika'}
      </div>
    );
  }

  const { korisnici, total } = result.data;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>


     {/* Korisnici tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ime i Prezime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uloga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum registracije
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {korisnici.map((korisnik: Korisnik) => (
                <tr key={korisnik.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {korisnik.ime} {korisnik.prezime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{korisnik.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      korisnik.uloga === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {korisnik.uloga}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {korisnik.podaciPreuzimanja ? (
                      <div>
                        <div>{korisnik.podaciPreuzimanja.adresa}</div>
                        <div className="text-xs text-gray-500">
                          {korisnik.podaciPreuzimanja.grad}, {korisnik.podaciPreuzimanja.drzava}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Nema podataka</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {korisnik.podaciPreuzimanja?.telefon || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(korisnik.kreiran).toLocaleDateString('sr-RS')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <DeleteButton
                      korisnikId={korisnik.id}
                      korisnikIme={`${korisnik.ime} ${korisnik.prezime}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginacija info */}
      <div className="mt-4 text-sm text-gray-600">
        Ukupno korisnika: {total} | Stranica {page} od {totalPages}
      </div>
    </>
  );
}

export default async function AdminKorisniciPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Upravljanje korisnicima</h1>
        {/* <Link
          href="/admin/korisnici/dodaj"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Dodaj Korisnika
        </Link> */}
      </div>

      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      }>
        <KorisniciTable />
      </Suspense>
    </div>
  );
}