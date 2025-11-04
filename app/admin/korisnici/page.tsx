'use client';

import { useState, useEffect, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { getKorisnici, deleteKorisnik } from '@/lib/actions/korisnici';

type Korisnik = {
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

export default function AdminKorisniciPage() {
  const [korisnici, setKorisnici] = useState<Korisnik[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; korisnikId: string; ime: string }>({ 
    isOpen: false, 
    korisnikId: '', 
    ime: '' 
  });
  
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await getKorisnici(currentPage, pageSize);
        if (result.success && result.data) {
          setKorisnici(result.data.korisnici);
          setTotalCount(result.data.total);
        } else {
          toast.error(result.error || 'Greška pri učitavanju korisnika');
        }
      } catch (error) {
        console.error('Error fetching korisnici data:', error);
        toast.error('Greška pri učitavanju korisnika');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, pageSize]);

  const confirmDelete = (korisnikId: string, ime: string) => {
    setDeleteModal({ isOpen: true, korisnikId, ime });
  };

  const handleDelete = async () => {
    if (!deleteModal.korisnikId) return;

    startTransition(async () => {
      try {
        const result = await deleteKorisnik(deleteModal.korisnikId);
        
        if (result.success) {
          toast.success(result.message || 'Korisnik je uspešno obrisan');
          setDeleteModal({ isOpen: false, korisnikId: '', ime: '' });
          // Refetch data
          const refreshResult = await getKorisnici(currentPage, pageSize);
          if (refreshResult.success && refreshResult.data) {
            setKorisnici(refreshResult.data.korisnici);
            setTotalCount(refreshResult.data.total);
          }
        } else {
          toast.error(result.error || 'Greška pri brisanju korisnika');
        }
      } catch (error) {
        console.error('Error deleting korisnik:', error);
        toast.error('Greška pri brisanju korisnika');
      }
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={loading}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  if (loading && korisnici.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Upravljanje korisnicima</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Upravljanje korisnicima</h1>
        <div className="text-sm text-gray-600">
          Ukupno korisnika: {totalCount}
        </div>
      </div>

      {/* Tabela korisnika */}
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
              {korisnici.map((korisnik) => (
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
                    <button
                      onClick={() => confirmDelete(korisnik.id, `${korisnik.ime} ${korisnik.prezime}`)}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      disabled={isPending}
                    >
                      {isPending ? 'Briše...' : 'Obriši'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginacija */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prethodno
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sledeće
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Prikazano <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> do{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{' '}
                od <span className="font-medium">{totalCount}</span> rezultata
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Prethodno</span>
                  &larr;
                </button>
                
                <div className="flex space-x-1 px-2">
                  {renderPageNumbers()}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Sledeće</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modal za potvrdu brisanja */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Potvrda brisanja</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Da li ste sigurni da želite da obrišete korisnika <strong>{deleteModal.ime}</strong>?
                  Ova akcija se ne može poništiti.
                </p>
              </div>
              <div className="flex justify-center gap-3 px-4 py-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, korisnikId: '', ime: '' })}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  disabled={isPending}
                >
                  Otkaži
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  disabled={isPending}
                >
                  {isPending ? 'Briše...' : 'Obriši'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}