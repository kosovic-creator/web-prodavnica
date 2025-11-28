/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { getPorudzbine, deletePorudzbinu, updateStatusPorudzbine } from '@/lib/actions/porudzbine';

type Porudzbina = {
  id: string;
  korisnikId: string;
  ukupno: number;
  status: string;
  kreiran: Date;
  email: string | null;
  idPlacanja: string | null;
  korisnik: {
    id: string;
    ime: string | null;
    prezime: string | null;
    email: string;
  } | null;
  stavkePorudzbine: {
    id: string;
    kolicina: number;
    cena: number;
    proizvod: {
      id: string;
      naziv_sr: string | null;
      naziv_en: string | null;
      slika: string | null;
    };
  }[];
};

const PorudzbinePage = () => {
  const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadPorudzbine = async () => {
      setLoading(true);
      try {
        const result = await getPorudzbine();
        if (result.success && result.data) {
          setPorudzbine(
            result.data.porudzbine.map((p: any) => ({
              ...p,
              stavkePorudzbine: p.stavkePorudzbine.map((stavka: any) => ({
                ...stavka,
                proizvod: {
                  ...stavka.proizvod,
                  slika:
                    typeof stavka.proizvod.slika !== 'undefined'
                      ? stavka.proizvod.slika
                      : Array.isArray(stavka.proizvod.slike) && stavka.proizvod.slike.length > 0
                        ? stavka.proizvod.slike[0]
                        : null,
                  naziv_sr: stavka.proizvod.naziv_sr ?? null,
                  naziv_en: stavka.proizvod.naziv_en ?? null,
                },
              })),
            }))
          );
        } else {
          toast.error(result.error || 'Greška pri učitavanju porudžbina');
        }
      } catch (error) {
        console.error('Error fetching porudzbine data:', error);
        toast.error('Greška pri učitavanju porudžbina');
      } finally {
        setLoading(false);
      }
    };

    loadPorudzbine();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingStatus(id);
    startTransition(async () => {
      try {
        const result = await updateStatusPorudzbine(id, newStatus);
        if (result.success) {
          toast.success(result.message || 'Status je uspešno ažuriran');
          // Update local state
          setPorudzbine(prev =>
            prev.map(p => p.id === id ? { ...p, status: newStatus } : p)
          );
        } else {
          toast.error(result.error || 'Greška pri ažuriranju statusa');
        }
      } catch (error) {
        console.error('Error updating status:', error);
        toast.error('Greška pri ažuriranju statusa');
      } finally {
        setUpdatingStatus(null);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu porudžbinu?')) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await deletePorudzbinu(id);
        if (result.success) {
          toast.success(result.message || 'Porudžbina je uspešno obrisana');
          setPorudzbine(prev => prev.filter(p => p.id !== id));
        } else {
          toast.error(result.error || 'Greška pri brisanju porudžbine');
        }
      } catch (error) {
        console.error('Error deleting porudzbina:', error);
        toast.error('Greška pri brisanju porudžbine');
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusOptions = () => [
    { value: 'pending', label: 'Na čekanju' },
    { value: 'processing', label: 'U obradi' },
    { value: 'completed', label: 'Završeno' },
    { value: 'cancelled', label: 'Otkazano' }
  ];

  const totalRevenue = porudzbine.reduce((sum, porudzbina) => sum + porudzbina.ukupno, 0);

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
              <h1 className="text-2xl font-bold text-gray-900">Upravljanje porudžbinama</h1>
              <p className="text-gray-600 mt-1">Pregled i upravljanje svim porudžbinama</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
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
                              {porudzbina.korisnik?.ime ? porudzbina.korisnik.ime.charAt(0).toUpperCase() : 'N'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {porudzbina.korisnik?.ime || 'N/A'} {porudzbina.korisnik?.prezime || ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            {porudzbina.korisnik?.email || 'N/A'}
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
                      <select
                        value={porudzbina.status}
                        onChange={(e) => handleStatusChange(porudzbina.id, e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        disabled={updatingStatus === porudzbina.id || isPending}
                      >
                        {getStatusOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {updatingStatus === porudzbina.id && (
                        <div className="mt-1 text-xs text-blue-600">Ažurira se...</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(porudzbina.kreiran)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(porudzbina.id)}
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

          {porudzbine.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Nema porudžbina</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PorudzbinePage;