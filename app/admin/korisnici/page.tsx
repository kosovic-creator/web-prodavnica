'use client'
import React, { useEffect, useState } from 'react'
import { Korisnik } from '@/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const KorisniciPage = () => {
    const [korisnici, setKorisnici] = useState<Korisnik[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/korisnici')
            .then(response => response.json())
            .then(data => {
                console.log('Korisnici data:', data);
                setKorisnici(data.korisnici || []);
            })
            .catch(error => {
                console.error('Error fetching korisnici data:', error);
      })
          .finally(() => setLoading(false));
  }, []);

    const handleDeleteKorisnik = async (id: string) => {
        if (!confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) {
            return;
        }

        try {
            const response = await fetch(`/api/korisnici/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Korisnik obrisan:', data);
                // Update local state to remove the deleted user
                setKorisnici(prevKorisnici => prevKorisnici.filter(korisnik => korisnik.id !== id));
                toast.success('Korisnik je uspešno obrisan!');
                router.push('/admin/korisnici'); // Redirect to users list after deletion
            } else {
                const errorData = await response.json();
                if (response.status === 409) {
                    // Conflict - user has orders
                    toast.error(`${errorData.error} (Porudžbina: ${errorData.ordersCount})`);
                } else {
                    toast.error(`Greška pri brisanju: ${errorData.error}`);
                }
            }
        } catch (error) {
            console.error('Error deleting korisnik:', error);
            toast.error('Došlo je do greške prilikom brisanja korisnika');
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('sr-RS');
    };

    if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
}
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Upravljanje korisnicima</h1>
                            <p className="text-gray-600 mt-1">Pregled i upravljanje registrovanim korisnicima</p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                Ukupno: {korisnici.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Korisnik
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Uloga
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lokacija
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Registrovan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Akcije
                                    </th>
                                </tr>
                            </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                              {korisnici.map((korisnik) => (
                                  <tr key={korisnik.id} className="hover:bg-gray-50 transition-colors duration-200">
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center">
                                              <div className="flex-shrink-0 h-10 w-10">
                                                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 flex items-center justify-center">
                                                      <span className="text-sm font-medium text-white">
                                                          {korisnik.ime ? korisnik.ime.charAt(0).toUpperCase() : 'N'}
                                                      </span>
                                                  </div>
                                              </div>
                                              <div className="ml-4">
                                                  <div className="text-sm font-medium text-gray-900">
                                                      {korisnik.ime || 'N/A'} {korisnik.prezime}
                                                  </div>
                                                  <div className="text-sm text-gray-500 truncate max-w-[150px]">
                                                      ID: {korisnik.id.slice(0, 8)}...
                                                  </div>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="text-sm text-gray-900">{korisnik.email}</div>
                                          <div className="text-sm text-gray-500">{korisnik.telefon}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${korisnik.uloga === 'admin'
                                                  ? 'bg-red-100 text-red-800'
                                                  : 'bg-blue-100 text-blue-800'
                                              }`}>
                                              {korisnik.uloga}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          <div>{korisnik.grad}</div>
                                          <div className="text-gray-500">{korisnik.drzava}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${korisnik.emailVerifikovan
                                                  ? 'bg-green-100 text-green-800'
                                                  : 'bg-yellow-100 text-yellow-800'
                                              }`}>
                                              {korisnik.emailVerifikovan ? 'Verifikovan' : 'Nije verifikovan'}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {formatDate(korisnik.kreiran.toString())}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium cursor-pointer">
                                          <button
                                              onClick={() => handleDeleteKorisnik(korisnik.id)}
                                              className="text-red-600 hover:text-red-900"
                                          >
                                              Obriši
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>

                  {korisnici.length === 0 && (
                      <div className="text-center py-12">
                          <div className="text-gray-500 text-lg">Nema registrovanih korisnika</div>
                      </div>
                  )}
              </div>
          </div>
      </div>
  )
}

export default KorisniciPage