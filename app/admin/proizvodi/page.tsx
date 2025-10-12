'use client';
import React, { useEffect, useState } from 'react'
import { Proizvod } from '@/types';


import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Loading from '@/components/Loadning';

const ProizvodPage = () => {
  const router = useRouter();
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    proizvodId: '',
    proizvodNaziv: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);




  useEffect(() => {
    const fetchProizvodi = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/proizvodi?page=${currentPage}&pageSize=${pageSize}`);
        const data = await response.json();
        console.log('Proizvodi data:', data);
        setProizvodi(data.proizvodi || []);
        setTotalProducts(data.total || 0);
      } catch (error) {
        console.error('Error fetching proizvodi data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProizvodi();
  }, [currentPage, pageSize]);

  const openDeleteModal = (id: string, naziv: string) => {
    setDeleteModal({
      isOpen: true,
      proizvodId: id,
      proizvodNaziv: naziv
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      proizvodId: '',
      proizvodNaziv: ''
    });
  };

  const handleProizvodDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/proizvodi/${deleteModal.proizvodId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Product deleted:", data);
        toast.success('Proizvod je uspešno obrisan!');

        // Refresh the current page data after deletion
        const response2 = await fetch(`/api/proizvodi?page=${currentPage}&pageSize=${pageSize}`);
        const newData = await response2.json();
        setProizvodi(newData.proizvodi || []);
        setTotalProducts(newData.total || 0);

        // If current page is empty and not the first page, go to previous page
        if (newData.proizvodi.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        closeDeleteModal();
      } else {
        const errorData = await response.json();
        toast.error(`Greška pri brisanju: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Došlo je do greške pri brisanju proizvoda.');
    } finally {
      setIsDeleting(false);
    }
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { color: 'bg-red-100 text-red-800', text: 'Nema na stanju' };
    } else if (quantity < 5) {
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Malo na stanju' };
    } else {
      return { color: 'bg-green-100 text-green-800', text: 'Dostupno' };
    }
  };

  // Get unique categories from current page
  // Pretpostavljam da je default srpski, može se proširiti za en
  const categories = Array.from(new Set(proizvodi.map(p => p.kategorija)));

  // Note: With pagination, filtering should be done server-side for better performance
  // For now, we'll use client-side filtering for the current page only
  const filteredProducts = proizvodi.filter(proizvod => {
    const matchesSearch = (proizvod.naziv?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (proizvod.opis?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || proizvod.kategorija === filterCategory;
    return matchesSearch && matchesCategory;
  });


    if (loading) {
        return <Loading />;
    }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upravljanje proizvodima</h1>
              <p className="text-gray-600 mt-1">Pregled i upravljanje inventarom proizvoda</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 input-focusfocus:ring-offset-2 input-focuscursor-pointer" onClick={() => router.push(`/admin/proizvodi/dodaj`)}>
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Dodaj proizvod
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Ukupno proizvoda</p>
                <p className="text-2xl font-semibold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{pageSize >= 999999 ? 'Način prikaza' : 'Stranica'}</p>
                <p className="text-2xl font-semibold text-gray-900">{pageSize >= 999999 ? 'Svi' : currentPage}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Po stranici</p>
                <p className="text-2xl font-semibold text-gray-900">{pageSize >= 999999 ? 'Sve' : pageSize}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Na stranici</p>
                <p className="text-2xl font-semibold text-gray-900">{proizvodi.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Pretraži proizvode
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 input-focus"
                placeholder="Unesite naziv ili opis proizvoda..."
              />
              {(searchTerm || filterCategory) && (
                <>
                  <p className="mt-1 text-xs text-gray-500">
                    ℹ️ {pageSize >= 999999
                      ? `Pretražuje se kroz sve proizvode (${proizvodi.length} učitano)`
                      : `Pretražuje se samo trenutna stranica (${proizvodi.length} od ${totalProducts} proizvoda)`
                    }
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('');
                    }}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Resetuj filtere
                  </button>
                </>
              )}
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Filter po kategoriji
              </label>
              <select
                id="category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm input-focus"
              >
                <option value="">Sve kategorije</option>
                {categories.map((category, idx) => (
                  <option key={category || idx} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pageSize" className="block text-sm font-medium text-gray-700 mb-2">
                Proizvoda po stranici
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
                <option value={999999}>Sve (bez paginacije)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naziv</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorija</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Na stanju</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kreiran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcije</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((proizvod) => {
                  const stockStatus = getStockStatus(proizvod.kolicina);
                  return (
                    <tr key={proizvod.id} className="hover:bg-gray-50 transition-colors duration-200">
                      {/* Naziv */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-[200px] truncate">
                        {proizvod.naziv_sr}
                      </td>
                      {/* Opis */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[200px] truncate">
                        {proizvod.opis_sr}
                      </td>
                      {/* Kategorija */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {proizvod.kategorija_sr || 'Nema kategorije'}
                        </span>
                      </td>
                      {/* Cena */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(proizvod.cena)}
                        </div>
                      </td>
                      {/* Na stanju */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {proizvod.kolicina} kom
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      {/* Kreiran */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(proizvod.kreiran?.toString() ?? "")}
                      </td>
                      {/* Akcije */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3  cursor-pointer" onClick={() => router.push(`/admin/proizvodi/izmeni/${proizvod.id}`)}>
                          Izmeni
                        </button>
                        <button className="text-red-600 hover:text-red-900 cursor-pointer" onClick={() => openDeleteModal(proizvod.id, `${proizvod.naziv_sr || ''}`.trim() || proizvod.id)}>
                          Obriši
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {searchTerm || filterCategory ? 'Nema proizvoda koji odgovaraju kriterijumima' : 'Nema proizvoda'}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalProducts > pageSize && pageSize < 999999 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prethodna
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalProducts / pageSize)))}
                disabled={currentPage === Math.ceil(totalProducts / pageSize)}
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
                    {Math.min(currentPage * pageSize, totalProducts)}
                  </span>{' '}
                  od <span className="font-medium">{totalProducts}</span> proizvoda
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
                  {Array.from({ length: Math.ceil(totalProducts / pageSize) }, (_, i) => i + 1)
                    .filter(page => {
                      const totalPages = Math.ceil(totalProducts / pageSize);
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalProducts / pageSize)))}
                    disabled={currentPage === Math.ceil(totalProducts / pageSize)}
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

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleProizvodDelete}
          title="Brisanje proizvoda"
          message={`Da li ste sigurni da želite da obrišete proizvod "${deleteModal.proizvodNaziv}"? Ova akcija se ne može poništiti.`}
          confirmText="Obriši"
          cancelText="Otkaži"
          isDestructive={true}
          isLoading={isDeleting}
        />
      </div>
    </div>
  )
};

export default ProizvodPage;
