'use client'
import React, { useEffect, useState } from 'react'
import { Korisnik } from '@/types';
import toast from 'react-hot-toast';


const KorisniciPage = () => {
    const [korisnici, setKorisnici] = useState<Korisnik[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');


    useEffect(() => {
        const fetchKorisnici = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/korisnici?page=${currentPage}&pageSize=${pageSize}`);
                const data = await response.json();
                console.log('Korisnici data:', data);
                setKorisnici(data.korisnici || []);
                setTotalUsers(data.total || 0);
            } catch (error) {
                console.error('Error fetching korisnici data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchKorisnici();
    }, [currentPage, pageSize]);

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
                toast.success('Korisnik je uspešno obrisan!');

                // Refresh the current page data after deletion
                const response2 = await fetch(`/api/korisnici?page=${currentPage}&pageSize=${pageSize}`);
                const newData = await response2.json();
                setKorisnici(newData.korisnici || []);
                setTotalUsers(newData.total || 0);

                // If current page is empty and not the first page, go to previous page
                if (newData.korisnici.length === 0 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
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

    // Filter korisnici based on search and role
    const filteredUsers = korisnici.filter(korisnik => {
        const matchesSearch = !searchTerm ||
            (korisnik.ime && korisnik.ime.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (korisnik.prezime && korisnik.prezime.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (korisnik.email && korisnik.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRole = !filterRole || korisnik.uloga === filterRole;

        return matchesSearch && matchesRole;
    });

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
                                Ukupno: {totalUsers}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters and Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                Pretraži korisnike
                            </label>
                            <input
                                type="text"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 input-focus"
                                placeholder="Ime, prezime, email..."
                            />
                            {(searchTerm || filterRole) && (
                                <>
                                    <p className="mt-1 text-xs text-gray-500">
                                        ℹ️ {pageSize >= 999999
                                            ? `Pronađeno ${filteredUsers.length} od ${korisnici.length} učitanih korisnika`
                                            : `Filtriranje radi samo na trenutno učitanim korisnicima`
                                        }
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilterRole('');
                                        }}
                                        className="mt-2 text-sm text-blue-600 hover:underline"
                                    >
                                        Resetuj filtere
                                    </button>
                                </>
                            )}
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                Filter po ulozi
                            </label>
                            <select
                                id="role"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm input-focus"
                            >
                                <option value="">Sve uloge</option>
                                <option value="korisnik">Korisnik</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="pageSize" className="block text-sm font-medium text-gray-700 mb-2">
                                Korisnika po stranici
                            </label>
                            <select
                                id="pageSize"
                                value={pageSize}
                                onChange={(e) => {
                                    const newPageSize = Number(e.target.value);
                                    setPageSize(newPageSize);
                                    setCurrentPage(1); // Reset to first page when changing page size
                                }}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm input-focus"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={999999}>Svi (bez paginacije)</option>
                            </select>
                        </div>
                    </div>

                    <div className="text-sm text-gray-600 text-center pt-4 border-t">
                        {(searchTerm || filterRole) ? (
                            pageSize >= 999999
                                ? `Prikazano: ${filteredUsers.length} od ${korisnici.length} učitanih korisnika`
                                : `Filtrirano: ${filteredUsers.length} korisnika na stranici ${currentPage}`
                        ) : (
                            pageSize >= 999999
                                ? `Prikazano: ${korisnici.length} od ${totalUsers} korisnika`
                                : `Stranica ${currentPage} od ${Math.ceil(totalUsers / pageSize)} • ${korisnici.length} od ${totalUsers} korisnika`
                        )}
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
                                {filteredUsers.map((korisnik) => (
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

                    {filteredUsers.length === 0 && !loading && (
                      <div className="text-center py-12">
                            <div className="text-gray-500 text-lg">
                                {(searchTerm || filterRole)
                                    ? 'Nema korisnika koji odgovaraju kriterijumima pretrage'
                                    : 'Nema registrovanih korisnika'
                                }
                            </div>
                            {(searchTerm || filterRole) && (
                                <p className="text-gray-400 text-sm mt-2">
                                    Pokušajte sa različitim kriterijumima pretrage
                                </p>
                            )}
                      </div>
                  )}
              </div>

                {/* Pagination */}
                {totalUsers > pageSize && pageSize < 999999 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Prethodna
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalUsers / pageSize)))}
                                disabled={currentPage === Math.ceil(totalUsers / pageSize)}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sljedeća
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Prikazuje se <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> do{' '}
                                    <span className="font-medium">
                                        {Math.min(currentPage * pageSize, totalUsers)}
                                    </span>{' '}
                                    od <span className="font-medium">{totalUsers}</span> rezultata
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Prethodna</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from({ length: Math.ceil(totalUsers / pageSize) }, (_, i) => i + 1)
                                        .filter(page => {
                                            const totalPages = Math.ceil(totalUsers / pageSize);
                                            if (totalPages <= 7) return true;
                                            if (page <= 2) return true;
                                            if (page >= totalPages - 1) return true;
                                            if (Math.abs(page - currentPage) <= 1) return true;
                                            return false;
                                        })
                                        .map((page, index, array) => {
                                            const prevPage = array[index - 1];
                                            const showDots = prevPage && page - prevPage > 1;

                                            return (
                                                <React.Fragment key={page}>
                                                    {showDots && (
                                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                            ...
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalUsers / pageSize)))}
                                        disabled={currentPage === Math.ceil(totalUsers / pageSize)}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Sljedeća</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
          </div>
      </div>
  )
}

export default KorisniciPage