'use client';
import React, { useEffect, useState } from 'react'
import { Porudzbina } from '@/types';

const PorudzbinePage = () => {
  const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/porudzbine')
      .then(response => response.json())
      .then(data => {
        console.log('Porudzbine data:', data);
        setPorudzbine(data.porudzbine || []);
      })
      .catch(error => {
        console.error('Error fetching porudzbine data:', error);
      })
        .finally(() => setLoading(false));
  }, []);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('sr-RS', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('sr-RS', {
            style: 'currency',
            currency: 'RSD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Na čekanju' },
            'completed': { color: 'bg-green-100 text-green-800', text: 'Završeno' },
            'cancelled': { color: 'bg-red-100 text-red-800', text: 'Otkazano' },
            'processing': { color: 'bg-blue-100 text-blue-800', text: 'U obradi' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] ||
            { color: 'bg-gray-100 text-gray-800', text: status };

      return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const totalRevenue = porudzbine.reduce((sum, porudzbina) => sum + porudzbina.ukupno, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
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
                          <h1 className="text-2xl font-bold text-gray-900">Upravljanje porudžbinama</h1>
                          <p className="text-gray-600 mt-1">Pregled i upravljanje svim porudžbinama</p>
                      </div>
                      <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
                              Ukupno: {porudzbine.length}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Prihod: {formatCurrency(totalRevenue)}
                          </span>
                      </div>
                  </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center">
                          <div className="p-3 rounded-full bg-blue-100">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                          </div>
                          <div className="ml-4">
                              <p className="text-sm text-gray-600">Ukupno porudžbina</p>
                              <p className="text-2xl font-semibold text-gray-900">{porudzbine.length}</p>
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
                              <p className="text-sm text-gray-600">Ukupan prihod</p>
                              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalRevenue)}</p>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center">
                          <div className="p-3 rounded-full bg-purple-100">
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                          </div>
                          <div className="ml-4">
                              <p className="text-sm text-gray-600">Prosečna vrednost</p>
                              <p className="text-2xl font-semibold text-gray-900">
                                  {porudzbine.length > 0 ? formatCurrency(totalRevenue / porudzbine.length) : formatCurrency(0)}
                              </p>
                          </div>
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
                                      ID Porudžbine
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Kupac
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Ukupna vrednost
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Datum kreiranja
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Akcije
                                  </th>
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                              {porudzbine.map((porudzbina) => (
                                  <tr key={porudzbina.id} className="hover:bg-gray-50 transition-colors duration-200">
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="text-sm font-mono text-gray-900">
                                              #{porudzbina.id.slice(0, 8)}...
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center">
                                              <div className="flex-shrink-0 h-8 w-8">
                                                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 flex items-center justify-center">
                                                      <span className="text-xs font-medium text-white">
                                                          {porudzbina.ime ? porudzbina.ime.charAt(0).toUpperCase() : 'N'}
                                                      </span>
                                                  </div>
                                              </div>
                                              <div className="ml-3">
                                                  <div className="text-sm font-medium text-gray-900">
                                                      {porudzbina.ime} {porudzbina.prezime}
                                                  </div>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="text-sm font-semibold text-gray-900">
                                              {formatCurrency(porudzbina.ukupno)}
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          {getStatusBadge(porudzbina.status)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {formatDate(porudzbina.kreiran?.toString() || '')}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                          <button className="text-violet-600 hover:text-violet-900 mr-3">
                                              Detalji
                                          </button>
                                          <button className="text-indigo-600 hover:text-indigo-900">
                                              Izmeni
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>

                  {porudzbine.length === 0 && (
                      <div className="text-center py-12">
                          <div className="text-gray-500 text-lg">Nema porudžbina</div>
                      </div>
                  )}
              </div>
          </div>
    </div>
  )
}

export default PorudzbinePage
