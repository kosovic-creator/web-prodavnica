'use client';

import React, { useEffect, useState } from 'react';
import { getProizvodById } from '@/lib/actions/proizvodi';
import { toast } from 'react-hot-toast';
import { FaHistory, FaEdit, FaPlus, FaTrash, FaEye, FaClock } from 'react-icons/fa';

type Proizvod = {
  id: string;
  naziv_sr: string | null;
  kreiran: Date;
  azuriran: Date;
};

type HistoryEntry = {
  id: string;
  akcija: string;
  opis: string;
  datum: Date;
  korisnik: string;
  detalji?: {
    naziv?: string;
    stara_cena?: number;
    nova_cena?: number;
    stara_kolicina?: number;
    nova_kolicina?: number;
  };
};

interface HistorijaProizvodaClientProps {
  id: string;
}

export default function HistorijaProizvodaClient({ id }: HistorijaProizvodaClientProps) {
  const [proizvod, setProizvod] = useState<Proizvod | null>(null);
  const [historija, setHistorija] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const result = await getProizvodById(id);

        if (result.success && result.data) {
          setProizvod(result.data as Proizvod);

          // Mock history data - u realnoj aplikaciji bi ovo došlo iz baze
          const mockHistory: HistoryEntry[] = [
            {
              id: '1',
              akcija: 'kreiran',
              opis: 'Proizvod je kreiran',
              datum: result.data.kreiran,
              korisnik: 'Admin',
              detalji: { naziv: result.data.naziv_sr }
            },
            {
              id: '2',
              akcija: 'izmena',
              opis: 'Ažurirana cijena proizvoda',
              datum: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dana ranije
              korisnik: 'Admin',
              detalji: { stara_cena: 1500, nova_cena: 1200 }
            },
            {
              id: '3',
              akcija: 'izmena',
              opis: 'Ažurirana količina na stanju',
              datum: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dana ranije
              korisnik: 'Admin',
              detalji: { stara_kolicina: 15, nova_kolicina: 8 }
            },
            {
              id: '4',
              akcija: 'pregled',
              opis: 'Proizvod je pregledan',
              datum: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 sat ranije
              korisnik: 'Admin'
            }
          ];

          setHistorija(mockHistory.sort((a, b) => b.datum.getTime() - a.datum.getTime()));
        } else {
          toast.error(result.error || 'Greška pri učitavanju proizvoda');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Greška pri učitavanju podataka');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `prije ${diffInMinutes} minuta`;
    } else if (diffInHours < 24) {
      return `prije ${diffInHours} sati`;
    } else if (diffInDays < 30) {
      return `prije ${diffInDays} dana`;
    } else {
      return formatDate(date);
    }
  };

  const getActionIcon = (akcija: string) => {
    switch (akcija) {
      case 'kreiran':
        return <FaPlus className="w-4 h-4 text-green-600" />;
      case 'izmena':
        return <FaEdit className="w-4 h-4 text-blue-600" />;
      case 'obrisan':
        return <FaTrash className="w-4 h-4 text-red-600" />;
      case 'pregled':
        return <FaEye className="w-4 h-4 text-gray-600" />;
      default:
        return <FaHistory className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (akcija: string) => {
    switch (akcija) {
      case 'kreiran':
        return 'bg-green-100 border-green-200';
      case 'izmena':
        return 'bg-blue-100 border-blue-200';
      case 'obrisan':
        return 'bg-red-100 border-red-200';
      case 'pregled':
        return 'bg-gray-100 border-gray-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!proizvod) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-red-600">
          Proizvod nije pronađen
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <FaHistory className="text-blue-600 text-xl" />
          <h1 className="text-2xl font-bold text-gray-900">Historija proizvoda</h1>
        </div>
        <p className="text-gray-600">
          {proizvod.naziv_sr || 'Bez naziva'} • ID: {proizvod.id}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaHistory className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ukupno akcija</p>
              <p className="text-2xl font-bold text-gray-900">{historija.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaPlus className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Kreiran</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(proizvod.kreiran)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaEdit className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Poslednja izmjena</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(proizvod.azuriran)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaClock className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Izmjena</p>
              <p className="text-sm font-medium text-gray-900">
                {historija.filter(h => h.akcija === 'izmena').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chronologija aktivnosti</h2>
        </div>

        <div className="p-6">
          {historija.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaHistory className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nema historije aktivnosti</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historija.map((entry, index) => (
                <div key={entry.id} className="relative">
                  {/* Timeline line */}
                  {index < historija.length - 1 && (
                    <div className="absolute left-6 top-12 w-px h-16 bg-gray-200"></div>
                  )}

                  <div className={`flex gap-4 p-4 rounded-lg border ${getActionColor(entry.akcija)}`}>
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full border-2 border-current flex items-center justify-center">
                      {getActionIcon(entry.akcija)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900">{entry.opis}</h3>
                        <span className="text-xs text-gray-500">{getRelativeTime(entry.datum)}</span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        Izvršio: <span className="font-medium">{entry.korisnik}</span>
                      </p>

                      {/* Details */}
                      {entry.detalji && (
                        <div className="text-xs text-gray-500 bg-white bg-opacity-50 rounded px-2 py-1">
                          {entry.akcija === 'izmena' && entry.detalji.stara_cena && (
                            <span>Cijena: {entry.detalji.stara_cena}€ → {entry.detalji.nova_cena}€</span>
                          )}
                          {entry.akcija === 'izmena' && entry.detalji.stara_kolicina !== undefined && (
                            <span>Količina: {entry.detalji.stara_kolicina} → {entry.detalji.nova_kolicina}</span>
                          )}
                          {entry.akcija === 'kreiran' && entry.detalji.naziv && (
                            <span>Naziv: {entry.detalji.naziv}</span>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-gray-400 mt-2">
                        {formatDate(entry.datum)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}